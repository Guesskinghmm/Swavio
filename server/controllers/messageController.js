import Message from '../models/Message.js';
import Notification from "../models/Notification.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ✅ File Storage Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage }).single('file');

// ✅ Send Message (with optional file) + Notification
export const sendMessage = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(500).json({ message: 'Upload error', err });

    const { senderId, receiverId, text, senderName } = req.body; // ✅ Added senderName
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : '';

    try {
      // ✅ Save Message
      const message = await Message.create({
        senderId,
        receiverId,
        text,
        fileUrl
      });

      // ✅ Create Notification (only if both IDs exist)
      if (receiverId && senderName) {
        const notif = await Notification.create({
          user: receiverId,
          type: "message",
          message: `New message from ${senderName}`,
          link: `/chat?to=${senderId}`,
        });

        // ✅ Emit notification in real-time
        req.io?.to(receiverId).emit("notification", notif);
      }

      res.status(200).json(message);
    } catch (err) {
      res.status(500).json({ message: 'Send failed', err });
    }
  });
};

// ✅ Get Messages Between Two Users
export const getMessages = async (req, res) => {
  const { senderId, receiverId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }).sort({ createdAt: 1 }); // oldest to newest
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Fetch failed', err });
  }
};

// ✅ Clear Chat History
export const deleteChat = async (req, res) => {
  const { userId, receiverId } = req.params;

  try {
    await Message.deleteMany({
      $or: [
        { senderId: userId, receiverId },
        { senderId: receiverId, receiverId: userId }
      ]
    });
    res.status(200).json({ message: 'Chat cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing chat', error });
  }
};
