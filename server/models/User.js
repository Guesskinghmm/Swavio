import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
  {
    day:  String,
    time: String,
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    fullName:  { type: String, required: true },
    email:     { type: String, required: true, unique: true },
    password:  { type: String },
    role:      { type: String, enum: ["user", "admin"], default: "user" },
    googleId:     { type: String, default: null },
    authProvider: { type: String, enum: ["local", "google"], default: "local" },

    bio:           { type: String },
    skillsToTeach: { type: [String], default: [] },
    skillsToLearn: { type: [String], default: [] },
    availability:  { type: [availabilitySchema], default: [] },
    location:      { type: String },

    averageRating: { type: Number, default: 0 },
    badges:        [String],
    rating:        { type: Number, default: 0 },
    ratingCount:   { type: Number, default: 0 },

    ratingsReceived: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: Number,
      },
    ],

    profilePicture:         { type: String, default: "/default-avatar.png" },
    profilePicturePublicId: { type: String, default: null }, // Cloudinary public_id

    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    sessionsTaught:  { type: Number, default: 0 },
    sessionsLearned: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.index({ skillsToTeach: 1, skillsToLearn: 1 });
userSchema.index({ email: 1 });

const User = mongoose.model("User", userSchema);
export default User;
