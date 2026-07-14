import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Award } from "lucide-react";

import WelcomeBanner from "../components/dashboard/WelcomeBanner";
import DashboardStats from "../components/dashboard/DashboardStats";
import RecentActivity from "../components/dashboard/RecentActivity";
import QuickActions from "../components/dashboard/QuickActions";
import ScheduleOverview from "../components/dashboard/ScheduleOverview";
import PerformanceOverview from "../components/dashboard/PerformanceOverview";

export default function Dashboard() {
  const userId = localStorage.getItem("userId");
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [connections, setConnections] = useState([]);
  const [lastQuiz, setLastQuiz] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/dashboard/${userId}`);
        setUser(res.data.user);
        setSessions(res.data.sessions);
        setConnections(res.data.connections);

        const quizRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/quizzes/last/${userId}`);
        if (quizRes.status === 200) setLastQuiz(quizRes.data);
      } catch (err) {
        console.error("Dashboard API Error", err);
      }
    }
    fetchData();
  }, [userId]);

  if (!user) {
    return <p className="text-center mt-10 text-gray-700 dark:text-gray-300">Loading...</p>;
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      <WelcomeBanner user={user} />

      {/* Dashboard Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <DashboardStats
          user={user}
          sessions={sessions}
          connections={connections}
          lastQuiz={lastQuiz}
        />
      </motion.div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">

        {/* LEFT SIDE */}
        <div className="md:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <RecentActivity sessions={sessions} connections={connections} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <ScheduleOverview sessions={sessions} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <PerformanceOverview sessions={sessions} connections={connections} />
          </motion.div>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">

          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <QuickActions />
          </motion.div>

          {/* Leaderboard */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-3">
                <Award className="text-yellow-500 mr-2" size={20} />
                <h2 className="text-lg font-semibold dark:text-white">Leaderboard</h2>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                Check out top performers on the platform.
              </p>
              <button
                onClick={() => navigate("/quizzes/leaderboard")}
                className="w-full py-2 rounded-lg font-semibold 
                           bg-gradient-to-r from-blue-600 to-purple-600 
                           hover:from-blue-700 hover:to-purple-700 
                           text-white transition-all shadow-md hover:shadow-lg"
              >
                View Leaderboard
              </button>
            </div>
          </motion.div>

          {/* My Connections */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-3">
                <Users className="text-green-500 mr-2" size={20} />
                <h2 className="text-lg font-semibold dark:text-white">My Connections</h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                You have <span className="font-bold">{connections.length}</span> connections
              </p>

              {connections.length > 0 ? (
                <div className="flex -space-x-2 mb-3">
                  {connections.slice(0, 3).map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm border-2 border-white dark:border-gray-800"
                    >
                      <Users size={14} />
                    </div>
                  ))}
                  {connections.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-sm border-2 border-white dark:border-gray-800">
                      +{connections.length - 3}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                  No connections yet. Start connecting!
                </p>
              )}

              <button
                onClick={() => navigate("/connections")}
                className="w-full py-2 rounded-lg font-semibold 
                           bg-gradient-to-r from-green-500 to-emerald-600 
                           hover:from-green-600 hover:to-emerald-700 
                           text-white transition-all shadow-md hover:shadow-lg"
              >
                View All Connections
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
