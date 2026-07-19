import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, Brain, ArrowRight } from "lucide-react";

export default function QuizAttempt() {
  const { skill } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
          console.warn("⚠️ Quiz returned empty array. Ollama may be offline or returned bad JSON.");
          setError("No questions available for this skill. The AI service may be offline.");
        }
        setLoading(false);
      })
      .catch((err) => {
        const status  = err?.response?.status;
        const message = err?.response?.data?.error || err?.message || "Unknown error";
        console.error(`❌ Quiz fetch failed (HTTP ${status || "no response"}):`, message, err);
        if (status === 503) {
          setError("AI quiz service is currently offline. Please ensure Ollama is running.");
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
      .then(({ data }) => navigate("/quizzes/result", { state: data }))
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

  const answeredCount = answers.filter((a) => a !== "").length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
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
                      <CheckCircle className="text-brand-500 shrink-0" size={16} />
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
