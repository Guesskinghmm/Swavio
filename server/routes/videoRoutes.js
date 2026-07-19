import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/create-room", (req, res) => {
  try {
    const roomId = `Swavio-${Math.random().toString(36).substring(2, 9)}`;

    // 1. Format the private key correctly from Render
    const privateKey = process.env.JITSI_PRIVATE_KEY.replace(/\\n/g, '\n');
    
    // 2. Set up the Jitsi Payload
    const payload = {
      aud: "jitsi",
      iss: "chat",
      sub: process.env.JITSI_TENANT, 
      room: "*",
      context: {
        features: {
          livestreaming: true,
          recording: true
        }
      }
    };

    // 3. Sign the token using your KID and Private Key
    const token = jwt.sign(payload, privateKey, {
      algorithm: "RS256",
      keyid: process.env.JITSI_KID,
      expiresIn: "2h" // Token expires in 2 hours
    });

    // Append the secure JWT directly to the URL as a query parameter
    const meetingUrl = `https://8x8.vc/${process.env.JITSI_TENANT}/${roomId}?jwt=${token}`;

    // Send it to the frontend
    res.json({ roomId, meetingUrl });
  } catch (error) {
    console.error("Error generating Jitsi JWT:", error);
    res.status(500).json({ error: "Failed to create secure meeting" });
  }
});

export default router;