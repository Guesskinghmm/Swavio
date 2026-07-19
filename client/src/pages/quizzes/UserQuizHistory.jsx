import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { History, Brain, ChevronLeft, Calendar } from "lucide-react";

export default function UserQuizHistory() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/quizzes/history/${userId}`)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <p className="text-sm text-red-500 font-semibold">Failed to load quiz history.</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="btn btn-secondary btn-md mt-4"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
      >
        <ChevronLeft size={14} /> Back
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <History size={18} className="text-brand-500" />
          <span className="text-xs font-semibold tracking-widest uppercase text-brand-500">
            Performance Record
          </span>
        </div>
        <h1 className="page-title">Quiz History</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          History of all completed skill assessments for {data.user}.
        </p>
      </div>

      <div className="card overflow-hidden">
        {data.quizzes.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500">
            <History size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No quizzes taken yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-150 dark:divide-gray-800">
            {/* Table Header */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-900/20">
              <div className="col-span-6">Skill</div>
              <div className="col-span-3">Score</div>
              <div className="col-span-3 text-right">Date</div>
            </div>

            {/* Quizzes List */}
            {data.quizzes.map((q) => {
              const scorePercent = q.total ? Math.round((q.score / q.total) * 100) : 0;
              const isPass = scorePercent >= 60;
              return (
                <div
                  key={q._id}
                  className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-gray-50/40 dark:hover:bg-gray-850/20 transition-colors"
                >
                  {/* Skill */}
                  <div className="col-span-12 sm:col-span-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
                      <Brain size={15} />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {q.skill}
                    </span>
                  </div>

                  {/* Score */}
                  <div className="col-span-6 sm:col-span-3 flex flex-col sm:block mt-2 sm:mt-0 pl-11 sm:pl-0">
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 sm:hidden uppercase font-semibold">
                      Score
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {q.score} / {q.total}
                      </span>
                      <span className={`badge-brand text-[10px] px-1.5 py-0.5 ${isPass ? "badge-green" : "badge-red"}`}>
                        {scorePercent}%
                      </span>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="col-span-6 sm:col-span-3 flex flex-col sm:items-end mt-2 sm:mt-0">
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 sm:hidden uppercase font-semibold">
                      Date
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                      <Calendar size={12} />
                      {new Date(q.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
