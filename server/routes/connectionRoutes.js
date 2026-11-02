import express from "express";
import Connection from "../models/Connection.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { onlineUsers } from "../index.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 📩 Send a connection request
router.post("/request", protect, async (req, res) => {
  try {
    const { from, to } = req.body;

    if (!from || !to) {
      return res.status(400).json({ message: "Both 'from' and 'to' user IDs are required." });
    }

    // Ownership check: authenticated user must be the sender
    if (req.user._id.toString() !== from.toString()) {
      return res.status(403).json({ message: "Forbidden: Cannot send connection requests on behalf of other users." });
    }

    if (from.toString() === to.toString()) {
      return res.status(400).json({ message: "Cannot connect with yourself." });
    }

    // Check if already connected or pending in either direction
    const exists = await Connection.findOne({
      $or: [
        { user1: from, user2: to },
        { user1: to, user2: from },
      ],
    });

    if (exists) {
      return res.status(400).json({ message: "Connection request already exists or users are already connected." });
    }

    const conn = await Connection.create({
      user1: from,
      user2: to,
      status: "pending",
    });

    const notif = await Notification.create({
      user: to,
      type: "connection",
      message: `${req.user.fullName || "Someone"} sent you a connection request!`,
      link: "/connections",
      isRead: false,
    });

    if (req.io && onlineUsers[to]) {
      req.io.to(onlineUsers[to]).emit("notification", notif);
    }

    res.status(201).json(conn);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Connection request already exists." });
    }
    console.error("Error sending connection request:", err.message);
    res.status(500).json({ message: "Error sending request" });
  }
});

// 📥 Get pending requests (received) — receiver only
router.get("/pending/:userId", protect, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Forbidden: Cannot view another user's incoming requests." });
    }

    const pending = await Connection.find({
      user2: userId,
      status: "pending",
    }).populate("user1 user2", "fullName profilePicture availability skillsToTeach skillsToLearn");

    res.json(pending);
  } catch (err) {
    console.error("Error fetching pending requests:", err.message);
    res.status(500).json({ message: "Error fetching pending requests" });
  }
});

// 📤 Get sent pending requests — sender only
router.get("/pending/sent/:userId", protect, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Forbidden: Cannot view another user's sent requests." });
    }

    const sent = await Connection.find({
      user1: userId,
      status: "pending",
    }).populate("user1 user2", "fullName profilePicture availability skillsToTeach skillsToLearn");

    res.json(sent);
  } catch (err) {
    console.error("Error fetching sent pending requests:", err.message);
    res.status(500).json({ message: "Error fetching sent pending requests" });
  }
});

// ✅ Get accepted connections — participant only
router.get("/accepted/:userId", protect, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Forbidden: Cannot view another user's connections." });
    }

    const accepted = await Connection.find({
      status: "accepted",
      $or: [{ user1: userId }, { user2: userId }],
    }).populate("user1 user2", "fullName profilePicture availability skillsToTeach skillsToLearn");

    res.json(accepted);
  } catch (err) {
    console.error("Error fetching accepted connections:", err.message);
    res.status(500).json({ message: "Error fetching accepted connections" });
  }
});

// 🟢 Accept a request — only receiver (user2) can accept
router.put("/accept/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    const conn = await Connection.findById(id);
    if (!conn) {
      return res.status(404).json({ message: "Connection not found" });
    }

    // Only the targeted recipient (user2) may accept the connection
    if (conn.user2.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden: Only the recipient can accept this connection request." });
    }

    conn.status = "accepted";
    await conn.save();

    // Maintain User.connections arrays
    await Promise.all([
      User.findByIdAndUpdate(conn.user1, { $addToSet: { connections: conn.user2 } }),
      User.findByIdAndUpdate(conn.user2, { $addToSet: { connections: conn.user1 } }),
    ]);

    const populated = await Connection.findById(id).populate(
      "user1 user2",
      "fullName profilePicture availability"
    );

    const senderId = conn.user1.toString();
    const receiverName = populated.user2.fullName || "Someone";

    const notif = await Notification.create({
      user: senderId,
      type: "connection",
      message: `${receiverName} accepted your connection request!`,
      link: "/connections",
      isRead: false,
    });

    if (req.io && onlineUsers[senderId]) {
      req.io.to(onlineUsers[senderId]).emit("notification", notif);
    }

    res.json(populated);
  } catch (err) {
    console.error("Error accepting request:", err.message);
    res.status(500).json({ message: "Error accepting request" });
  }
});

// ❌ Reject or Delete a connection — only participants can delete
router.delete("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    const conn = await Connection.findById(id);
    if (!conn) {
      return res.status(404).json({ message: "Connection not found" });
    }

    const callerId = req.user._id.toString();
    if (conn.user1.toString() !== callerId && conn.user2.toString() !== callerId) {
      return res.status(403).json({ message: "Forbidden: You are not a participant in this connection." });
    }

    await Connection.findByIdAndDelete(id);

    // Remove from User.connections if it was accepted
    await Promise.all([
      User.findByIdAndUpdate(conn.user1, { $pull: { connections: conn.user2 } }),
      User.findByIdAndUpdate(conn.user2, { $pull: { connections: conn.user1 } }),
    ]);

    res.json({ message: "Connection deleted" });
  } catch (err) {
    console.error("Error deleting connection:", err.message);
    res.status(500).json({ message: "Error deleting connection" });
  }
});

export default router;
