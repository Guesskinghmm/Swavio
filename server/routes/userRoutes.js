import express from "express";
import { uploadProfile, handleUploadError } from "../middleware/uploadMiddleware.js";
import {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  getUserById,
  rateUser,
  deleteProfilePicture,
} from "../controllers/userController.js";
import { protect as auth } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

// ✅ Get all users (for search/discovery)
router.get("/", getAllUsers);

// ✅ Get logged-in user's profile
router.get("/profile/:userId", auth, getUserProfile);

// ✅ Get user by ID (must be after /profile)
router.get("/:id", auth, getUserById);

// ✅ Rate user
router.post("/rate/:userId", auth, rateUser);

// ✅ Update user with image upload — ownership checked in updateUserProfile
router.put(
  "/:userId",
  auth,
  uploadProfile.single("profilePicture"),
  handleUploadError,
  updateUserProfile
);

// ✅ Update user without file upload (quick edit) — strictly check ownership
router.put("/edit/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Ownership check: user cannot edit another user's profile
    if (req.user._id.toString() !== id.toString()) {
      return res.status(403).json({ message: "Forbidden: Cannot edit another user's profile." });
    }

    // Disallow overriding password or role through quick edit
    const safeUpdate = { ...req.body };
    delete safeUpdate.password;
    delete safeUpdate.role;

    const user = await User.findByIdAndUpdate(id, safeUpdate, {
      new: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error updating profile in /edit/:id:", err.message);
    res.status(500).json({ message: "Error updating profile" });
  }
});

// ✅ Delete profile picture — ownership checked in deleteProfilePicture
router.delete("/profile-picture/:userId", auth, deleteProfilePicture);

export default router;
