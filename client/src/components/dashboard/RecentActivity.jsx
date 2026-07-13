import React, { useEffect, useState } from "react";
import { Users, CalendarCheck, Clock, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RecentActivity({ sessions = [], connections = [] }) {
  const [localSessions, setLocalSessions] = useState([]);
  const [localConnections, setLocalConnections] = useState([]);

  // ✅ Load from localStorage and filter out deleted items
  useEffect(() => {
    const deletedSessions = JSON.parse(localStorage.getItem("deletedSessions") || "[]");
    const deletedConnections = JSON.parse(localStorage.getItem("deletedConnections") || "[]");

    const filteredSessions = sessions.filter((s, i) => !deletedSessions.includes(i));
    const filteredConnections = connections.filter((c, i) => !deletedConnections.includes(i));

    setLocalSessions(filteredSessions);
    setLocalConnections(filteredConnections);
  }, [sessions, connections]);

  const sortedSessions = [...localSessions].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

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

  // ✅ Delete connection & store in localStorage
  const deleteConnection = (index) => {
    const updated = localConnections.filter((_, i) => i !== index);
    setLocalConnections(updated);

    const deleted = JSON.parse(localStorage.getItem("deletedConnections") || "[]");
    deleted.push(index);
    localStorage.setItem("deletedConnections", JSON.stringify(deleted));
  };

  // ✅ Delete session & store in localStorage
  const deleteSession = (index) => {
    const updated = localSessions.filter((_, i) => i !== index);
    setLocalSessions(updated);

    const deleted = JSON.parse(localStorage.getItem("deletedSessions") || "[]");
    deleted.push(index);
    localStorage.setItem("deletedSessions", JSON.stringify(deleted));
  };

  const isEmpty = sortedSessions.length === 0 && localConnections.length === 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow text-gray-900 dark:text-gray-100">
      <h2 className="text-lg font-semibold mb-3 flex items-center">
        <Clock size={18} className="text-blue-500 mr-2" /> Recent Activity
      </h2>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Clock className="text-gray-400 mb-2" size={32} />
          <p className="text-gray-500 dark:text-gray-300 mb-2">
            No recent activity yet
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Connect with peers or schedule a session to get started!
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {/* 🔹 Connections with Swipe-to-Delete */}
          <AnimatePresence>
            {localConnections.slice(0, 3).map((c, i) => (
              <motion.li
                key={`conn-${i}`}
                className="group p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex items-center justify-between space-x-3 relative"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(e, info) => {
                  if (Math.abs(info.offset.x) > 100) deleteConnection(i);
                }}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <Users size={18} className="text-green-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    New connection added:{" "}
                    <span className="font-medium">{c.name}</span>
                  </span>
                </div>

                {/* ❌ Delete button (optional for desktop) */}
                <button
                  onClick={() => deleteConnection(i)}
                  className="opacity-0 group-hover:opacity-100 transition text-red-500 hover:text-red-700"
                >
                  <XCircle size={20} />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>

          {/* 🔹 Sessions with Swipe-to-Delete */}
          <AnimatePresence>
            {sortedSessions.slice(0, 3).map((s, i) => (
              <motion.li
                key={`sess-${i}`}
                className="group p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex items-center justify-between space-x-3 relative"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(e, info) => {
                  if (Math.abs(info.offset.x) > 100) deleteSession(i);
                }}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center space-x-3 flex-1">
                  {s.completed ? (
                    <CalendarCheck size={18} className="text-green-500" />
                  ) : (
                    <Clock size={18} className="text-yellow-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {s.skill || "Unnamed Session"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDateTime(s.date, s.time)}
                    </p>
                  </div>
                </div>

                {/* ❌ Delete button (optional for desktop) */}
                <button
                  onClick={() => deleteSession(i)}
                  className="opacity-0 group-hover:opacity-100 transition text-red-500 hover:text-red-700"
                >
                  <XCircle size={20} />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
