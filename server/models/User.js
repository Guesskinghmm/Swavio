import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
  {
    day: String,
    time: String,
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },

    bio: { type: String },
    skillsToTeach: { type: [String], default: [] },
    skillsToLearn: { type: [String], default: [] },
    availability: { type: [availabilitySchema], default: [] },
    location: { type: String },

    averageRating: { type: Number, default: 0 },
    badges: [String],
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    ratingsReceived: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: Number,
      },
    ],

    profilePicture: { type: String, default: "/default-avatar.png" },

    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // ✅ New fields for taught & learned sessions
    sessionsTaught: { type: Number, default: 0 },
    sessionsLearned: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
