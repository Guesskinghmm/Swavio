import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, MessageCircle, MapPin, Calendar, Search, SlidersHorizontal } from "lucide-react";

export default function Matchmaking() {
  const userId  = localStorage.getItem("userId");
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    intent: "teach",
    skill: "",
    availability: "",
  });

  const handleFilterChange = (e) =>
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const sendConnectionRequest = async (otherUserId) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/connection/request`, {
        from: userId,
        to: otherUserId,
      });
      navigate("/connections");
    } catch (err) {
      if (err.response?.data?.message === "Already connected or pending") {
        navigate("/connections");
      }
    }
  };

  const findMatches = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/match/${userId}`,
        { params: filters }
      );
      setMatches(res.data);
    } catch (err) {
      console.error("Error fetching matches", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { findMatches(); }, []); // eslint-disable-line

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Page header */}
      <div className="mb-8">
        <h1 className="page-title">Matchmaking</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Find learners and mentors that match your skill goals.
        </p>
      </div>

      {/* Filter bar */}
      <div className="card card-p mb-6">
        <div className="flex items-center gap-2 mb-3">
          <SlidersHorizontal size={15} className="text-gray-400" />
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Filters
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            name="intent"
            className="input"
            value={filters.intent}
            onChange={handleFilterChange}
          >
            <option value="teach">I want to Teach</option>
            <option value="learn">I want to Learn</option>
          </select>

          <input
            type="text"
            name="skill"
            placeholder="Skill (e.g. Python)"
            className="input"
            value={filters.skill}
            onChange={handleFilterChange}
          />

          <select
            name="availability"
            className="input"
            value={filters.availability}
            onChange={handleFilterChange}
          >
            <option value="">Any availability</option>
            <option value="Weekends">Weekends</option>
            <option value="Mon–Fri">Mon–Fri</option>
          </select>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={findMatches}
            disabled={loading}
            className="btn btn-primary btn-md"
          >
            <Search size={15} />
            {loading ? "Searching…" : "Find Matches"}
          </button>
        </div>
      </div>

      {/* Results */}
      {matches.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <Search size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No matches found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match, i) => (
            <motion.div
              key={match._id}
              className="card card-p flex flex-col sm:flex-row gap-4 sm:items-start"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              {/* Avatar */}
              <img
                src={match.profilePicture || "/default-avatar.png"}
                alt={match.fullName}
                className="w-14 h-14 rounded-full object-cover border border-gray-200 dark:border-gray-700 shrink-0"
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <Link
                      to={`/profile/${match._id}`}
                      className="text-sm font-semibold text-gray-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                    >
                      {match.fullName}
                    </Link>
                    {match.location && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={11} /> {match.location}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => sendConnectionRequest(match._id)}
                      className="btn btn-primary btn-sm"
                    >
                      <UserPlus size={14} />
                      Connect
                    </button>
                    <button
                      disabled={!match.isConnected}
                      onClick={() => match.isConnected && navigate(`/chat?to=${match._id}`)}
                      className={`btn btn-sm ${
                        match.isConnected
                          ? "btn-secondary"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <MessageCircle size={14} />
                      Message
                    </button>
                  </div>
                </div>

                {match.bio && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                    {match.bio}
                  </p>
                )}

                {/* Skill tags */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {match.skillsToTeach?.map((s, idx) => (
                    <span key={`t-${idx}`} className="badge-brand">{s}</span>
                  ))}
                  {match.skillsToLearn?.map((s, idx) => (
                    <span key={`l-${idx}`} className="badge-green">{s}</span>
                  ))}
                  {Array.isArray(match.availability) && match.availability.slice(0, 2).map((slot, idx) => (
                    <span key={`a-${idx}`} className="badge-gray">
                      <Calendar size={10} className="inline mr-1" />
                      {slot.day} {slot.time}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
