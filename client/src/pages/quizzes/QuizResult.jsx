import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, ChevronRight, Award, AlertCircle } from "lucide-react";

export default function QuizResult() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const score = state?.score || 0;
  const total = state?.total || 0;
  const solutions = state?.solutions || [];
  const percentage = total ? Math.round((score / total) * 100) : 0;
  const isPass = percentage >= 60;

  // Confetti Effect on Passing
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

  // Show message if no result data
  if (!state) {
    return (
      <div className="max-w-md mx-auto text-center py-20 flex flex-col items-center gap-4">
        <AlertCircle size={32} className="text-gray-300 dark:text-gray-600" />
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            No results found
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            We couldn&apos;t retrieve any quiz results. Try taking a quiz first.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/quizzes")}
            className="btn btn-primary btn-md"
          >
            Take a Quiz
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="btn btn-secondary btn-md"
          >
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  const badgeText = isPass ? "Certified!" : "Requires revision";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-900/20 mb-3 text-brand-600 dark:text-brand-400">
          <Award size={24} />
        </div>
        <h1 className="page-title text-center">Quiz Results</h1>
        <div className="mt-4 flex flex-col items-center gap-1.5">
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            Score: <span className="text-brand-600 dark:text-brand-400">{score}</span> / {total} ({percentage}%)
          </p>
          <span className={`badge-brand ${isPass ? "badge-green" : "badge-red"}`}>
            {badgeText}
          </span>
        </div>
      </div>

      {/* Solutions List */}
      <div className="space-y-4 mb-8">
        <h2 className="section-heading px-1">Review Questions</h2>
        {solutions.map((s, i) => (
          <div
            key={i}
            className="card card-p bg-white dark:bg-gray-800"
          >
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              {i + 1}. {s.question}
            </p>

            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-medium">
                {s.correct ? (
                  <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                ) : (
                  <XCircle size={14} className="text-red-500 shrink-0" />
                )}
                <span className={s.correct ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                  Your Answer: {s.userAnswer || "No Answer"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400 pl-5">
                <span>Correct Answer: {s.correctAnswer}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-3">
        <button
          onClick={() => navigate("/quizzes")}
          className="btn btn-primary btn-md"
        >
          Take Another Quiz
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          className="btn btn-secondary btn-md"
        >
          Go to Dashboard
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
