import express from "express";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Get all notifications for a user — owner only
router.get("/:userId", protect, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Forbidden: Cannot view another user's notifications." });
    }

    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err.message);
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

// ✅ Mark single notification as read — owner only
router.put("/:id/read", protect, async (req, res) => {
  try {
    const { id } = req.params;

    const notif = await Notification.findById(id);
    if (!notif) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notif.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden: Cannot modify another user's notification." });
    }

    notif.isRead = true;
    await notif.save();

    res.json(notif);
  } catch (err) {
    console.error("Error updating notification:", err.message);
    res.status(500).json({ message: "Error updating notification" });
  }
});

// ✅ Mark all notifications as read — owner only
router.put("/:userId/read-all", protect, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Forbidden: Cannot modify another user's notifications." });
    }

    await Notification.updateMany({ user: userId }, { isRead: true });
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("Error updating all notifications:", err.message);
    res.status(500).json({ message: "Error updating notifications" });
  }
});

// ✅ Delete single notification — owner only
router.delete("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    const notif = await Notification.findById(id);
    if (!notif) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notif.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden: Cannot delete another user's notification." });
    }

    await Notification.findByIdAndDelete(id);
    res.json({ success: true, message: "Notification deleted" });
  } catch (err) {
    console.error("Error deleting notification:", err.message);
    res.status(500).json({ message: "Error deleting notification" });
  }
});

// ✅ Clear all notifications for a user — owner only
router.delete("/:userId/clear", protect, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Forbidden: Cannot clear another user's notifications." });
    }

    await Notification.deleteMany({ user: userId });
    res.json({ message: "All notifications deleted" });
  } catch (err) {
    console.error("Error clearing notifications:", err.message);
    res.status(500).json({ message: "Error deleting notifications" });
  }
});

export default router;
