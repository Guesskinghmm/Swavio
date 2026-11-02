import User    from "../models/User.js";
import Session from "../models/sessionModel.js";
import mongoose from "mongoose";
import { cloudinary } from "../middleware/uploadMiddleware.js";

// 🔹 Helper for Badge Calculation
const getBadgeData = (sessionCount, skillsToTeach, skillsToLearn, rating) => {
  const sessionBadge =
    sessionCount >= 20 ? "🚀 Skill Master"
    : sessionCount >= 10 ? "🏆 Pro Learner"
    : sessionCount >= 5  ? "🔥 Active Learner"
    : sessionCount >= 1  ? "🎯 Beginner"
    : null;

  const teachBadge =
    skillsToTeach?.length >= 5 ? "🌟 Expert Mentor"
    : skillsToTeach?.length >= 3 ? "🧑‍🏫 Mentor"
    : skillsToTeach?.length >= 1 ? "📚 Knowledge Sharer"
    : null;

  const learnBadge =
    skillsToLearn?.length >= 5 ? "🚀 Master Learner"
    : skillsToLearn?.length >= 3 ? "📈 Growing Learner"
    : skillsToLearn?.length >= 1 ? "🎓 New Learner"
    : null;

  const ratingBadge =
    rating >= 4.5 ? "🌟 Top Rated"
    : rating >= 3.5 ? "👍 Good Mentor"
    : null;

  const achievementLevel =
    sessionCount >= 20 ? "Level 4"
    : sessionCount >= 10 ? "Level 3"
    : sessionCount >= 5  ? "Level 2"
    : sessionCount >= 1  ? "Level 1"
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
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid user ID" });

    const user = await User.findById(id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("❌ Error in getUserById:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get detailed user profile
export const getUserProfile = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId))
      return res.status(400).json({ error: "Invalid userId format" });

    const user = await User.findById(req.params.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const sessionCount = await Session.countDocuments({
      $or: [{ teacherId: req.params.userId }, { studentId: req.params.userId }],
    });

    const { badges, achievementLevel } = getBadgeData(
      sessionCount, user.skillsToTeach, user.skillsToLearn, user.rating
    );

    res.json({
      ...user.toObject(),
      sessionCount:    user.sessionsTaught + user.sessionsLearned,
      sessionsTaught:  user.sessionsTaught,
      sessionsLearned: user.sessionsLearned,
      badges,
      achievementLevel,
    });
  } catch (err) {
    console.error("❌ getUserProfile ERROR:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Get All Users (for search page) — no auth required
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(
      {},
      "_id fullName bio skillsToTeach rating profilePicture"
    );
    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err.message);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// ✅ Update user profile — owner only
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ error: "Invalid userId format" });

    // Ownership check
    if (req.user._id.toString() !== userId)
      return res.status(403).json({ error: "Forbidden: cannot edit another user's profile." });

    let { fullName, bio, skillsToTeach, skillsToLearn, availability, location, profilePicture } =
      req.body;

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

    const updateFields = { fullName, bio, skillsToTeach, skillsToLearn, availability, location };

    if (req.file) {
      // Cloudinary upload via multer-storage-cloudinary
      updateFields.profilePicture         = req.file.path;     // Full HTTPS URL
      updateFields.profilePicturePublicId = req.file.filename;  // public_id
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
      sessionCount, updatedUser.skillsToTeach, updatedUser.skillsToLearn, updatedUser.rating
    );

    res.json({ ...updatedUser.toObject(), sessionCount, badges, achievementLevel });
  } catch (err) {
    console.error("❌ Profile update error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Delete Profile Picture — owner only; uses Cloudinary deletion
export const deleteProfilePicture = async (req, res) => {
  try {
    const { userId } = req.params;

    // Ownership check
    if (req.user._id.toString() !== userId)
      return res.status(403).json({ message: "Forbidden: cannot modify another user's profile." });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const currentPic = user.profilePicture || "";
    const publicId   = user.profilePicturePublicId;

    // Attempt Cloudinary deletion if we have a public_id or if the URL is a Cloudinary URL
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
      } catch (cloudErr) {
        // Log but don't fail — DB update proceeds regardless
        console.warn("⚠️  Cloudinary deletion warning:", cloudErr.message);
      }
    } else if (currentPic.includes("cloudinary.com")) {
      // Legacy: extract public_id from URL and try deletion
      try {
        const parts    = currentPic.split("/upload/");
        const withVer  = parts[1] || "";
        const noExt    = withVer.replace(/\.[^/.]+$/, "").replace(/^v\d+\//, "");
        await cloudinary.uploader.destroy(noExt, { resource_type: "image" });
      } catch (cloudErr) {
        console.warn("⚠️  Legacy Cloudinary deletion warning:", cloudErr.message);
      }
    }
    // Local /uploads/… files: no filesystem access in production; simply remove DB reference

    user.profilePicture         = "/default-avatar.png";
    user.profilePicturePublicId = null;
    await user.save();

    res.json({ message: "Profile picture deleted successfully", user });
  } catch (err) {
    console.error("❌ Error deleting profile picture:", err.message);
    res.status(500).json({ message: "Failed to delete profile picture" });
  }
};

// ✅ Rate User
export const rateUser = async (req, res) => {
  try {
    const { rating } = req.body;
    const raterId    = req.user._id.toString();

    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    if (!mongoose.Types.ObjectId.isValid(req.params.userId))
      return res.status(400).json({ error: "Invalid userId format" });
    if (req.params.userId === raterId)
      return res.status(400).json({ error: "You cannot rate yourself" });

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const existingRating = user.ratingsReceived.find(
      (r) => r.userId.toString() === raterId
    );
    if (existingRating) existingRating.rating = rating;
    else user.ratingsReceived.push({ userId: raterId, rating });

    const totalRatings = user.ratingsReceived.reduce((sum, r) => sum + r.rating, 0);
    user.ratingCount   = user.ratingsReceived.length;
    user.rating        = totalRatings / user.ratingCount;
    await user.save();

    const sessionCount = await Session.countDocuments({
      $or: [{ teacherId: req.params.userId }, { studentId: req.params.userId }],
    });

    const { badges, achievementLevel } = getBadgeData(
      sessionCount, user.skillsToTeach, user.skillsToLearn, user.rating
    );

    res.json({
      message:    "Rating submitted successfully",
      newRating:  user.rating,
      ratingCount: user.ratingCount,
      badges,
      achievementLevel,
    });
  } catch (err) {
    console.error("❌ Rating error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};
