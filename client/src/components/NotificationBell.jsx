import React, { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function NotificationBell({ userId, socket }) {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null); // 👈 Ref for detecting outside clicks
  const navigate = useNavigate();

  // Fetch notifications once on mount
  useEffect(() => {
    if (!userId) return;
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/notifications/${userId}`)
      .then((res) => setNotifications(res.data))
      .catch((err) => console.error("Error fetching notifications:", err));
  }, [userId]);

  // Socket real-time notifications
  useEffect(() => {
    if (!socket || !userId) return;
    // Note: socket.emit("join") is handled once in App.jsx

    socket.on("notification", (newNotif) => {
      const notifWithLink = { ...newNotif, link: newNotif.link || "/notifications" };
      setNotifications((prev) => [notifWithLink, ...prev]);
    });

    return () => socket.off("notification");
  }, [socket, userId]);


  // ✅ Outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/notifications/${notif._id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
      }
      setShowDropdown(false);
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/notifications/${userId}/read-all`);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/notifications/${userId}/clear`);
      setNotifications([]);
    } catch (err) {
      console.error("Error clearing notifications:", err);
    }
  };

  return (
    <div className="relative notification-bell" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown((prev) => !prev)}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        <Bell className="w-6 h-6 text-white" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow"
            >
              {unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                Notifications
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Mark all read
                </button>
                <button
                  onClick={clearAllNotifications}
                  className="text-xs text-red-600 hover:underline"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Notifications List */}
            {notifications.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                No notifications
              </p>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notif) => (
                  <Link
                    key={notif._id}
                    to={notif.link || "/notifications"}
                    onClick={() => handleNotificationClick(notif)}
                    className={`block px-4 py-3 text-sm transition ${
                      notif.isRead
                        ? "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        : "font-semibold text-gray-900 dark:text-white bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-800/50"
                    }`}
                  >
                    {notif.message}
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(notif.createdAt).toLocaleString()}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
