import React from "react";
import { LineChart, TrendingUp } from "lucide-react";

export default function PerformanceOverview({ sessions, connections }) {
  const sessionProgress = Math.min((sessions.length / 10) * 100, 100);
  const connectionProgress = Math.min((connections.length / 15) * 100, 100);
  const totalProgress = Math.min((sessions.length + connections.length) / 12 * 100, 100);

  const ProgressBar = ({ label, value, color }) => (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">{Math.round(value)}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full ${color} transition-all duration-1000`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/10 rounded-full blur-3xl"></div>

      <h2 className="text-lg font-semibold mb-3 flex items-center text-gray-900 dark:text-gray-100">
        <TrendingUp size={18} className="text-green-500 mr-2" /> Performance Overview
      </h2>

      <ProgressBar label="Sessions Completed" value={sessionProgress} color="bg-green-500" />
      <ProgressBar label="Network Growth" value={connectionProgress} color="bg-blue-500" />
      <ProgressBar label="Overall Achievement" value={totalProgress} color="bg-purple-500" />
    </div>
  );
}

