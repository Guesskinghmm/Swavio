import express from "express";
import multer from "multer";
import path from "path";
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

// ✅ Multer config with file size limit
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
});

// ✅ Get all users
router.get("/", getAllUsers);

// ✅ Get logged-in user's profile
router.get("/profile/:userId", getUserProfile);

// ✅ Get user by ID (must be after /profile)
router.get("/:id", getUserById);

// ✅ Rate user
router.post("/rate/:userId", auth, rateUser);

// ✅ Update user with image upload
router.put("/:userId", upload.single("profilePicture"), updateUserProfile);

// ✅ Update user without file upload (quick edit)
router.put("/edit/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error updating profile" });
  }
});

// ✅ Delete profile picture
router.delete("/profile-picture/:userId", deleteProfilePicture);

export default router;
