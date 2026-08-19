import express from 'express';
import { sendMessage, getMessages, deleteChat, markMessagesAsRead } from '../controllers/messageController.js';

import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Apply multer as route-level middleware so Express never consumes the
// multipart stream before multer has a chance to parse it.
router.post('/', protect, upload.single('file'), sendMessage);
router.get('/:senderId/:receiverId', protect, getMessages);
router.delete('/:userId/:receiverId', protect, deleteChat);
router.put('/:senderId/:receiverId/read', protect, markMessagesAsRead);

export default router;
