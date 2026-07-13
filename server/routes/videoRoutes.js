import express from "express";

const router = express.Router();

// Generate a random Jitsi meeting room link
router.get("/create-room", (req, res) => {
  try {
    const roomId = `Swavio-${Math.random().toString(36).substring(2, 9)}`;
    const meetingUrl = `https://meet.jit.si/${roomId}`;
    res.json({ roomId, meetingUrl });
  } catch (error) {
    console.error("Error generating Jitsi meeting:", error);
    res.status(500).json({ error: "Failed to create meeting" });
  }
});

export default router;
