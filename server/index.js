import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import connectionRoutes from "./routes/connectionRoutes.js";
import sessionRoutes from "./routes/sessionRoute.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { scheduleSessionReminders } from "./utils/sessionReminder.js";
import videoRoutes from "./routes/videoRoutes.js";


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://swavio.vercel.app", "http://localhost:3000"], 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  },
});

// ✅ Schedule session reminders
scheduleSessionReminders(io);

// ✅ Export for use in other modules
export { io };
export const onlineUsers = {}; // Track online users

// ✅ Middleware
app.use(cors({
  origin: ["https://swavio.vercel.app", "http://localhost:3000"], 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/messages', messageRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/quizzes", quizRoutes); 
app.use("/api/notifications", notificationRoutes);
app.use("/api/connection", connectionRoutes);
app.use("/api/video", videoRoutes);


// ✅ Socket.IO Logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Track online users
  socket.on("join", (userId) => {
    onlineUsers[userId] = socket.id;
    console.log(`${userId} is online`);
  });

  // Handle direct messaging
  socket.on('sendMessage', (data) => {
    io.to(data.receiverId).emit('receiveMessage', data);

    io.to(data.receiverId).emit("notification", {
      message: `New message from ${data.senderName || "Someone"}`,
      type: "message",
      read: false,
      createdAt: new Date(),
    });
  });

  socket.on("call-ended", ({ senderId, receiverId }) => {
  if (onlineUsers[receiverId]) {
    io.to(onlineUsers[receiverId]).emit("call-ended", { senderId });
  }
});
  // Cleanup on disconnect
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
    for (const key in onlineUsers) {
      if (onlineUsers[key] === socket.id) {
        delete onlineUsers[key];
        break;
      }
    }
  });
});

// ✅ Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.error(err));
