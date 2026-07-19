import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  UserPlus, MessageCircle, MapPin, Calendar,
  Search, SlidersHorizontal, UserCheck,
} from "lucide-react";

export default function Matchmaking() {
  const userId   = localStorage.getItem("userId");
  const navigate = useNavigate();
  const [matches,      setMatches]      = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [currentUser,  setCurrentUser]  = useState(null); // ✅ For interest-overlap check
  const [connectedIds, setConnectedIds] = useState(new Set());
  const [filters, setFilters] = useState({ intent: "teach", skill: "", availability: "" });

  const handleFilterChange = (e) =>
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Fetch current user's profile for interest-overlap comparison
  useEffect(() => {
    if (!userId) return;
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/users/${userId}`)
      .then((res) => setCurrentUser(res.data))
      .catch((err) => console.error("Failed to load current user profile:", err));
  }, [userId]);

  // Fetch accepted connection IDs once on mount
  useEffect(() => {
    if (!userId) return;
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/connection/accepted/${userId}`)
      .then((res) => {
        const ids = new Set(
          (res.data || []).map((conn) => {
            const u1 = conn.user1?._id || conn.user1;
            const u2 = conn.user2?._id || conn.user2;
            return u1 === userId ? u2 : u1;
          })
        );
        setConnectedIds(ids);
      })
      .catch((err) => console.error("Error fetching connections:", err));
  }, [userId]);

  // ✅ True if currentUser's skills-to-learn overlap with the match's skills-to-teach
  const hasInterestOverlap = (match) => {
    if (!currentUser) return false;
    const myLearnSet = new Set(
      (currentUser.skillsToLearn || []).map((s) => s.toLowerCase().trim())
    );
    return (match.skillsToTeach || []).some((s) =>
      myLearnSet.has(s.toLowerCase().trim())
    );
  };

  const sendConnectionRequest = async (otherUserId) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/connection/request`, {
        from: userId, to: otherUserId,
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
          <select name="intent" className="input" value={filters.intent} onChange={handleFilterChange}>
            <option value="teach">I want to Teach</option>
            <option value="learn">I want to Learn</option>
          </select>
          <input
            type="text" name="skill" placeholder="Skill (e.g. Python)"
            className="input" value={filters.skill} onChange={handleFilterChange}
          />
          <select name="availability" className="input" value={filters.availability} onChange={handleFilterChange}>
            <option value="">Any availability</option>
            <option value="Weekends">Weekends</option>
            <option value="Mon–Fri">Mon–Fri</option>
          </select>
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={findMatches} disabled={loading} className="btn btn-primary btn-md">
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
          {matches.map((match, i) => {
            const isConnected = connectedIds.has(match._id);
            return (
              <motion.div
                key={match._id}
                className="card card-p flex flex-col sm:flex-row gap-4 sm:items-start"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <img
                  src={match.profilePicture || "/default-avatar.png"}
                  alt={match.fullName}
                  className="w-14 h-14 rounded-full object-cover border border-gray-200 dark:border-gray-700 shrink-0"
                />

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

                    {/* —— Action buttons with interest-match gate —— */}
                    <div className="flex items-start gap-2 shrink-0">
                      {isConnected ? (
                        /* Already connected — show Message only */
                        <button
                          onClick={() => navigate(`/chat?to=${match._id}`)}
                          className="btn btn-primary btn-sm"
                        >
                          <MessageCircle size={14} /> Message
                        </button>
                      ) : (
                        /* Not yet connected — gate Connect on interest overlap */
                        <>
                          <div className="flex flex-col items-end gap-1">
                            <button
                              onClick={() =>
                                hasInterestOverlap(match)
                                  ? sendConnectionRequest(match._id)
                                  : undefined
                              }
                              disabled={!hasInterestOverlap(match)}
                              title={
                                !hasInterestOverlap(match)
                                  ? "Requires matching interests to connect"
                                  : "Send connection request"
                              }
                              className={`btn btn-sm ${
                                hasInterestOverlap(match)
                                  ? "btn-primary"
                                  : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-70"
                              }`}
                            >
                              <UserPlus size={14} /> Connect
                            </button>
                            {!hasInterestOverlap(match) && (
                              <p className="text-[11px] text-amber-500 dark:text-amber-400 text-right max-w-[150px] leading-tight">
                                Requires matching interests to connect.
                              </p>
                            )}
                          </div>
                          <button
                            disabled
                            className="btn btn-sm bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                          >
                            <MessageCircle size={14} /> Message
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {match.bio && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                      {match.bio}
                    </p>
                  )}

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
                    {isConnected && (
                      <span className="badge-green flex items-center gap-1">
                        <UserCheck size={11} /> Connected
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
