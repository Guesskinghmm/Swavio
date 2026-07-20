import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, Brain, ArrowRight, Award, AlertCircle, ChevronRight } from "lucide-react";

export default function QuizAttempt() {
  const { skill } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Results View State
  const [showResults, setShowResults] = useState(false);
  const [resultsData, setResultsData] = useState(null);

  useEffect(() => {
    console.log(`📚 QuizAttempt: fetching questions for skill = "${skill}"`);
    axios
      .post(`${process.env.REACT_APP_API_URL}/api/quizzes/generate`, { skill })
      .then(({ data }) => {
        if (Array.isArray(data) && data.length > 0) {
          console.log(`✅ Quiz loaded: ${data.length} questions`);
          setQuestions(data);
          setAnswers(Array(data.length).fill(""));
        } else {
          console.warn("⚠️ Quiz returned empty array. Groq may have returned bad JSON.");
          setError("No questions available for this skill. The AI service may be offline.");
        }
        setLoading(false);
      })
      .catch((err) => {
        const status  = err?.response?.status;
        const message = err?.response?.data?.error || err?.message || "Unknown error";
        console.error(`❌ Quiz fetch failed (HTTP ${status || "no response"}):`, message, err);
        if (status === 503) {
          setError("AI quiz service is currently offline. Please ensure the backend and API keys are set.");
        } else if (!err.response) {
          setError("Cannot reach the server. Check your network connection.");
        } else {
          setError(`Failed to load quiz: ${message}`);
        }
        setLoading(false);
      });
  }, [skill]);

  const handleAnswerSelect = (questionIndex, selectedOption) => {
    const updated = [...answers];
    updated[questionIndex] = selectedOption;
    setAnswers(updated);
  };

  const handleSubmit = () => {
    setSubmitting(true);
    axios
      .post(`${process.env.REACT_APP_API_URL}/api/quizzes/submit`, {
        userId: localStorage.getItem("userId"),
        skill,
        questions,
        answers,
      })
      .then(({ data }) => {
        setResultsData(data);
        setShowResults(true);

        // Trigger confetti if score is >= 60%
        const pct = data.total ? Math.round((data.score / data.total) * 100) : 0;
        if (pct >= 60) {
          import("canvas-confetti").then((confetti) => {
            confetti.default({
              particleCount: 120,
              spread: 70,
              origin: { y: 0.6 },
            });
          });
        }
      })
      .catch((err) => {
        console.error("❌ Quiz submit failed:", err?.response?.data || err?.message);
        alert("Failed to submit quiz. Please try again.");
      })
      .finally(() => setSubmitting(false));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="animate-spin w-8 h-8 text-brand-500" />
        <span className="text-sm text-gray-500">Loading quiz…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <p className="text-sm text-red-500 font-semibold">{error}</p>
        <button
          onClick={() => navigate("/quizzes")}
          className="btn btn-secondary btn-md mt-4"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Render Inline Results View
  if (showResults && resultsData) {
    const score = resultsData.score || 0;
    const total = resultsData.total || 0;
    const percentage = total ? Math.round((score / total) * 100) : 0;
    const isPass = percentage >= 60;
    const badgeText = isPass ? "Certified!" : "Requires revision";

    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in-up">
        {/* Score Card */}
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

        {/* Question Review List */}
        <div className="space-y-6 mb-8">
          <h2 className="section-heading px-1">Review Questions</h2>
          
          {questions.map((q, i) => {
            const userAnswer = answers[i];
            const correctAnswer = q.correctAnswer;
            const isCorrect = userAnswer === correctAnswer;

            return (
              <div key={i} className="card card-p bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white leading-relaxed">
                    {i + 1}. {q.question}
                  </p>
                  {isCorrect ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-lg border border-emerald-250 dark:border-emerald-800/40">
                      <CheckCircle2 size={12} /> Correct
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400 shrink-0 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-lg border border-red-250 dark:border-red-800/40">
                      <XCircle size={12} /> Incorrect
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {q.options.map((opt, idx) => {
                    const isSelected = userAnswer === opt;
                    const isOptionCorrect = correctAnswer === opt;
                    
                    let optStyle = "border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300";
                    if (isSelected) {
                      optStyle = isOptionCorrect
                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 font-medium"
                        : "border-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-850 dark:text-red-300 font-medium";
                    } else if (isOptionCorrect) {
                      optStyle = "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-400 border-dashed";
                    }

                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between gap-3 border rounded-xl px-4 py-2.5 text-xs transition-colors ${optStyle}`}
                      >
                        <span>{opt}</span>
                        {isSelected && (
                          isOptionCorrect ? (
                            <CheckCircle2 className="text-emerald-500 shrink-0" size={14} />
                          ) : (
                            <XCircle className="text-red-500 shrink-0" size={14} />
                          )
                        )}
                        {!isSelected && isOptionCorrect && (
                          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                            Correct Answer
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explicit correctAnswer display for incorrect questions */}
                {!isCorrect && (
                  <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/30 text-xs">
                    <AlertCircle size={14} className="text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-amber-800 dark:text-amber-300">Explanation:</span>{" "}
                      <span className="text-amber-700 dark:text-amber-400">
                        You chose <strong>{userAnswer || "no answer"}</strong>. The correct option is <strong>{correctAnswer}</strong>.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Navigation Actions */}
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

  const answeredCount = answers.filter((a) => a !== "").length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Brain size={16} className="text-brand-500" />
            <span className="text-xs font-semibold tracking-widest uppercase text-brand-500">
              Assessment In Progress
            </span>
          </div>
          <h1 className="page-title">
            Quiz: {skill}
          </h1>
        </div>
        <span className="badge-brand self-start sm:self-center">
          {answeredCount} of {questions.length} answered
        </span>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((q, i) => (
          <motion.div
            key={i}
            className="card card-p bg-white dark:bg-gray-800"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <p className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              {i + 1}. {q.question}
            </p>
            <div className="grid grid-cols-1 gap-2">
              {q.options.map((opt, idx) => {
                const selected = answers[i] === opt;
                return (
                  <label
                    key={idx}
                    className={`flex items-center gap-3 cursor-pointer border rounded-xl px-4 py-3 transition-colors ${
                      selected
                        ? "border-brand-500 bg-brand-50/50 dark:bg-brand-900/10"
                        : "border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 hover:bg-gray-100/50 dark:hover:bg-gray-850"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${i}`}
                      value={opt}
                      checked={selected}
                      onChange={() => handleAnswerSelect(i, opt)}
                      className="hidden"
                    />
                    <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                      {opt}
                    </span>
                    {selected && (
                      <CheckCircle2 className="text-brand-500 shrink-0" size={16} />
                    )}
                  </label>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="mt-8 flex flex-col items-center">
        <button
          onClick={handleSubmit}
          disabled={submitting || answers.includes("")}
          className="btn btn-primary btn-lg w-full sm:w-auto px-10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 className="animate-spin shrink-0" size={16} />
              Submitting…
            </>
          ) : (
            <>
              Submit Quiz
              <ArrowRight size={16} />
            </>
          )}
        </button>
        {answers.includes("") && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Please answer all questions before submitting.
          </p>
        )}
      </div>
    </div>
  );
}
