import React from "react";
import { Calendar } from "lucide-react";

export default function WelcomeBanner({ user }) {
  // Extract initials from full name
  const initials = user.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-xl text-white shadow-lg mb-4">
      
      {/* Decorative Gradient Circles */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-purple-400/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/20 rounded-full blur-2xl"></div>

      <div className="relative flex items-center justify-between">
        {/* Profile + Text */}
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold shadow-md">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-wide">
              Welcome back, {user.fullName} 👋
            </h1>
            <p className="text-sm text-white/80 mt-1">
              Keep learning and growing today!
            </p>
          </div>
        </div>

        {/* Date + Rating */}
        <div className="text-right flex flex-col items-end">
          <div className="flex items-center text-sm opacity-90 mb-2">
            <Calendar size={16} className="mr-1" />
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
          <span className="text-xs bg-white text-purple-700 px-2 py-1 rounded-full dark:bg-gray-200 dark:text-purple-800 font-semibold shadow-sm">
            ⭐ {user.rating || 0} Rating
          </span>
        </div>
      </div>
    </div>
  );
}
