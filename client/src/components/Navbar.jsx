import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LayoutDashboard,
  Users,
  MessageSquare,
  LogOut,
  Award,
  BookOpen,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import logo from "../assets/logo.png";
import NotificationBell from "./NotificationBell";
import axios from "axios";
import { socket, SERVER_URL } from "../socket";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!userId) return;
    axios
      .get(`${SERVER_URL}/api/users/${userId}`)
      .then((res) => setUser(res.data))
      .catch((err) => console.error("Error fetching user:", err));

    socket.emit("join", userId);
  }, [userId]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const navLinkClass = (path) =>
    `flex items-center px-4 py-3 rounded-lg mb-2 transition-all ${
      location.pathname === path
        ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 font-semibold"
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
    }`;

  return (
    <>
      <nav className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 shadow-lg py-3 px-6 flex justify-between items-center sticky top-0 z-50 transition-all duration-300">
        {/* Logo + Brand */}
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img
            src={logo}
            alt="Swavio Logo"
            className="w-10 h-10 object-contain" // removed round border
          />
          <span
            className="text-4xl font-logo text-transparent bg-clip-text animate-shimmer
                       drop-shadow-[0_0_10px_rgba(255,255,255,0.7)] hover:drop-shadow-[0_0_20px_rgba(255,255,255,1)] 
                       transition-all duration-300"
            style={{
              backgroundImage:
                "linear-gradient(90deg, #ffffff, #dbeafe, #ffffff)", // white shimmer
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              fontFamily: "'Pacifico', cursive", // stylish cursive
            }}
          >
           Swavio
          </span>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-5 text-white">
          {token ? (
            <>
              <button
                onClick={() => navigate("/users")}
                className="hover:text-yellow-300 transition"
              >
                <Search className="w-6 h-6" />
              </button>
              <NotificationBell userId={userId} socket={socket} />
              <button
                onClick={() => setDrawerOpen(true)}
                className="flex items-center hover:opacity-90 transition"
              >
                <img
                  src={user?.profilePicture || "/default-avatar.png"}
                  alt="Profile"
                  className="w-9 h-9 rounded-full border-2 border-white/50 object-cover shadow-md hover:scale-110 transition-transform duration-200"
                />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-yellow-300 transition">
                Login
              </Link>
              <Link to="/register" className="hover:text-yellow-300 transition">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Drawer Sidebar */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 w-72 h-full bg-white dark:bg-gray-900 shadow-xl z-50 flex flex-col"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Profile Header */}
              <div
                onClick={() => {
                  navigate("/profile");
                  setDrawerOpen(false);
                }}
                className="p-4 border-b dark:border-gray-700 flex items-center space-x-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <img
                  src={user?.profilePicture || "/default-avatar.png"}
                  alt="Profile"
                  className="w-12 h-12 rounded-full border dark:border-gray-600 object-cover"
                />
                <div className="text-gray-900 dark:text-gray-100">
                  <p className="font-bold">{user?.fullName || "User"}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto p-3">
                <Link
                  to="/dashboard"
                  className={navLinkClass("/dashboard")}
                  onClick={() => setDrawerOpen(false)}
                >
                  <LayoutDashboard className="w-5 h-5 mr-2" /> Dashboard
                </Link>
                <Link
                  to="/matchmaking"
                  className={navLinkClass("/matchmaking")}
                  onClick={() => setDrawerOpen(false)}
                >
                  <Users className="w-5 h-5 mr-2" /> Matchmaking
                </Link>
                <Link
                  to="/chat"
                  className={navLinkClass("/chat")}
                  onClick={() => setDrawerOpen(false)}
                >
                  <MessageSquare className="w-5 h-5 mr-2" /> Chat
                </Link>
                <Link
                  to="/connections"
                  className={navLinkClass("/connections")}
                  onClick={() => setDrawerOpen(false)}
                >
                  <Users className="w-5 h-5 mr-2" /> Connections
                </Link>
                <Link
                  to="/quizzes"
                  className={navLinkClass("/quizzes")}
                  onClick={() => setDrawerOpen(false)}
                >
                  <BookOpen className="w-5 h-5 mr-2" /> Quizzes
                </Link>
                <Link
                  to="/quizzes/leaderboard"
                  className={navLinkClass("/quizzes/leaderboard")}
                  onClick={() => setDrawerOpen(false)}
                >
                  <Award className="w-5 h-5 mr-2" /> Leaderboard
                </Link>

                <div className="mt-4 flex justify-center">
                  <ThemeToggle />
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="m-4 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
              >
                <LogOut className="w-5 h-5 mr-2" /> Logout
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
