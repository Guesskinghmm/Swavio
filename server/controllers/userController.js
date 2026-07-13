import User from "../models/User.js";
import Session from "../models/sessionModel.js";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

// 🔹 Helper for Badge Calculation
const getBadgeData = (sessionCount, skillsToTeach, skillsToLearn, rating) => {
  const sessionBadge =
    sessionCount >= 20
      ? "🚀 Skill Master"
      : sessionCount >= 10
      ? "🏆 Pro Learner"
      : sessionCount >= 5
      ? "🔥 Active Learner"
      : sessionCount >= 1
      ? "🎯 Beginner"
      : null;

  const teachBadge =
    skillsToTeach?.length >= 5
      ? "🌟 Expert Mentor"
      : skillsToTeach?.length >= 3
      ? "🧑‍🏫 Mentor"
      : skillsToTeach?.length >= 1
      ? "📚 Knowledge Sharer"
      : null;

  const learnBadge =
    skillsToLearn?.length >= 5
      ? "🚀 Master Learner"
      : skillsToLearn?.length >= 3
      ? "📈 Growing Learner"
      : skillsToLearn?.length >= 1
      ? "🎓 New Learner"
      : null;

  const ratingBadge =
    rating >= 4.5 ? "🌟 Top Rated" : rating >= 3.5 ? "👍 Good Mentor" : null;

  const achievementLevel =
    sessionCount >= 20
      ? "Level 4"
      : sessionCount >= 10
      ? "Level 3"
      : sessionCount >= 5
      ? "Level 2"
      : sessionCount >= 1
      ? "Level 1"
      : "Level 0";

  return {
    badges: [sessionBadge, teachBadge, learnBadge, ratingBadge].filter(Boolean),
    achievementLevel,
  };
};

// ✅ Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("❌ Error in getUserById:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get detailed user profile
export const getUserProfile = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ error: "Invalid userId format" });
    }

    const user = await User.findById(req.params.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const sessionCount = await Session.countDocuments({
      $or: [{ teacherId: req.params.userId }, { studentId: req.params.userId }],
    });

    const { badges, achievementLevel } = getBadgeData(
      sessionCount,
      user.skillsToTeach,
      user.skillsToLearn,
      user.rating
    );

    res.json({
      ...user.toObject(),
      sessionCount: user.sessionsTaught + user.sessionsLearned,
      sessionsTaught: user.sessionsTaught,
      sessionsLearned: user.sessionsLearned,
      badges,
      achievementLevel,
    });
  } catch (err) {
    console.error("❌ getUserProfile ERROR:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// ✅ Get All Users (for search page)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(
      {},
      "_id fullName bio skillsToTeach rating profilePicture"
    );
    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// ✅ Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId format" });
    }

    let { fullName, bio, skillsToTeach, skillsToLearn, availability, location, profilePicture } =
      req.body;

    // Ensure arrays are parsed correctly
    if (typeof skillsToTeach === "string") {
      try { skillsToTeach = JSON.parse(skillsToTeach); } 
      catch { skillsToTeach = skillsToTeach.split(",").map((s) => s.trim()); }
    }
    if (typeof skillsToLearn === "string") {
      try { skillsToLearn = JSON.parse(skillsToLearn); } 
      catch { skillsToLearn = skillsToLearn.split(",").map((s) => s.trim()); }
    }
    if (typeof availability === "string") {
      try { availability = JSON.parse(availability); } 
      catch { availability = []; }
    }

    const updateFields = {
      fullName,
      bio,
      skillsToTeach,
      skillsToLearn,
      availability,
      location,
    };

    // ✅ Profile Picture Handling
    if (req.file) {
      updateFields.profilePicture = `/uploads/${req.file.filename}`;
    } else if (profilePicture && profilePicture.startsWith("data:image")) {
      const base64Data = profilePicture.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const filename = `uploads/${Date.now()}-profile.png`;
      fs.writeFileSync(filename, buffer);
      updateFields.profilePicture = `/${filename}`;
    } else if (profilePicture) {
      updateFields.profilePicture = profilePicture;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
    }).select("-password");

    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    const sessionCount = await Session.countDocuments({
      $or: [{ teacherId: userId }, { studentId: userId }],
    });

    const { badges, achievementLevel } = getBadgeData(
      sessionCount,
      updatedUser.skillsToTeach,
      updatedUser.skillsToLearn,
      updatedUser.rating
    );

    res.json({
      ...updatedUser.toObject(),
      sessionCount,
      badges,
      achievementLevel,
    });
  } catch (err) {
    console.error("❌ Profile update error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// ✅ Delete Profile Picture
export const deleteProfilePicture = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Delete file if it exists and is not default
    if (user.profilePicture && !user.profilePicture.includes("default-avatar.png")) {
      const filePath = path.join(process.cwd(), user.profilePicture);
      fs.unlink(filePath, (err) => {
        if (err) console.error("❌ Failed to delete file:", err);
      });
    }

    user.profilePicture = "/default-avatar.png";
    await user.save();

    res.json({ message: "Profile picture deleted successfully", user });
  } catch (err) {
    console.error("❌ Error deleting profile picture:", err);
    res.status(500).json({ message: "Failed to delete profile picture" });
  }
};

// ✅ Rate User
export const rateUser = async (req, res) => {
  try {
    const { rating } = req.body;
    const raterId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ error: "Invalid userId format" });
    }
    if (req.params.userId === raterId) {
      return res.status(400).json({ error: "You cannot rate yourself" });
    }

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const existingRating = user.ratingsReceived.find(
      (r) => r.userId.toString() === raterId
    );

    if (existingRating) existingRating.rating = rating;
    else user.ratingsReceived.push({ userId: raterId, rating });

    const totalRatings = user.ratingsReceived.reduce(
      (sum, r) => sum + r.rating,
      0
    );
    user.ratingCount = user.ratingsReceived.length;
    user.rating = totalRatings / user.ratingCount;

    await user.save();

    const sessionCount = await Session.countDocuments({
      $or: [{ teacherId: req.params.userId }, { studentId: req.params.userId }],
    });

    const { badges, achievementLevel } = getBadgeData(
      sessionCount,
      user.skillsToTeach,
      user.skillsToLearn,
      user.rating
    );

    res.json({
      message: "Rating submitted successfully",
      newRating: user.rating,
      ratingCount: user.ratingCount,
      badges,
      achievementLevel,
    });
  } catch (err) {
    console.error("❌ Rating error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};
