import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  LogOut,
  Award,
  BookOpen,
  Search,
  X,
  ChevronRight,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import logo from "../assets/logo.png";
import NotificationBell from "./NotificationBell";
import axios from "axios";
import { socket, SERVER_URL } from "../socket";

const NAV_LINKS = [
  { to: "/dashboard",          label: "Dashboard",   icon: LayoutDashboard },
  { to: "/matchmaking",        label: "Matchmaking", icon: Users },
  { to: "/chat",               label: "Messages",    icon: MessageSquare },
  { to: "/connections",        label: "Connections", icon: Users },
  { to: "/quizzes",            label: "Quizzes",     icon: BookOpen },
  { to: "/quizzes/leaderboard",label: "Leaderboard", icon: Award },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token  = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!userId) return;
    axios
      .get(`${SERVER_URL}/api/users/${userId}`)
      .then((res) => setUser(res.data))
      .catch((err) => console.error("Error fetching user:", err));
    // Note: socket.emit("join") is handled once in App.jsx
  }, [userId]);

  // Subtle shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const navLinkClass = (path) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      location.pathname === path
        ? "bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400"
        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
    }`;

  return (
    <>
      <nav
        className={`sticky top-0 z-50 h-16 flex items-center justify-between px-5 transition-all duration-200 ${
          scrolled
            ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm"
            : "bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
        }`}
      >
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 focus:outline-none"
        >
          <img src={logo} alt="Swavio" className="w-8 h-8 object-contain" />
          <span
            className="text-xl font-logo text-transparent bg-clip-text"
            style={{
              backgroundImage: "linear-gradient(90deg, #6366f1, #8b5cf6)",
            }}
          >
            Swavio
          </span>
        </button>

        {/* Right section */}
        <div className="flex items-center gap-1">
          {token ? (
            <>
              <button
                onClick={() => navigate("/users")}
                className="btn-ghost btn-md rounded-xl"
                aria-label="Search users"
              >
                <Search size={18} />
              </button>

              <NotificationBell userId={userId} socket={socket} />

              <ThemeToggle />

              <button
                onClick={() => setDrawerOpen(true)}
                className="flex items-center gap-2 ml-1 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <img
                  src={user?.profilePicture || "/default-avatar.png"}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block">
                  {user?.fullName?.split(" ")[0] || "Account"}
                </span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="btn btn-ghost btn-md text-gray-600 dark:text-gray-300"
              >
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary btn-md ml-1">
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Side Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setDrawerOpen(false)}
            />

            {/* Panel */}
            <motion.div
              className="fixed top-0 right-0 w-72 h-full bg-white dark:bg-gray-900 z-50 flex flex-col border-l border-gray-200 dark:border-gray-800"
              style={{ boxShadow: "var(--shadow-float)" }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => { navigate("/profile"); setDrawerOpen(false); }}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <img
                    src={user?.profilePicture || "/default-avatar.png"}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                  />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {user?.fullName || "My Account"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[140px]">
                      {user?.email}
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="btn-ghost btn-sm rounded-lg"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
                {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className={navLinkClass(to)}
                    onClick={() => setDrawerOpen(false)}
                  >
                    <Icon size={16} className="shrink-0" />
                    <span className="flex-1">{label}</span>
                    {location.pathname === to && (
                      <ChevronRight size={14} className="text-brand-500" />
                    )}
                  </Link>
                ))}
              </nav>

              {/* Footer */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-800 space-y-1">
                <button
                  onClick={handleLogout}
                  className="w-full btn btn-danger btn-md justify-start gap-3"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
