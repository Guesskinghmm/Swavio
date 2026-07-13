import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Notifications() {
  const userId = localStorage.getItem("userId");
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch notifications only once when opened
  useEffect(() => {
    if (isOpen && notifications.length === 0) {
      axios
        .get(`http://localhost:5000/api/notifications/${userId}`)
        .then((res) => setNotifications(res.data))
        .catch((err) => console.error("Error fetching notifications:", err));
    }
  }, [isOpen, userId, notifications.length]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const markAsRead = async (id, link) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`);
      window.location.href = link || "/";
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative focus:outline-none"
      >
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Bell className="w-7 h-7 text-indigo-500" />
        </motion.div>
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-96 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Notifications
            </h2>

            {notifications.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-sm text-center">
                🎉 You’re all caught up! No notifications yet.
              </p>
            ) : (
              <ul className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <motion.li
                    key={n._id}
                    onClick={() => markAsRead(n._id, n.link)}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-lg cursor-pointer border transition-all duration-300
                      ${
                        n.isRead
                          ? "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow"
                          : "bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/40 dark:via-purple-900/40 dark:to-pink-900/30 border-blue-200/40 shadow-md hover:shadow-xl"
                      }`}
                  >
                    <p
                      className={`text-sm font-medium ${
                        n.isRead
                          ? "text-gray-800 dark:text-gray-100"
                          : "text-indigo-600 dark:text-indigo-400"
                      }`}
                    >
                      {n.message}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400 block mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
