import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import connectionRoutes from "./routes/connectionRoutes.js";
import sessionRoutes from "./routes/sessionRoute.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import { scheduleSessionReminders } from "./utils/sessionReminder.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("trust proxy", 1); // Required for rate limiter behind load balancers (e.g., Render)
const server = http.createServer(app);

const ALLOWED_ORIGINS = (
  process.env.ALLOWED_ORIGINS || "https://swavio.vercel.app,http://localhost:3000"
)
  .split(",")
  .map((origin) => origin.trim());

const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

// Schedule background session reminders
scheduleSessionReminders(io);

export { io };
export const onlineUsers = {}; // Track online user sockets

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Serve legacy local uploads folder for backward compatibility
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// ── Health / Readiness Endpoint ─────────────────────────────────────────────
app.get("/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const dbReady = dbState === 1;

  res.status(dbReady ? 200 : 503).json({
    status: dbReady ? "OK" : "DEGRADED",
    database: ["disconnected", "connected", "connecting", "disconnecting"][dbState] || "unknown",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// ── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/connection", connectionRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/contact", contactRoutes);

// ── Central Error Handling Middleware ───────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

// ── Socket.IO Logic ─────────────────────────────────────────────────────────
// Note: When running multiple backend instances in production, configure
// @socket.io/redis-adapter so events broadcast across all node clusters.
io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    onlineUsers[userId] = socket.id;
    socket.join(userId.toString());
  });

  socket.on("sendMessage", (data) => {
    if (data.receiverId) {
      io.to(data.receiverId).emit("receiveMessage", data);
      io.to(data.receiverId).emit("notification", {
        message: `New message from ${data.senderName || "Someone"}`,
        type: "message",
        read: false,
        createdAt: new Date(),
      });
    }
  });

  socket.on("video-call-invite", ({ senderId, receiverId, meetingUrl }) => {
    if (onlineUsers[receiverId]) {
      io.to(onlineUsers[receiverId]).emit("video-call-invite", { senderId, meetingUrl });
    }
  });

  socket.on("call-ended", ({ senderId, receiverId }) => {
    if (onlineUsers[receiverId]) {
      io.to(onlineUsers[receiverId]).emit("call-ended", { senderId });
    }
  });

  socket.on("disconnect", () => {
    for (const key in onlineUsers) {
      if (onlineUsers[key] === socket.id) {
        delete onlineUsers[key];
        break;
      }
    }
  });
});

// ── Start Server ────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => {
    // Avoid logging credentials
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
