import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react"; // For medal animation effect

export default function Leaderboard() {
  const userId = localStorage.getItem("userId");
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  const rankBadges = ["🥇", "🥈", "🥉"];

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/quizzes/leaderboard`);
        setLeaders(res.data || []);
      } catch (err) {
        console.error("❌ Failed to fetch leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [userId]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-gray-600 dark:text-gray-300 text-lg animate-pulse">
          Loading Leaderboard...
        </p>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-8 text-center">
        🏆 Leaderboard
      </h2>

      <div className="overflow-x-auto rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm md:text-base">
              <th className="py-3 px-4 rounded-tl-xl">Rank</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Score</th>
              <th className="py-3 px-4">Quizzes Taken</th>
              <th className="py-3 px-4 rounded-tr-xl">History</th>
            </tr>
          </thead>
          <tbody>
            {leaders.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-6 text-gray-500 dark:text-gray-400 italic"
                >
                  No leaderboard data yet.
                </td>
              </tr>
            ) : (
              leaders.map((l, i) => {
                const isCurrentUser = l.userId === userId;
                return (
                  <tr
                    key={l.userId}
                    className={`border-t border-gray-200 dark:border-gray-700 transition-all duration-200 ${
                      isCurrentUser
                        ? "bg-blue-100 dark:bg-blue-900/50 font-semibold"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <td className="py-3 px-4 text-lg font-bold text-gray-800 dark:text-gray-100">
                      {rankBadges[i] || i + 1}
                    </td>

                    <td className="py-3 px-4 text-gray-700 dark:text-gray-200 flex items-center gap-2">
                      <Link
                        to={`/profile/${l.userId}`}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        {l.name || "Anonymous"}
                      </Link>

                      {/* Animated medal for current user */}
                      {isCurrentUser && (
                        <Sparkles className="text-yellow-400 animate-pulse w-5 h-5" />
                      )}
                    </td>

                    <td className="py-3 px-4 text-gray-700 dark:text-gray-200">
                      {l.score || 0}
                    </td>

                    <td className="py-3 px-4 text-gray-700 dark:text-gray-200">
                      {l.quizzesTaken || 0}
                    </td>

                    <td className="py-3 px-4">
                      <Link
                        to={`/quiz-history/${l.userId}`}
                        className="text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
