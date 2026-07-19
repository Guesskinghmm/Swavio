import Groq from "groq-sdk";
import QuizResult from "../models/QuizResult.js";
import User from "../models/User.js";

// ✅ Groq client — reads API key from environment
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
console.log("🤖 Groq SDK initialised (model: llama-3.3-70b-versatile)");

// ── Generate Quiz ─────────────────────────────────────────────────────────────
export const generateQuiz = async (req, res) => {
  try {
    const { skill } = req.body;
    if (!skill) return res.status(400).json({ error: "Skill is required" });

    console.log(`📚 Generating quiz for skill: "${skill}"`);

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

    // Strip any stray markdown wrappers the model might accidentally add
    raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/g, "").trim();

    console.log("📝 Groq raw response (first 200 chars):", raw.slice(0, 200));

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (parseErr) {
      console.error("❌ Groq JSON parse error:", parseErr.message);
      console.error("   Raw output was:", raw);
      return res.status(502).json({
        error: "AI returned malformed JSON. Please try again.",
      });
    }

    // Validate & sanitise each question
    const quizData = parsed
      .filter(
        (q) =>
          q.question &&
          Array.isArray(q.options) &&
          q.options.length === 4 &&
          q.correctAnswer &&
          q.options.includes(q.correctAnswer) // correctAnswer must actually be one of the options
      )
      .slice(0, 5);

    if (quizData.length === 0) {
      console.error("❌ Groq returned no valid questions. Parsed:", parsed);
      return res.status(502).json({
        error: "AI returned no valid questions. Please retry.",
      });
    }

    console.log(`✅ Quiz ready: ${quizData.length} questions for "${skill}"`);
    return res.json(quizData);
  } catch (error) {
    console.error("❌ Groq Quiz Generation Error:", error?.message || error);
    res.status(500).json({ error: "Quiz generation failed. Please try again." });
  }
};

// ── Submit Quiz Result ────────────────────────────────────────────────────────
export const submitQuiz = async (req, res) => {
  try {
    const { questions, answers, userId, skill } = req.body;

    if (!userId || !questions || !answers) {
      return res.status(400).json({ error: "Missing data" });
    }

    let score = 0;

    // ✅ Score against correctAnswer (new Groq schema field)
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

// ── Get Last Quiz Result ──────────────────────────────────────────────────────
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

// ── Get Quiz History ──────────────────────────────────────────────────────────
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