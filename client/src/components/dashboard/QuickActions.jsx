import React from "react";
import { Search, CalendarPlus, User, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ACTIONS = [
  { label: "Discover Matches",  icon: Search,      to: "/matchmaking", style: "btn-primary"   },
  { label: "Schedule Session",  icon: CalendarPlus, to: "/sessions",   style: "btn-secondary" },
  { label: "Update Profile",    icon: User,        to: "/profile",     style: "btn-secondary" },
  { label: "Take a Quiz",       icon: BookOpen,    to: "/quizzes",     style: "btn-secondary" },
];

export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="card card-p">
      <p className="section-heading mb-4">Quick Actions</p>
      <div className="space-y-2">
        {ACTIONS.map(({ label, icon: Icon, to, style }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className={`btn ${style} btn-md w-full justify-start`}
          >
            <Icon size={15} className="shrink-0" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
