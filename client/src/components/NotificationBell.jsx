import React, { useState, useEffect, useRef } from "react";
import { Bell, Calendar, MessageCircle, UserPlus, Brain, CheckCheck, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";

// ── Relative-time helper ──────────────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);

  if (mins  <  1) return "just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  <  7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// ── Per-type icon + colour config ─────────────────────────────────────────────
const TYPE_CONFIG = {
  session:          { Icon: Calendar,       bg: "bg-violet-100 dark:bg-violet-900/40", fg: "text-violet-600 dark:text-violet-400" },
  session_complete: { Icon: CheckCheck,      bg: "bg-emerald-100 dark:bg-emerald-900/40", fg: "text-emerald-600 dark:text-emerald-400" },
  message:          { Icon: MessageCircle,  bg: "bg-sky-100 dark:bg-sky-900/40",      fg: "text-sky-600 dark:text-sky-400" },
  connection:       { Icon: UserPlus,       bg: "bg-amber-100 dark:bg-amber-900/40",  fg: "text-amber-600 dark:text-amber-400" },
  quiz:             { Icon: Brain,          bg: "bg-pink-100 dark:bg-pink-900/40",    fg: "text-pink-600 dark:text-pink-400" },
};

function getTypeConfig(type) {
  return TYPE_CONFIG[type] || { Icon: Bell, bg: "bg-gray-100 dark:bg-gray-800", fg: "text-gray-500 dark:text-gray-400" };
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead, deleteOne, clearAll } = useNotifications();
  const [showDropdown,  setShowDropdown]  = useState(false);
  const dropdownRef = useRef(null);

  // ── Dynamic page title ────────────────────────────────────────────────────
  useEffect(() => {
    document.title = unreadCount > 0 ? `(${unreadCount}) Swavio` : "Swavio";
    return () => { document.title = "Swavio"; };
  }, [unreadCount]);

  // ── Outside-click to close ────────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) await markRead(notif._id);
    setShowDropdown(false);
  };

  const handleDeleteOne = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    deleteOne(id);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="relative" ref={dropdownRef}>

      {/* Bell button */}
      <button
        onClick={() => setShowDropdown((p) => !p)}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-0.5 right-0.5 bg-brand-500 text-white text-[9px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1 shadow"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{   opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >

            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Bell size={15} className="text-brand-500" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] font-medium text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={clearAll}
                  className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500 transition-colors"
                  title="Clear all"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* ── List ── */}
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
                <Bell size={28} className="text-gray-300 dark:text-gray-600" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">All caught up!</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">No new notifications</p>
              </div>
            ) : (
              <div className="max-h-[22rem] overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800/60">
                {notifications.map((notif) => {
                  const { Icon, bg, fg } = getTypeConfig(notif.type);
                  return (
                    <Link
                      key={notif._id}
                      to={notif.link || "/notifications"}
                      onClick={() => handleNotificationClick(notif)}
                      className={`flex items-start gap-3 px-4 py-3.5 transition-colors group ${
                        notif.isRead
                          ? "hover:bg-gray-50 dark:hover:bg-gray-800/40"
                          : "bg-brand-50/60 dark:bg-brand-900/10 hover:bg-brand-50 dark:hover:bg-brand-900/20 border-l-2 border-brand-400"
                      }`}
                    >
                      {/* Type icon badge */}
                      <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5 ${bg}`}>
                        <Icon size={15} className={fg} />
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] leading-snug ${
                          notif.isRead
                            ? "text-gray-600 dark:text-gray-300"
                            : "font-semibold text-gray-900 dark:text-white"
                        }`}>
                          {notif.message}
                        </p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                          {timeAgo(notif.createdAt)}
                        </p>
                      </div>

                      {/* Unread dot + delete */}
                      <div className="flex flex-col items-center gap-1.5 shrink-0">
                        {!notif.isRead && (
                          <div className="w-2 h-2 rounded-full bg-brand-500" />
                        )}
                        <button
                          onClick={(e) => handleDeleteOne(e, notif._id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-all"
                          title="Delete"
                          aria-label="Delete notification"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* ── Footer ── */}
            {notifications.length > 0 && (
              <div className="px-5 py-2.5 border-t border-gray-100 dark:border-gray-800 text-center">
                <Link
                  to="/notifications"
                  onClick={() => setShowDropdown(false)}
                  className="text-[11px] font-medium text-brand-600 dark:text-brand-400 hover:underline"
                >
                  View all notifications
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
