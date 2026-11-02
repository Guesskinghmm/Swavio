import express from "express";
import {
  sendMessage,
  getMessages,
  deleteChat,
  markMessagesAsRead,
} from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload, handleUploadError } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/", protect, upload.single("file"), handleUploadError, sendMessage);
router.get("/:senderId/:receiverId", protect, getMessages);
router.delete("/:userId/:receiverId", protect, deleteChat);
router.put("/:senderId/:receiverId/read", protect, markMessagesAsRead);

export default router;
