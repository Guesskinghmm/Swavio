import Match from "../models/Match.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { io, onlineUsers } from "../index.js"; // Make sure io is exported

// After request is created
await Notification.create({
  user: to, // The receiver
  type: "request",
  message: `📩 ${fromUserName} sent you a connection request!`,
  link: "/connections"
});

// If the user is online, emit real-time notification
if (onlineUsers[to]) {
  io.to(onlineUsers[to]).emit("new-notification", {
    type: "request",
    message: `📩 ${fromUserName} sent you a connection request!`,
    link: "/connections"
  });
}

// 📌 Send Connection Request
export const sendRequest = async (req, res) => {
  try {
    const { fromUser, toUser } = req.body;

    // Check if already exists
    const exists = await Match.findOne({
      $or: [
        { user1: fromUser, user2: toUser },
        { user1: toUser, user2: fromUser }
      ]
    });

    if (exists) return res.status(400).json({ message: "Request already sent" });

    const request = await Match.create({
      user1: fromUser,
      user2: toUser,
      status: "pending"
    });

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: "Failed to send request" });
  }
};

// 📌 Accept/Reject Request
export const updateRequest = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { status } = req.body; // "accepted" or "rejected"

    const match = await Match.findByIdAndUpdate(matchId, { status }, { new: true });
    res.json(match);
  } catch (err) {
    res.status(500).json({ message: "Failed to update request" });
  }
};

// 📌 Get My Connections (✅ FIXED: Includes name + availability)
export const getConnections = async (req, res) => {
  try {
    const { userId } = req.params;

    const connections = await Match.find({
      $or: [{ user1: userId }, { user2: userId }],
      status: "accepted"
    }).populate("user1 user2", "fullName email profilePicture availability");

    res.json(connections);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch connections" });
  }
};

// 📌 Get Pending Requests (✅ FIXED: Includes name + availability)
export const getPendingRequests = async (req, res) => {
  try {
    const { userId } = req.params;

    const requests = await Match.find({
      user2: userId,
      status: "pending"
    }).populate("user1", "fullName email profilePicture availability");

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch pending requests" });
  }
};
