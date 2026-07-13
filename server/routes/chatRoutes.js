// server/routes/chatRoutes.js
import express from "express";
import { getOrCreateChat } from "../controllers/chatController.js";
const router = express.Router();

router.post("/", getOrCreateChat);

export default router;
