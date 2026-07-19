import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Award, ArrowRight } from "lucide-react";

import WelcomeBanner     from "../components/dashboard/WelcomeBanner";
import DashboardStats    from "../components/dashboard/DashboardStats";
import RecentActivity    from "../components/dashboard/RecentActivity";
import QuickActions      from "../components/dashboard/QuickActions";
import ScheduleOverview  from "../components/dashboard/ScheduleOverview";
import PerformanceOverview from "../components/dashboard/PerformanceOverview";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.3 },
});

export default function Dashboard() {
  const userId  = localStorage.getItem("userId");
  const navigate = useNavigate();
  const [user,        setUser]        = useState(null);
  const [sessions,    setSessions]    = useState([]);
  const [connections, setConnections] = useState([]);
  const [lastQuiz,    setLastQuiz]    = useState(null);

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
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Welcome */}
      <motion.div {...fadeUp(0)}>
        <WelcomeBanner user={user} />
      </motion.div>

      {/* Stats */}
      <motion.div {...fadeUp(0.05)}>
        <DashboardStats
          user={user}
          sessions={sessions}
          connections={connections}
          lastQuiz={lastQuiz}
        />
      </motion.div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Main column */}
        <div className="lg:col-span-2 space-y-5">
          <motion.div {...fadeUp(0.1)}>
            <RecentActivity sessions={sessions} connections={connections} />
          </motion.div>
          <motion.div {...fadeUp(0.15)}>
            <ScheduleOverview sessions={sessions} />
          </motion.div>
          <motion.div {...fadeUp(0.2)}>
            <PerformanceOverview sessions={sessions} connections={connections} />
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <motion.div {...fadeUp(0.1)}>
            <QuickActions />
          </motion.div>

          {/* Leaderboard card */}
          <motion.div {...fadeUp(0.15)}>
            <div className="card card-p">
              <div className="flex items-center gap-2 mb-3">
                <Award size={16} className="text-amber-500" />
                <p className="section-heading">Leaderboard</p>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                See how you rank against other learners on the platform.
              </p>
              <button
                onClick={() => navigate("/quizzes/leaderboard")}
                className="btn btn-secondary btn-md w-full"
              >
                View rankings <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>

          {/* Connections card */}
          <motion.div {...fadeUp(0.2)}>
            <div className="card card-p">
              <div className="flex items-center gap-2 mb-3">
                <Users size={16} className="text-emerald-500" />
                <p className="section-heading">Connections</p>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                You have{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {connections.length}
                </span>{" "}
                {connections.length === 1 ? "connection" : "connections"}.
              </p>
              <button
                onClick={() => navigate("/connections")}
                className="btn btn-secondary btn-md w-full"
              >
                Manage connections <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
