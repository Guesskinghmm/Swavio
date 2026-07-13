import React from "react";
import { Users, CalendarCheck, Award } from "lucide-react";

export default function DashboardStats({ user, sessions, connections, lastQuiz }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">

      {/* Connections */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow flex flex-col items-start relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-green-400/10 rounded-full blur-2xl"></div>
        <Users size={20} className="text-green-500 mb-2" />
        <p className="text-sm text-gray-600 dark:text-gray-400">Connections</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{connections.length}</p>
      </div>

      {/* Sessions */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow flex flex-col items-start relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/10 rounded-full blur-2xl"></div>
        <CalendarCheck size={20} className="text-blue-500 mb-2" />
        <p className="text-sm text-gray-600 dark:text-gray-400">Sessions</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{sessions.length}</p>
      </div>

      {/* Last Quiz */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow flex flex-col items-start relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-400/10 rounded-full blur-2xl"></div>
        <Award size={20} className="text-purple-500 mb-2" />
        <p className="text-sm text-gray-600 dark:text-gray-400">Last Quiz</p>

        {lastQuiz ? (
          <>
            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
              Score: {lastQuiz.score}/{lastQuiz.total}
            </p>
            <p className="text-sm mt-1 text-purple-500 dark:text-purple-300">
              {lastQuiz.score >= Math.ceil(lastQuiz.total * 0.6)
                ? "🏆 Skill Pro"
                : "🎓 Beginner"}
            </p>
          </>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No quiz taken yet</p>
        )}
      </div>

    </div>
  );
}
