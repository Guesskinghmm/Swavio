import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function QuizResult() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const score = state?.score || 0;
  const total = state?.total || 0;
  const solutions = state?.solutions || [];
  const percentage = total ? Math.round((score / total) * 100) : 0;
  const isPass = percentage >= 60;

  // 🎉 Confetti Effect on Passing
  useEffect(() => {
    if (isPass) {
      import("canvas-confetti").then((confetti) => {
        confetti.default({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      });
    }
  }, [isPass]);

  // ✅ Show message if no result data
  if (!state) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 text-center">
        <p className="text-lg text-gray-500">No results found.</p>
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => navigate("/quizzes")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Take a Quiz
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
          >
            Go Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const badge = isPass ? "Beginner Certified!" : "Try Again!";

  return (
    <div className="p-6 max-w-3xl mx-auto text-gray-900 dark:text-gray-100">
      <h2 className="text-3xl font-bold mb-4 text-center">Quiz Results</h2>
      <div className="text-center mb-6">
        <p className="text-lg font-semibold mb-2">
          Score: <span className="text-blue-600">{score}</span> / {total} (
          {percentage}%)
        </p>
        <p
          className={`text-xl font-bold ${
            isPass ? "text-green-600" : "text-red-500"
          }`}
        >
          {badge}
        </p>
      </div>

      {/* ✅ Solutions List */}
      {solutions.map((s, i) => (
        <div
          key={i}
          className="mb-4 border rounded-lg p-4 bg-white dark:bg-gray-800 shadow"
        >
          <p className="font-semibold mb-2">
            {i + 1}. {s.question}
          </p>
          <p
            className={`mb-1 ${
              s.correct ? "text-green-600" : "text-red-600"
            }`}
          >
            Your Answer: {s.userAnswer || "No Answer"}
          </p>
          <p className="text-blue-600 font-medium">
            Correct Answer: {s.answer}
          </p>
        </div>
      ))}

      {/* ✅ Action Buttons */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={() => navigate("/quizzes")}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded shadow-md transition"
        >
          Take Another Quiz
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded shadow-md transition"
        >
          Go Back to Dashboard
        </button>
      </div>
    </div>
  );
}
