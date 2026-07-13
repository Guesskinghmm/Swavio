import express from "express";
import {
  generateQuiz,
  submitQuiz,
  getLastQuiz,
  getUserQuizHistory
} from "../controllers/quizController.js";
import { getLeaderboard } from "../controllers/leaderboardController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate", generateQuiz);
router.post("/submit", submitQuiz);
router.get("/last/:userId", getLastQuiz);
router.get("/leaderboard", getLeaderboard);
router.get("/history/:userId", getUserQuizHistory);

export default router;
