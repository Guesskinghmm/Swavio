import express from "express";
import jwt from "jsonwebtoken";
import { protect } from "../middleware/authMiddleware.js";
import Connection from "../models/Connection.js";
import Session from "../models/sessionModel.js";

const router = express.Router();

/**
 * GET /api/video/create-room
 * Requires a valid JWT (protect middleware).
 * Optionally verifies accepted connection or session with receiverId.
 * Returns a Jitsi 8x8.vc room URL with a signed JWT.
 * The signed URL is NOT logged to prevent token exposure.
 */
router.get("/create-room", protect, async (req, res) => {
  try {
    if (!process.env.JITSI_PRIVATE_KEY || !process.env.JITSI_TENANT || !process.env.JITSI_KID) {
      return res.status(503).json({ error: "Video call service is not configured." });
    }

    const { receiverId } = req.query;
    const userId = req.user._id;

    // Optional verification: if receiverId is supplied, confirm relation
    if (receiverId) {
      const hasConnection = await Connection.findOne({
        status: "accepted",
        $or: [
          { user1: userId, user2: receiverId },
          { user1: receiverId, user2: userId },
        ],
      });

      const hasSession = await Session.findOne({
        status: { $in: ["pending", "completed"] },
        $or: [
          { teacherId: userId, studentId: receiverId },
          { teacherId: receiverId, studentId: userId },
        ],
      });

      if (!hasConnection && !hasSession) {
        return res.status(403).json({
          error: "Forbidden: Video calls require an accepted connection or scheduled session with this user.",
        });
      }
    }

    const roomId = `Swavio-${Math.random().toString(36).substring(2, 9)}`;
    const privateKey = process.env.JITSI_PRIVATE_KEY.replace(/\\n/g, "\n");

    const payload = {
      aud: "jitsi",
      iss: "chat",
      sub: process.env.JITSI_TENANT,
      room: "*",
      context: {
        user: {
          id: userId.toString(),
          name: req.user.fullName || "Swavio User",
        },
        features: {
          livestreaming: true,
          recording: true,
        },
      },
    };

    const token = jwt.sign(payload, privateKey, {
      algorithm: "RS256",
      keyid: process.env.JITSI_KID,
      expiresIn: "2h",
    });

    const meetingUrl = `https://8x8.vc/${process.env.JITSI_TENANT}/${roomId}?jwt=${token}`;

    // Safely log room creation without exposing signed URL or private key
    console.log(`[video] Secure room created: ${roomId} by user ${userId}`);

    res.json({ roomId, meetingUrl });
  } catch (error) {
    console.error("Error generating Jitsi JWT:", error.message);
    res.status(500).json({ error: "Failed to create secure meeting" });
  }
});

export default router;
