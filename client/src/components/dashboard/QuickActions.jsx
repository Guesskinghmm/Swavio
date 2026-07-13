import React from "react";
import { Search, CalendarPlus, User, Target } from "lucide-react";

export default function QuickActions() {
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-700">
      <h2 className="text-lg font-semibold mb-3 flex items-center dark:text-white">
        <Target size={18} className="text-purple-500 mr-2" /> Quick Actions
      </h2>

      <div className="space-y-3">

        {/* Discover Matches */}
        <button
          onClick={() => (window.location.href = "/matchmaking")}
          className="w-full py-2 rounded-lg font-medium flex items-center justify-center space-x-2
                     bg-gradient-to-r from-blue-500 to-purple-600
                     hover:from-blue-600 hover:to-purple-700
                     text-white transition-all shadow-md hover:shadow-lg"
        >
          <Search size={16} /> <span>Discover Matches</span>
        </button>

        {/* Schedule Session */}
        <button
          onClick={() => (window.location.href = "/sessions")}
          className="w-full py-2 rounded-lg font-medium flex items-center justify-center space-x-2
                     bg-gradient-to-r from-pink-500 to-fuchsia-600
                     hover:from-pink-600 hover:to-fuchsia-700
                     text-white transition-all shadow-md hover:shadow-lg"
        >
          <CalendarPlus size={16} /> <span>Schedule Session</span>
        </button>

        {/* Update Profile */}
        <button
          onClick={() => (window.location.href = "/profile")}
          className="w-full py-2 rounded-lg font-medium flex items-center justify-center space-x-2
                     bg-gradient-to-r from-green-500 to-emerald-600
                     hover:from-green-600 hover:to-emerald-700
                     text-white transition-all shadow-md hover:shadow-lg"
        >
          <User size={16} /> <span>Update Profile</span>
        </button>

        {/* Take a Quiz */}
        <button
          onClick={() => (window.location.href = "/quizzes")}
          className="w-full py-2 rounded-lg font-medium flex items-center justify-center space-x-2
                     bg-gradient-to-r from-indigo-500 to-purple-600
                     hover:from-indigo-600 hover:to-purple-700
                     text-white transition-all shadow-md hover:shadow-lg"
        >
          <Target size={16} /> <span>Take a Quiz</span>
        </button>
      </div>
    </div>
  );
}
