import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, CheckCircle } from "lucide-react";

export default function QuizAttempt() {
  const { skill } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/quizzes/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skill }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setQuestions(data);
          setAnswers(Array(data.length).fill(""));
        } else {
          setError("❌ No questions available for this skill.");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("❌ Server not responding. Please try again later.");
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

    fetch("http://localhost:5000/api/quizzes/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: localStorage.getItem("userId"),
        skill,
        questions,
        answers,
      }),
    })
      .then((res) => res.json())
      .then((data) => navigate("/quizzes/result", { state: data }))
      .finally(() => setSubmitting(false));
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
        <span className="ml-2">Loading quiz...</span>
      </div>
    );

  if (error)
    return (
      <p className="text-center text-red-500 text-lg mt-10 font-semibold">
        {error}
      </p>
    );

  return (
    <motion.div
      className="p-6 max-w-4xl mx-auto text-gray-900 dark:text-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">
          🧠 Quiz on <span className="text-blue-600">{skill}</span>
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {answers.filter((a) => a !== "").length}/{questions.length} answered
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((q, i) => (
          <motion.div
            key={i}
            className="border rounded-xl shadow-md p-5 bg-white dark:bg-gray-800 hover:shadow-lg transition-all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <p className="font-semibold text-lg mb-3">
              {i + 1}. {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, idx) => {
                const selected = answers[i] === opt;
                return (
                  <label
                    key={idx}
                    className={`flex items-center gap-3 cursor-pointer border rounded-lg px-4 py-2 transition-all
                      ${
                        selected
                          ? "bg-blue-100 dark:bg-blue-900 border-blue-500"
                          : "bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
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
                    <span className="flex-1">{opt}</span>
                    {selected && <CheckCircle className="text-blue-500 w-5 h-5" />}
                  </label>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="mt-8 text-center">
        <button
          onClick={handleSubmit}
          disabled={submitting || answers.includes("")}
          className={`px-6 py-3 rounded-lg text-lg font-semibold transition-all
            ${
              submitting || answers.includes("")
                ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl"
            }`}
        >
          {submitting ? "Submitting..." : "🚀 Submit Quiz"}
        </button>
        {answers.includes("") && (
          <p className="text-sm text-gray-500 mt-2">
            ⚠️ Please answer all questions before submitting.
          </p>
        )}
      </div>
    </motion.div>
  );
}
