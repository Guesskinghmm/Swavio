import express from "express";
import Notification from "../models/Notification.js";

const router = express.Router();

// ✅ Get all notifications for a user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

// ✅ Mark single notification as read
router.put("/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    const notif = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
    res.json(notif);
  } catch (err) {
    res.status(500).json({ message: "Error updating notification" });
  }
});

// ✅ Mark all notifications as read
router.put("/:userId/read-all", async (req, res) => {
  try {
    const { userId } = req.params;
    await Notification.updateMany({ user: userId }, { isRead: true });
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Error updating notifications" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Error deleting notification" });
  }
});

router.delete("/:userId/clear", async (req, res) => {
  try {
    const { userId } = req.params;
    await Notification.deleteMany({ user: userId });
    res.json({ message: "All notifications deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting notifications" });
  }
});

export default router;
