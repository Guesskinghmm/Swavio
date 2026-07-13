import express from "express";
import Connection from "../models/Connection.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { onlineUsers } from "../index.js";

const router = express.Router();

// 📩 Send a connection request (with DB Notification + Real-time)
router.post("/request", async (req, res) => {
  try {
    const { from, to } = req.body;

    // Check if already connected or pending
    const exists = await Connection.findOne({
      $or: [
        { user1: from, user2: to },
        { user1: to, user2: from },
      ],
    });
    if (exists) {
      return res.status(400).json({ message: "Already connected or pending" });
    }

    const conn = await Connection.create({
      user1: from,
      user2: to,
      status: "pending",
    });

    const notif = await Notification.create({
      user: to,
      type: "connection",
      message: "You received a new connection request!",
      link: "/connections",
      isRead: false,
    });

    // ✅ Send real-time notification
    if (req.io && onlineUsers[to]) {
      req.io.to(onlineUsers[to]).emit("notification", notif);
    }

    res.status(201).json(conn);
  } catch (err) {
    console.error("Error sending request:", err);
    res.status(500).json({ message: "Error sending request" });
  }
});

// 📥 Get pending requests (received)
router.get("/pending/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const pending = await Connection.find({
      user2: userId,
      status: "pending",
    }).populate("user1 user2", "fullName email profilePicture availability");
    res.json(pending);
  } catch (err) {
    console.error("Error fetching pending requests:", err);
    res.status(500).json({ message: "Error fetching pending requests" });
  }
});

// 📤 Get sent pending requests
router.get("/pending/sent/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const sent = await Connection.find({
      user1: userId,
      status: "pending",
    }).populate("user1 user2", "fullName email profilePicture availability");
    res.json(sent);
  } catch (err) {
    console.error("Error fetching sent pending requests:", err);
    res.status(500).json({ message: "Error fetching sent pending requests" });
  }
});

// ✅ Get accepted connections
router.get("/accepted/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const accepted = await Connection.find({
      status: "accepted",
      $or: [{ user1: userId }, { user2: userId }],
    }).populate("user1 user2", "fullName email profilePicture availability");

    res.json(accepted);
  } catch (err) {
    console.error("Error fetching accepted connections:", err);
    res.status(500).json({ message: "Error fetching accepted connections" });
  }
});

// 🟢 Accept a request (✔️ fixed version)
router.put("/accept/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Step 1: update status
    await Connection.findByIdAndUpdate(id, { status: "accepted" });

    // Step 2: fetch with populated users
    const conn = await Connection.findById(id).populate(
      "user1 user2",
      "fullName email profilePicture availability"
    );

    if (!conn) return res.status(404).json({ message: "Connection not found" });

    const senderId = conn.user1._id.toString();
    const receiverName = conn.user2.fullName;

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

    res.json(conn);
  } catch (err) {
    console.error("Error accepting request:", err);
    res.status(500).json({ message: "Error accepting request" });
  }
});

// ❌ Reject/Delete a connection
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Connection.findByIdAndDelete(id);
    res.json({ message: "Connection deleted" });
  } catch (err) {
    console.error("Error deleting connection:", err);
    res.status(500).json({ message: "Error deleting connection" });
  }
});

export default router;
