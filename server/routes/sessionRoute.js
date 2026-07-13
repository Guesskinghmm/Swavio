import express from "express";
import {
  getSessions,
  createSession,
  updateSession,
  deleteSession,
  completeSession,
} from "../controllers/sessionController.js";

const router = express.Router();

router.get("/:userId", getSessions);
router.post("/", createSession);
router.put("/:id", updateSession);
router.delete("/:id", deleteSession);
router.put("/:id/complete", completeSession);

export default router;
