import express from "express";
import { upload } from "../middleware/uploadMiddleware.js";

// ✅ Get all users
router.get("/", getAllUsers);

// ✅ Get logged-in user's profile
router.get("/profile/:userId", auth, getUserProfile);

// ✅ Get user by ID (must be after /profile)
router.get("/:id", auth, getUserById);

// ✅ Rate user
router.post("/rate/:userId", auth, rateUser);

// ✅ Update user with image upload
router.put("/:userId", auth, upload.single("profilePicture"), updateUserProfile);

// ✅ Update user without file upload (quick edit)
router.put("/edit/:id", auth, async (req, res) => {
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
router.delete("/profile-picture/:userId", auth, deleteProfilePicture);

export default router;
