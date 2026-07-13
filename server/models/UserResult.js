import mongoose from "mongoose";

const userResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  skill: String,
  score: Number,
  total: Number,
  date: { type: Date, default: Date.now },
  badgeAwarded: String,
});

export default mongoose.model("UserResult", userResultSchema);
