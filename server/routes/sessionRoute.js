import express from "express";
import {
  getSessions,
  createSession,
  updateSession,
  deleteSession,
  completeSession,
} from "../controllers/sessionController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:userId", protect, getSessions);
router.post("/", protect, createSession);
router.put("/:id", protect, updateSession);
router.delete("/:id", protect, deleteSession);
router.put("/:id/complete", protect, completeSession);

export default router;
