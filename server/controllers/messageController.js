import Message      from '../models/Message.js';
import Notification from '../models/Notification.js';

// ── Send Message (with optional file upload) ──
// Multer runs as route-level middleware in messageRoutes.js,
// so req.file and req.body are fully parsed by the time this runs.
export const sendMessage = async (req, res) => {
  const { senderId, receiverId, text, senderName } = req.body;
  const fileUrl = req.file ? `/uploads/${req.file.filename}` : '';

  try {
    const message = await Message.create({ senderId, receiverId, text, fileUrl });

    // Create in-app notification for the receiver
    if (receiverId && senderName) {
      const notif = await Notification.create({
        user:    receiverId,
        type:    'message',
        message: `New message from ${senderName}`,
        link:    `/chat?to=${senderId}`,
      });
      req.io?.to(receiverId).emit('notification', notif);
    }

    res.status(200).json(message);
  } catch (err) {
    console.error('sendMessage error:', err);
    res.status(500).json({ message: 'Send failed', err });
  }
};

// ── Get messages between two users ──
export const getMessages = async (req, res) => {
  const { senderId, receiverId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Fetch failed', err });
  }
};

// ── Clear chat history ──
export const deleteChat = async (req, res) => {
  const { userId, receiverId } = req.params;
  try {
    await Message.deleteMany({
      $or: [
        { senderId: userId, receiverId },
        { senderId: receiverId, receiverId: userId },
      ],
    });
    res.status(200).json({ message: 'Chat cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Error clearing chat', err });
  }
};
