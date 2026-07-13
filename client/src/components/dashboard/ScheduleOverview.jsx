import React from "react";
import { CalendarCheck, Clock } from "lucide-react";

export default function ScheduleOverview({ sessions }) {
  // Filter only upcoming sessions
  const upcomingSessions = sessions
    .filter((s) => !s.completed)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const nextSession = upcomingSessions.length > 0 ? upcomingSessions[0] : null;

  const formatDateTime = (dateStr, timeStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const formattedDate = date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    let formattedTime =
      timeStr ||
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    return `${formattedDate} at ${formattedTime}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow relative overflow-hidden">
      {/* Decorative circle */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/10 rounded-full blur-3xl"></div>

      <h2 className="text-lg font-semibold mb-3 flex items-center text-gray-900 dark:text-gray-100">
        <CalendarCheck size={18} className="text-purple-500 mr-2" />
        Schedule Overview
      </h2>

      {nextSession ? (
        <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg border border-purple-100 dark:border-purple-700">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Next Session</p>
          <h3 className="text-md font-semibold text-purple-700 dark:text-purple-300">
            {nextSession.skill || "Unnamed Session"}
          </h3>
          <p className="text-xs flex items-center text-gray-500 dark:text-gray-400 mt-1">
            <Clock size={14} className="mr-1" /> {formatDateTime(nextSession.date, nextSession.time)}
          </p>
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">No upcoming sessions</p>
      )}
    </div>
  );
}
