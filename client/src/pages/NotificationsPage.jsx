import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Calendar,
  MessageCircle,
  UserPlus,
  Brain,
  CheckCheck,
  Trash2,
  X,
  CheckCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  <  1) return "just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  <  7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const TYPE_CONFIG = {
  session:          { Icon: Calendar,      bg: "bg-violet-100 dark:bg-violet-900/40", fg: "text-violet-600 dark:text-violet-400" },
  session_complete: { Icon: CheckCheck,    bg: "bg-emerald-100 dark:bg-emerald-900/40", fg: "text-emerald-600 dark:text-emerald-400" },
  message:          { Icon: MessageCircle, bg: "bg-sky-100 dark:bg-sky-900/40",      fg: "text-sky-600 dark:text-sky-400" },
  connection:       { Icon: UserPlus,      bg: "bg-amber-100 dark:bg-amber-900/40",  fg: "text-amber-600 dark:text-amber-400" },
  quiz:             { Icon: Brain,         bg: "bg-pink-100 dark:bg-pink-900/40",    fg: "text-pink-600 dark:text-pink-400" },
};

function getTypeConfig(type) {
  return (
    TYPE_CONFIG[type] || {
      Icon: Bell,
      bg: "bg-gray-100 dark:bg-gray-800",
      fg: "text-gray-500 dark:text-gray-400",
    }
  );
}

export default function NotificationsPage() {
  const { notifications, loading, unreadCount, markRead, markAllRead, deleteOne, clearAll } = useNotifications();

  const handleDeleteOne = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    deleteOne(id);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30">
              <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {unreadCount} unread
                </p>
              )}
            </div>
          </div>

          {notifications?.length > 0 && (
            <div className="flex items-center gap-4">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                  <CheckCircle size={13} />
                  Mark all read
                </button>
              )}
              <button
                onClick={clearAll}
                className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              >
                <Trash2 size={13} />
                Clear all
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-20 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse"
              />
            ))}
          </div>
        ) : !notifications?.length ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-4 text-center"
          >
            <div className="w-16 h-16 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Bell className="w-7 h-7 text-gray-300 dark:text-gray-600" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-700 dark:text-gray-200">
                All caught up!
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                You have no notifications right now.
              </p>
            </div>
            <Link
              to="/dashboard"
              className="mt-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Go to Dashboard
            </Link>
          </motion.div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
            <AnimatePresence initial={false}>
              {notifications.map((notif) => {
                const { Icon, bg, fg } = getTypeConfig(notif.type);
                return (
                  <motion.div
                    key={notif._id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden"
                  >
                    <Link
                      to={notif.link || "/dashboard"}
                      onClick={() => markRead(notif._id)}
                      className={`group flex items-start gap-4 px-5 py-4 transition-colors ${
                        notif.isRead
                          ? "hover:bg-gray-50 dark:hover:bg-gray-800/40"
                          : "bg-indigo-50/50 dark:bg-indigo-900/10 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border-l-2 border-indigo-400"
                      }`}
                    >
                      <div
                        className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center mt-0.5 ${bg}`}
                      >
                        <Icon size={16} className={fg} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-[13.5px] leading-snug ${
                            notif.isRead
                              ? "text-gray-600 dark:text-gray-300"
                              : "font-semibold text-gray-900 dark:text-white"
                          }`}
                        >
                          {notif.message}
                        </p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                          {timeAgo(notif.createdAt)}
                        </p>
                      </div>

                      <div className="flex flex-col items-center gap-2 shrink-0 pt-0.5">
                        {!notif.isRead && (
                          <div className="w-2 h-2 rounded-full bg-indigo-500" />
                        )}
                        <button
                          onClick={(e) => handleDeleteOne(e, notif._id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-all"
                          title="Delete notification"
                          aria-label="Delete notification"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
