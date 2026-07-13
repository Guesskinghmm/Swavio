// routes/matchRoutes.js
import express from "express";
import { findMatches, createMatchRequest, deleteMatch, getMyMatches } from "../controllers/matchController.js";

const router = express.Router();
router.get("/:userId", findMatches);
router.post("/", createMatchRequest);
router.delete("/:matchId", deleteMatch);
router.get("/my/:userId", getMyMatches);
export default router;
