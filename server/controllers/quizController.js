import Groq from "groq-sdk";
import axios from "axios";
import QuizResult from "../models/QuizResult.js";
import Quiz from "../models/Quiz.js";
import User from "../models/User.js";

// Helper for dynamic educational fallback questions when API keys are not set or rate-limited
function getFallbackQuestions(skill) {
  return [
    {
      question: `What is the primary foundation or core objective of ${skill}?`,
      options: [
        `Mastering fundamental concepts and principles of ${skill}`,
        `Memorizing arbitrary terminology without application`,
        `Ignoring best practices and community guidelines`,
        `Relying exclusively on third-party automation tools`,
      ],
      correctAnswer: `Mastering fundamental concepts and principles of ${skill}`,
    },
    {
      question: `When applying ${skill} in a real-world scenario, which practice is recommended?`,
      options: [
        `Systematic problem analysis and step-by-step execution`,
        `Skipping planning and directly implementing assumptions`,
        `Avoiding documentation and peer collaboration`,
        `Never validating outcomes or testing results`,
      ],
      correctAnswer: `Systematic problem analysis and step-by-step execution`,
    },
    {
      question: `Which factor is most critical for long-term mastery in ${skill}?`,
      options: [
        `Consistent deliberate practice and continuous feedback`,
        `One-time cramming of theoretical manuals`,
        `Working in total isolation without external benchmarks`,
        `Avoiding modern tools and emerging conventions`,
      ],
      correctAnswer: `Consistent deliberate practice and continuous feedback`,
    },
    {
      question: `What is an effective troubleshooting strategy when encountering bottlenecks in ${skill}?`,
      options: [
        `Decomposing the problem into smaller, isolated components`,
        `Restarting the entire project from scratch repeatedly`,
        `Ignoring error patterns and hoping they disappear`,
        `Accepting degraded performance as normal behavior`,
      ],
      correctAnswer: `Decomposing the problem into smaller, isolated components`,
    },
    {
      question: `How does peer review or mentorship enhance proficiency in ${skill}?`,
      options: [
        `It surfaces blind spots and provides alternative perspectives`,
        `It slows down progress without measurable benefit`,
        `It replaces the need for personal study and practice`,
        `It prevents learners from making independent decisions`,
      ],
      correctAnswer: `It surfaces blind spots and provides alternative perspectives`,
    },
  ];
}

// ── Generate Quiz (Multi-Provider: Gemini, Groq, OpenRouter, with fallback) ────
export const generateQuiz = async (req, res) => {
  try {
    const { skill } = req.body;
    if (!skill) return res.status(400).json({ error: "Skill is required" });

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

    let raw = "";

    // 1. Try Google Gemini API if configured
    if (process.env.GEMINI_API_KEY) {
      try {
        const geminiRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.5,
            },
          },
          { timeout: 10000 }
        );
        raw = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      } catch (geminiErr) {
        console.warn("⚠️ Gemini quiz generation failed, trying next provider:", geminiErr.message);
      }
    }

    // 2. Try Groq if configured and Gemini was not used or failed
    if (!raw && process.env.GROQ_API_KEY) {
      try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const completion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: systemPrompt }],
          temperature: 0.5,
          max_tokens: 2048,
        });
        raw = completion.choices[0]?.message?.content?.trim() || "";
      } catch (groqErr) {
        console.warn("⚠️ Groq quiz generation failed, trying next provider:", groqErr.message);
      }
    }

    // 3. Try OpenRouter if configured and previous providers failed
    if (!raw && process.env.OPENROUTER_API_KEY) {
      try {
        const openrouterRes = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: "meta-llama/llama-3.3-70b-instruct:free",
            messages: [{ role: "user", content: systemPrompt }],
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
            },
            timeout: 10000,
          }
        );
        raw = openrouterRes.data?.choices?.[0]?.message?.content || "";
      } catch (openrouterErr) {
        console.warn("⚠️ OpenRouter quiz generation failed:", openrouterErr.message);
      }
    }

    // 4. Parse AI output
    if (raw) {
      const cleanRaw = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/g, "").trim();
      try {
        const parsed = JSON.parse(cleanRaw);
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

        if (quizData.length === 5) {
          return res.json(quizData);
        }
      } catch (parseErr) {
        console.warn("⚠️ AI returned malformed JSON, falling back to curated questions:", parseErr.message);
      }
    }

    // 5. Safe Fallback: Return structured skill-specific questions
    console.log(`[Quiz] Using structured fallback assessment for skill: ${skill}`);
    return res.json(getFallbackQuestions(skill));
  } catch (error) {
    console.error("❌ Quiz Generation Error:", error?.message || error);
    return res.json(getFallbackQuestions(req.body.skill || "General"));
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
