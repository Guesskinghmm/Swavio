// server/routes/chatRoutes.js
import express from "express";
import { accessChat, getUserChats } from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/", protect, accessChat);
router.get("/:userId", protect, getUserChats);

export default router;
