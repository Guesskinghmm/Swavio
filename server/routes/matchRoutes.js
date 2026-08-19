// routes/matchRoutes.js
import express from "express";
import { findMatches, createMatchRequest, deleteMatch, getMyMatches } from "../controllers/matchController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/:userId", protect, findMatches);
router.post("/", protect, createMatchRequest);
router.delete("/:matchId", protect, deleteMatch);
router.get("/my/:userId", protect, getMyMatches);
export default router;
