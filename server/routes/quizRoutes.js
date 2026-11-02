import express from "express";
import {
  generateQuiz,
  submitQuiz,
  getLastQuiz,
  getUserQuizHistory,
  getPendingQuizzes,
} from "../controllers/quizController.js";
import { getLeaderboard } from "../controllers/leaderboardController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate", protect, generateQuiz);
router.post("/submit", protect, submitQuiz);
router.get("/last/:userId", protect, getLastQuiz);
router.get("/leaderboard", protect, getLeaderboard);
router.get("/history/:userId", protect, getUserQuizHistory);
router.get("/pending/:userId", protect, getPendingQuizzes);

export default router;
