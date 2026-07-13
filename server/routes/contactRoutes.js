import express from "express";
import ContactMessage from "../models/ContactMessage.js";

const router = express.Router();

// ✅ Submit a contact form
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newMessage = await ContactMessage.create({ name, email, message });

    res.status(201).json({
      message: "Your message has been sent successfully!",
      data: newMessage,
    });
  } catch (err) {
    console.error("Error saving contact message:", err);
    res.status(500).json({ message: "Server error while sending message" });
  }
});

// ✅ Get all messages (Admin only)
router.get("/", async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Error fetching messages" });
  }
});

export default router;
