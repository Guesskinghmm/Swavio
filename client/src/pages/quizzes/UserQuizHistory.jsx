import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function UserQuizHistory() {
  const { userId } = useParams();
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

  if (loading)
    return (
      <p className="text-center mt-6 text-gray-600 dark:text-gray-300 animate-pulse">
        Loading quiz history...
      </p>
    );

  if (!data)
    return (
      <p className="text-center mt-6 text-gray-500 dark:text-gray-400">
        Failed to load quiz history.
      </p>
    );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-8 text-center text-indigo-700 dark:text-indigo-400">
        📚 Quiz History of {data.user}
      </h2>

      {data.quizzes.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400">
          No quizzes taken yet.
        </p>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-lg">
                <th className="p-3 rounded-tl-xl">Skill</th>
                <th className="p-3">Score</th>
                <th className="p-3 rounded-tr-xl">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.quizzes.map((q, i) => (
                <tr
                  key={q._id}
                  className={`transition-colors border-b border-gray-200 dark:border-gray-700 ${
                    i % 2 === 0
                      ? "bg-gray-50 dark:bg-gray-900"
                      : "bg-white dark:bg-gray-800"
                  } hover:bg-indigo-50 dark:hover:bg-indigo-900/30`}
                >
                  <td className="p-3 font-medium text-gray-800 dark:text-gray-200">
                    {q.skill}
                  </td>
                  <td className="p-3 font-bold text-indigo-700 dark:text-indigo-400">
                    {q.score}/{q.total}
                  </td>
                  <td className="p-3 text-gray-600 dark:text-gray-400">
                    {new Date(q.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
