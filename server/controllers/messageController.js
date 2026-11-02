import Message      from '../models/Message.js';
import Notification from '../models/Notification.js';

// ── Send Message (with optional Cloudinary file upload) ──────────────────────
export const sendMessage = async (req, res) => {
  const { senderId, receiverId, text, senderName } = req.body;

  // Authorization: only the authenticated user may send as themselves
  if (req.user._id.toString() !== senderId) {
    return res.status(403).json({ message: 'Forbidden: cannot send messages on behalf of another user.' });
  }

  // Build file metadata from Cloudinary (or nothing if no file attached)
  let fileUrl      = '';
  let filePublicId = '';
  let mimeType     = '';
  let resourceType = '';
  let originalName = '';

  if (req.file) {
    // multer-storage-cloudinary populates req.file.path with the secure delivery URL
    fileUrl      = req.file.path;           // Full Cloudinary HTTPS URL
    filePublicId = req.file.filename;       // Cloudinary public_id
    mimeType     = req.file.mimetype || '';
    resourceType = req.file.resource_type || (req.file.path?.includes('/video/') ? 'video' : 'image');
    originalName = req.file.originalname || '';
  }

  try {
    const message = await Message.create({
      senderId,
      receiverId,
      text,
      fileUrl,
      filePublicId,
      mimeType,
      resourceType,
      originalName,
    });

    // In-app notification for the receiver
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
    console.error('sendMessage error:', err.message);
    res.status(500).json({ message: 'Send failed' });
  }
};

// ── Get messages between two users ───────────────────────────────────────────
export const getMessages = async (req, res) => {
  const { senderId, receiverId } = req.params;
  const callerId = req.user._id.toString();

  // Only the two participants may read the conversation
  if (callerId !== senderId && callerId !== receiverId) {
    return res.status(403).json({ message: 'Forbidden: not a participant in this conversation.' });
  }

  try {
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error('getMessages error:', err.message);
    res.status(500).json({ message: 'Fetch failed' });
  }
};

// ── Clear chat history ───────────────────────────────────────────────────────
export const deleteChat = async (req, res) => {
  const { userId, receiverId } = req.params;
  const callerId = req.user._id.toString();

  if (callerId !== userId && callerId !== receiverId) {
    return res.status(403).json({ message: 'Forbidden: not a participant in this conversation.' });
  }

  try {
    await Message.deleteMany({
      $or: [
        { senderId: userId,     receiverId },
        { senderId: receiverId, receiverId: userId },
      ],
    });
    res.status(200).json({ message: 'Chat cleared' });
  } catch (err) {
    console.error('deleteChat error:', err.message);
    res.status(500).json({ message: 'Error clearing chat' });
  }
};

// ── Mark all messages from sender to receiver as read ─────────────────────────
export const markMessagesAsRead = async (req, res) => {
  const { senderId, receiverId } = req.params;
  const callerId = req.user._id.toString();

  if (callerId !== receiverId && callerId !== senderId) {
    return res.status(403).json({ message: 'Forbidden: not a participant in this conversation.' });
  }

  try {
    await Message.updateMany(
      { senderId, receiverId, read: false },
      { read: true }
    );
    await Notification.updateMany(
      { user: receiverId, type: 'message', link: `/chat?to=${senderId}`, isRead: false },
      { isRead: true }
    );
    res.status(200).json({ message: 'Messages and notifications marked as read' });
  } catch (err) {
    console.error('markMessagesAsRead error:', err.message);
    res.status(500).json({ message: 'Failed to mark messages as read' });
  }
};
