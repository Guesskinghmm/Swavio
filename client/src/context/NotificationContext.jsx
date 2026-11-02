import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { socket } from "../socket";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const userId = localStorage.getItem("userId");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .get(`/api/notifications/${userId}`)
      .then((res) => setNotifications(res.data ?? []))
      .catch((err) => console.error("Error fetching notifications:", err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const handler = (newNotif) => {
      setNotifications((prev) => [
        { ...newNotif, link: newNotif.link || "/notifications" },
        ...prev,
      ]);
    };
    socket.on("notification", handler);
    return () => socket.off("notification", handler);
  }, []);

  const markRead = useCallback(async (notifId) => {
    try {
      await api.put(`/api/notifications/${notifId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notifId ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Error marking notification read:", err.message);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    if (!userId) return;
    try {
      await api.put(`/api/notifications/${userId}/read-all`);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Error marking all read:", err.message);
    }
  }, [userId]);

  const deleteOne = useCallback(async (notifId) => {
    try {
      await api.delete(`/api/notifications/${notifId}`);
      setNotifications((prev) => prev.filter((n) => n._id !== notifId));
    } catch (err) {
      console.error("Error deleting notification:", err.message);
    }
  }, []);

  const clearAll = useCallback(async () => {
    if (!userId) return;
    try {
      await api.delete(`/api/notifications/${userId}/clear`);
      setNotifications([]);
    } catch (err) {
      console.error("Error clearing notifications:", err.message);
    }
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        loading,
        unreadCount,
        fetchNotifications,
        markRead,
        markAllRead,
        deleteOne,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationProvider");
  return ctx;
}
