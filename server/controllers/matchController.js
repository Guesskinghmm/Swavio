import User from "../models/User.js";
import Connection from "../models/Connection.js";
import Notification from "../models/Notification.js";
import mongoose from "mongoose";

// 🔍 Find matching users based on intent (learn/teach), skill, and availability
export const findMatches = async (req, res) => {
  const { userId } = req.params;
  const { intent, skill, availability } = req.query;

  // Ownership check: user can only search for their own profile matches
  if (req.user._id.toString() !== userId.toString()) {
    return res.status(403).json({ message: "Forbidden: Cannot query matchmaking for another user." });
  }

  try {
    const currentUser = await User.findById(userId);
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    // Exclude current user AND users already connected / pending
    const existingConnections = await Connection.find({
      $or: [{ user1: userId }, { user2: userId }],
    });

    const excludedUserIds = new Set([userId.toString()]);
    existingConnections.forEach((c) => {
      excludedUserIds.add(c.user1.toString());
      excludedUserIds.add(c.user2.toString());
    });

    const query = {
      _id: { $nin: Array.from(excludedUserIds).map((id) => new mongoose.Types.ObjectId(id)) },
    };

    // Match logic
    if (intent === "learn") {
      // Learner seeks teachers
      if (skill) {
        query.skillsToTeach = { $regex: new RegExp(`^${skill}$`, "i") };
      } else if (currentUser.skillsToLearn?.length > 0) {
        query.skillsToTeach = { $in: currentUser.skillsToLearn };
      }
    } else if (intent === "teach") {
      // Teacher seeks learners
      if (skill) {
        query.skillsToLearn = { $regex: new RegExp(`^${skill}$`, "i") };
      } else if (currentUser.skillsToTeach?.length > 0) {
        query.skillsToLearn = { $in: currentUser.skillsToTeach };
      }
    }

    // Optional: Filter by availability day
    if (availability) {
      query["availability.day"] = { $regex: availability, $options: "i" };
    }

    const matches = await User.find(query).select("-password");
    res.json(matches);
  } catch (err) {
    console.error("Matchmaking error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// 🟢 Save a match request — canonical source of truth is Connection
export const createMatchRequest = async (req, res) => {
  try {
    const { user1, user2 } = req.body;

    if (!user1 || !user2) {
      return res.status(400).json({ message: "Both user1 and user2 are required" });
    }

    // Ownership check: authenticated user must be user1 (sender)
    if (req.user._id.toString() !== user1.toString()) {
      return res.status(403).json({ message: "Forbidden: Cannot send match request on behalf of another user." });
    }

    if (user1.toString() === user2.toString()) {
      return res.status(400).json({ message: "Cannot match with yourself" });
    }

    // Check if a connection or request already exists
    const exists = await Connection.findOne({
      $or: [
        { user1, user2 },
        { user1: user2, user2: user1 },
      ],
    });

    if (exists) {
      return res.status(400).json({ message: "Match or connection already exists" });
    }

    const match = await Connection.create({
      user1,
      user2,
      status: "pending",
    });

    // Create notification for user2
    const notif = await Notification.create({
      user: user2,
      type: "connection",
      message: `${req.user.fullName || "Someone"} sent you a connection request!`,
      link: "/connections",
      isRead: false,
    });

    if (req.io) {
      req.io.to(user2.toString()).emit("notification", notif);
    }

    res.status(201).json(match);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Match or connection already exists" });
    }
    console.error("createMatchRequest error:", err.message);
    res.status(500).json({ message: "Failed to create match" });
  }
};

// ❌ Delete a match / connection
export const deleteMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const conn = await Connection.findById(matchId);

    if (!conn) {
      return res.status(404).json({ message: "Match not found" });
    }

    const callerId = req.user._id.toString();
    if (conn.user1.toString() !== callerId && conn.user2.toString() !== callerId) {
      return res.status(403).json({ message: "Forbidden: Not a participant in this match." });
    }

    await Connection.findByIdAndDelete(matchId);

    // Sync User.connections
    await Promise.all([
      User.findByIdAndUpdate(conn.user1, { $pull: { connections: conn.user2 } }),
      User.findByIdAndUpdate(conn.user2, { $pull: { connections: conn.user1 } }),
    ]);

    res.status(200).json({ message: "Match deleted" });
  } catch (err) {
    console.error("deleteMatch error:", err.message);
    res.status(500).json({ message: "Failed to delete match" });
  }
};

// 📃 Get all accepted matches for a user
export const getMyMatches = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Forbidden: Cannot view another user's matches." });
    }

    // Query canonical Connection collection
    const matches = await Connection.find({
      status: "accepted",
      $or: [{ user1: userId }, { user2: userId }],
    }).populate("user1 user2", "-password");

    const myMatches = matches.map((m) =>
      m.user1._id.toString() === userId.toString() ? m.user2 : m.user1
    );

    res.json(myMatches);
  } catch (err) {
    console.error("getMyMatches error:", err.message);
    res.status(500).json({ message: "Failed to fetch matches" });
  }
};
