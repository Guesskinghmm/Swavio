import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { sendMessage, getMessages, deleteChat } from '../controllers/messageController.js';

const router = express.Router();

// ── Multer storage (route-level middleware, not inside the controller) ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB cap
});

// Apply multer as route-level middleware so Express never consumes the
// multipart stream before multer has a chance to parse it.
router.post('/', upload.single('file'), sendMessage);
router.get('/:senderId/:receiverId', getMessages);
router.delete('/:userId/:receiverId', deleteChat);

export default router;
