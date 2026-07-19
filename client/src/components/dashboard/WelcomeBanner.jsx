import React from "react";
import { Calendar, Star } from "lucide-react";
import { getAvatarUrl, handleAvatarError } from "../../utils/avatarUrl";

export default function WelcomeBanner({ user }) {
  const firstName = user.fullName?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" :
    hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="card card-p flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        <img
          src={getAvatarUrl(user.profilePicture)}
          onError={handleAvatarError}
          alt={user.fullName}
          className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
        />
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{greeting}</p>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            {firstName}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Here&apos;s what&apos;s happening with your account today.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500 shrink-0">
        {user.rating !== undefined && (
          <div className="flex items-center gap-1.5 badge-yellow px-2.5 py-1 rounded-full">
            <Star size={12} />
            <span className="font-medium">{user.rating} Rating</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Calendar size={13} />
          {new Date().toLocaleDateString("en-US", {
            weekday: "short", month: "short", day: "numeric",
          })}
        </div>
      </div>
    </div>
  );
}
