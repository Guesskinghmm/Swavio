import mongoose from "mongoose";

const quizResultSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    skill: { type: String, required: true },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    answers: [
      {
        question: String,
        options: [String],
        answer: String,
        userAnswer: String,
        correct: Boolean,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("QuizResult", quizResultSchema);
