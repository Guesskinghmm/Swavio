import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  skill: String,
  questions: [
    {
      question: String,
      options: [String],
      answer: String
    }
  ]
});

export default mongoose.model("Quiz", quizSchema);
