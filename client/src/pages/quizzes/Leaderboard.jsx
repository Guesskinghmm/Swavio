import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Sparkles, Trophy, History } from "lucide-react";

export default function Leaderboard() {
  const userId = localStorage.getItem("userId");
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/quizzes/leaderboard`);
        setLeaders(res.data || []);
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Helper to determine rank styling
  const getRankBadgeClass = (index) => {
    if (index === 0) return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
    if (index === 1) return "bg-gray-150 text-gray-800 dark:bg-gray-800/40 dark:text-gray-300";
    if (index === 2) return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
    return "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400";
  };

  const getRankLabel = (index) => {
    if (index === 0) return "1st";
    if (index === 1) return "2nd";
    if (index === 2) return "3rd";
    return `${index + 1}th`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 mb-1">
          <Trophy size={18} className="text-amber-500" />
          <span className="text-xs font-semibold tracking-widest uppercase text-brand-500">
            Rankings
          </span>
        </div>
        <h1 className="page-title">Leaderboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Rankings of the top performers across all assessed skills.
        </p>
      </div>

      <div className="card overflow-hidden">
        {leaders.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500">
            <Trophy size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No leaderboard data yet. Be the first to take a quiz!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-150 dark:divide-gray-800">
            {/* Table Header Row */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-900/20">
              <div className="col-span-2">Rank</div>
              <div className="col-span-4">Name</div>
              <div className="col-span-2">Score</div>
              <div className="col-span-2">Quizzes</div>
              <div className="col-span-2 text-right">History</div>
            </div>

            {/* Leader Rows */}
            {leaders.map((leader, i) => {
              const isCurrentUser = leader.userId === userId;
              return (
                <div
                  key={leader.userId}
                  className={`grid grid-cols-12 gap-4 items-center px-6 py-4 transition-colors ${
                    isCurrentUser
                      ? "bg-brand-50/40 dark:bg-brand-900/10 font-semibold"
                      : "hover:bg-gray-50/40 dark:hover:bg-gray-850/20"
                  }`}
                >
                  {/* Rank */}
                  <div className="col-span-3 sm:col-span-2 flex items-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-xs font-bold ${getRankBadgeClass(i)}`}>
                      {getRankLabel(i)}
                    </span>
                  </div>

                  {/* Name */}
                  <div className="col-span-9 sm:col-span-4 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/profile/${leader.userId}`}
                        className="text-sm font-semibold text-gray-950 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 truncate"
                      >
                        {leader.name || "Anonymous"}
                      </Link>
                      {isCurrentUser && (
                        <Sparkles size={14} className="text-amber-400 shrink-0 animate-pulse" />
                      )}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="col-span-4 sm:col-span-2 flex flex-col sm:block mt-2 sm:mt-0">
                    <span className="text-xs text-gray-400 dark:text-gray-500 sm:hidden uppercase font-semibold">
                      Score
                    </span>
                    <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
                      {leader.score || 0}
                    </span>
                  </div>

                  {/* Quizzes Count */}
                  <div className="col-span-4 sm:col-span-2 flex flex-col sm:block mt-2 sm:mt-0">
                    <span className="text-xs text-gray-400 dark:text-gray-500 sm:hidden uppercase font-semibold">
                      Quizzes
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {leader.quizzesTaken || 0}
                    </span>
                  </div>

                  {/* History Action */}
                  <div className="col-span-4 sm:col-span-2 flex sm:justify-end mt-2 sm:mt-0">
                    <Link
                      to={`/quiz-history/${leader.userId}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:opacity-80 transition-opacity"
                    >
                      <History size={13} />
                      View
                    </Link>
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
