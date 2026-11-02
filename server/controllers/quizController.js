import Groq from "groq-sdk";
import QuizResult from "../models/QuizResult.js";
import Quiz from "../models/Quiz.js";
import User from "../models/User.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Generate Quiz ─────────────────────────────────────────────────────────────
export const generateQuiz = async (req, res) => {
  try {
    const { skill } = req.body;
    if (!skill) return res.status(400).json({ error: "Skill is required" });

    if (!process.env.GROQ_API_KEY) {
      return res.status(503).json({ error: "Groq AI service is not configured. Missing GROQ_API_KEY." });
    }

    const systemPrompt = `You are an expert educator and quiz creator.
Generate EXACTLY 5 high-quality multiple-choice questions about: ${skill}.

Return ONLY a raw JSON array — no markdown, no backticks, no extra text before or after.
Each element must follow this exact schema:
[
  {
    "question": "Clear, unambiguous question text?",
    "options": ["OptionA", "OptionB", "OptionC", "OptionD"],
    "correctAnswer": "OptionA"
  }
]

Rules you MUST follow:
1. "correctAnswer" MUST be one of the four "options" strings, copied exactly.
2. Shuffle the options so the correct answer is not always in the same position.
3. All questions must be factually accurate and appropriate for the topic "${skill}".
4. Do NOT include any text outside the JSON array.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: systemPrompt }],
      temperature: 0.5,
      max_tokens: 2048,
    });

    let raw = completion.choices[0]?.message?.content?.trim() || "";
    raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (parseErr) {
      console.error("❌ Groq JSON parse error:", parseErr.message);
      return res.status(502).json({ error: "AI returned malformed JSON. Please try again." });
    }

    const quizData = parsed
      .filter(
        (q) =>
          q.question &&
          Array.isArray(q.options) &&
          q.options.length === 4 &&
          q.correctAnswer &&
          q.options.includes(q.correctAnswer)
      )
      .slice(0, 5);

    if (quizData.length === 0)
      return res.status(502).json({ error: "AI returned no valid questions. Please retry." });

    return res.json(quizData);
  } catch (error) {
    console.error("❌ Groq Quiz Generation Error:", error?.message || error);
    res.status(500).json({ error: "Quiz generation failed. Please try again." });
  }
};

// ── Submit Quiz Result ────────────────────────────────────────────────────────
export const submitQuiz = async (req, res) => {
  try {
    const { questions, answers, userId, skill, quizId } = req.body;

    if (!userId || !questions || !answers)
      return res.status(400).json({ error: "Missing required quiz submission data" });

    // Ownership check: userId in body must match authenticated user
    if (req.user._id.toString() !== userId.toString())
      return res.status(403).json({ error: "Forbidden: userId does not match authenticated user." });

    let score = 0;
    const solutions = questions.map((q, i) => {
      const correct = q.correctAnswer === answers[i];
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

    // Mark pending assigned Quiz as completed if matching
    if (quizId) {
      await Quiz.findByIdAndUpdate(quizId, { status: "completed" });
    } else if (skill) {
      await Quiz.findOneAndUpdate(
        { userId, skill, status: "pending" },
        { status: "completed" }
      );
    }

    res.json({ success: true, score, total: questions.length, solutions, id: result._id });
  } catch (err) {
    console.error("❌ Error saving quiz:", err.message);
    res.status(500).json({ error: "Failed to submit quiz" });
  }
};

// ── Get Last Quiz Result ──────────────────────────────────────────────────────
export const getLastQuiz = async (req, res) => {
  try {
    const { userId } = req.params;

    // Ownership check
    if (req.user._id.toString() !== userId.toString())
      return res.status(403).json({ error: "Forbidden: Cannot view another user's quiz result." });

    const lastResult = await QuizResult.findOne({ userId }).sort({ createdAt: -1 });
    res.json(lastResult || null);
  } catch (err) {
    console.error("❌ Error fetching last quiz result:", err.message);
    res.status(500).json({ error: "Failed to fetch last quiz result" });
  }
};

// ── Get Quiz History ──────────────────────────────────────────────────────────
export const getUserQuizHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    // Ownership check
    if (req.user._id.toString() !== userId.toString())
      return res.status(403).json({ error: "Forbidden: Cannot view another user's quiz history." });

    const quizzes = await QuizResult.find({ userId })
      .select("skill score total createdAt")
      .sort({ createdAt: -1 });

    const user = await User.findById(userId).select("fullName");

    res.json({ user: user ? user.fullName : "Unknown User", quizzes });
  } catch (err) {
    console.error("❌ Quiz History Error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// ── Get Pending Assigned Quizzes ──────────────────────────────────────────────
export const getPendingQuizzes = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user._id.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Forbidden: Cannot view another user's assigned quizzes." });
    }

    const pending = await Quiz.find({ userId, status: "pending" }).sort({ createdAt: -1 });
    res.json(pending);
  } catch (err) {
    console.error("getPendingQuizzes error:", err.message);
    res.status(500).json({ error: "Failed to fetch pending quizzes" });
  }
};
