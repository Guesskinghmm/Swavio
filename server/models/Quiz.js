import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  skill: String,
  questions: [
    {
      question: String,
      options: [String],
      correctAnswer: String,
      answer: String
    }
  ],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["pending", "completed"], default: "pending" }
});

quizSchema.index({ userId: 1 });

export default mongoose.model("Quiz", quizSchema);
