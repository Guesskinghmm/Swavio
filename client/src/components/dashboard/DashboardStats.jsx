import React from "react";
import { Users, CalendarCheck, Award, BookOpen } from "lucide-react";

const STAT_COLORS = [
  { icon: Users,         color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  { icon: CalendarCheck, color: "text-brand-600",   bg: "bg-brand-50 dark:bg-brand-900/20" },
  { icon: Award,         color: "text-amber-500",   bg: "bg-amber-50 dark:bg-amber-900/20" },
  { icon: BookOpen,      color: "text-purple-600",  bg: "bg-purple-50 dark:bg-purple-900/20" },
];

export default function DashboardStats({ user, sessions, connections, lastQuiz }) {
  const stats = [
    { label: "Connections", value: connections.length },
    { label: "Sessions",    value: sessions.length },
    {
      label: "Last Quiz",
      value: lastQuiz ? `${lastQuiz.score}/${lastQuiz.total}` : "—",
      sub:   lastQuiz
        ? lastQuiz.score >= Math.ceil(lastQuiz.total * 0.6)
          ? "Proficient"
          : "Developing"
        : "No quiz yet",
    },
    { label: "Rating", value: user.rating ?? "—", sub: "out of 5" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {stats.map(({ label, value, sub }, i) => {
        const { icon: Icon, color, bg } = STAT_COLORS[i];
        return (
          <div key={i} className="card card-p flex flex-col gap-2">
            <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${bg}`}>
              <Icon size={17} className={color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
              {sub && <p className="text-xs text-gray-400 dark:text-gray-500">{sub}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
