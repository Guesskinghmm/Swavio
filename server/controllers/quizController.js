import { Ollama } from "ollama";
import { jsonrepair } from "jsonrepair";

// ✅ Read host from env — default is Ollama's standard port 11434
const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
const ollama = new Ollama({ host: OLLAMA_HOST });
console.log(`🤖 Ollama client initialised at ${OLLAMA_HOST}`);

import QuizResult from "../models/QuizResult.js";
import User from "../models/User.js";

export const generateQuiz = async (req, res) => {
  try {
    const { skill } = req.body;
    if (!skill) return res.status(400).json({ error: "Skill is required" });

    const prompt = `Generate EXACTLY 5 multiple-choice questions about ${skill}.
Respond ONLY in JSON (no extra text), in this format:
[
  {
    "question": "What is ...?",
    "correctAnswer": "Correct Option",
    "wrongAnswers": ["Wrong1", "Wrong2", "Wrong3"]
  }
]`;

    const aiResult = await ollama.chat({
      model: "gemma:2b",
      messages: [{ role: "user", content: prompt }],
    });

    let content = aiResult.message?.content?.trim() || "";
    content = content.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(jsonrepair(content)); // fixes missing brackets/quotes
    } catch (err) {
      console.error("❌ JSON Parse Error (after repair):", content);
      return res.json([]);
    }

    const quizData = parsed
      .filter(
        (q) =>
          q.question && q.correctAnswer && Array.isArray(q.wrongAnswers)
      )
      .map((q) => {
        const options = [...q.wrongAnswers, q.correctAnswer].sort(
          () => Math.random() - 0.5
        );
        return { question: q.question, options, answer: q.correctAnswer };
      });

    return res.json(quizData);
  } catch (error) {
    const code = error?.cause?.code || error?.code;
    console.error("❌ Quiz Generation Error:", error?.message || error);
    if (code === "ECONNREFUSED" || code === "ENOTFOUND") {
      console.error(`❌ Ollama is not reachable at ${OLLAMA_HOST}. Is it running?`);
      return res.status(503).json({ error: `AI service unavailable. Ollama is not running at ${OLLAMA_HOST}.` });
    }
    res.status(500).json({ error: "Server error generating quiz" });
  }
};

// ✅ Submit quiz result
export const submitQuiz = async (req, res) => {
  try {
    const { questions, answers, userId, skill } = req.body;

    if (!userId || !questions || !answers) {
      return res.status(400).json({ error: "Missing data" });
    }

    let score = 0;

    const solutions = questions.map((q, i) => {
      const correct = q.answer === answers[i];
      if (correct) score++;
      return { ...q, userAnswer: answers[i], correct };
    });

    const result = await QuizResult.create({
      userId,
      skill: skill || "General",
      score,
      total: questions.length,
      answers: solutions,
    });

    res.json({
      success: true,
      score,
      total: questions.length,
      solutions,
      id: result._id,
    });
  } catch (err) {
    console.error("❌ Error saving quiz:", err);
    res.status(500).json({ error: "Failed to submit quiz" });
  }
};

// ✅ Get last quiz result (matches `getLastQuiz`)
export const getLastQuiz = async (req, res) => {
  try {
    const { userId } = req.params;
    const lastResult = await QuizResult.findOne({ userId }).sort({ createdAt: -1 });

    if (!lastResult) return res.json(null);

    res.json(lastResult);
  } catch (err) {
    console.error("❌ Error fetching last quiz result:", err);
    res.status(500).json({ error: "Failed to fetch last quiz result" });
  }
};
// ✅ Get Quiz History for a specific user
export const getUserQuizHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const quizzes = await QuizResult.find({ userId })
      .select("skill score total createdAt")
      .sort({ createdAt: -1 });

    const user = await User.findById(userId).select("fullName");

    res.json({
      user: user ? user.fullName : "Unknown User",
      quizzes,
    });
  } catch (err) {
    console.error("❌ Quiz History Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};