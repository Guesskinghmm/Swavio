import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { UserPlus, MessageCircle, MapPin, Calendar } from "lucide-react";

export default function Matchmaking() {
  const userId = localStorage.getItem("userId");
  const [matches, setMatches] = useState([]);
  const [filters, setFilters] = useState({
    intent: "teach",
    skill: "",
    availability: "",
  });

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const sendConnectionRequest = async (otherUserId) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/connection/request`, {
        from: userId,
        to: otherUserId,
      });
      alert("✅ Request Sent!");
      window.location.href = "/connections";
    } catch (err) {
      if (err.response?.data?.message === "Already connected or pending") {
        alert("⚠️ Request already sent or connected!");
        window.location.href = "/connections";
      } else {
        alert("❌ Failed to send request!");
      }
    }
  };

  const findMatches = async () => {
    try {
      const params = { ...filters };
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/match/${userId}`,
        { params }
      );
      setMatches(res.data);
    } catch (err) {
      console.error("Error fetching matches", err);
    }
  };

  useEffect(() => {
    findMatches();
  }, []);

  return (
    <motion.div
      className="max-w-6xl mx-auto p-6 text-gray-900 dark:text-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-600 dark:text-indigo-400 drop-shadow">
        🌟 Find Your Learning Partner
      </h1>

      {/* Filters */}
      <motion.div
        className="grid md:grid-cols-3 gap-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <select
          name="intent"
          className="border px-4 py-2 rounded-lg bg-white/70 dark:bg-gray-800/70 
                     dark:border-gray-600 shadow-sm backdrop-blur-md focus:ring focus:ring-indigo-300"
          value={filters.intent}
          onChange={handleFilterChange}
        >
          <option value="teach">I want to Teach</option>
          <option value="learn">I want to Learn</option>
        </select>

        <input
          type="text"
          name="skill"
          placeholder="Skill e.g. Python"
          className="border px-4 py-2 rounded-lg bg-white/70 dark:bg-gray-800/70 
                     dark:border-gray-600 shadow-sm backdrop-blur-md focus:ring focus:ring-indigo-300"
          value={filters.skill}
          onChange={handleFilterChange}
        />

        <select
          name="availability"
          className="border px-4 py-2 rounded-lg bg-white/70 dark:bg-gray-800/70 
                     dark:border-gray-600 shadow-sm backdrop-blur-md focus:ring focus:ring-indigo-300"
          value={filters.availability}
          onChange={handleFilterChange}
        >
          <option value="">Any Availability</option>
          <option value="Weekends">Weekends</option>
          <option value="Mon–Fri">Mon–Fri</option>
        </select>
      </motion.div>

      <div className="text-right mb-6">
        <button
          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 
                     text-white px-6 py-2 rounded-full shadow-md hover:shadow-xl transition transform hover:scale-105"
          onClick={findMatches}
        >
          🔄 Find Matches
        </button>
      </div>

      {matches.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400 mt-12">
          No matches found. Try different filters.
        </p>
      ) : (
        <div className="space-y-4">
          {matches.map((match, index) => (
            <motion.div
              key={match._id}
              className="flex justify-between items-center p-5 rounded-2xl
                         bg-white/60 dark:bg-gray-800/60 backdrop-blur-md
                         shadow-md hover:shadow-2xl transition transform hover:scale-[1.02]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* Left: Profile Info */}
              <div className="flex gap-5 items-start">
                <img
                  src={match.profilePicture || "/default-avatar.png"}
                  alt="User"
                  className="w-16 h-16 rounded-full object-cover border dark:border-gray-600 shadow-sm"
                />
                <div>
                  <h2 className="font-semibold text-lg">
                    <Link
                      to={`/profile/${match._id}`}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {match.fullName}
                    </Link>
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                    <MapPin size={14} /> {match.location || "Unknown"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                    {match.bio || "No bio available"}
                  </p>

                  {/* Skills Offered */}
                  <div className="mt-3">
                    <strong className="text-gray-700 dark:text-gray-300">Skills Offered:</strong>{" "}
                    {match.skillsToTeach?.length > 0 ? (
                      match.skillsToTeach.map((skill, i) => (
                        <span
                          key={i}
                          className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 
                                     text-xs px-2 py-1 rounded-full mr-1 mt-1"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">N/A</span>
                    )}
                  </div>

                  {/* Skills Wanted */}
                  <div className="mt-2">
                    <strong className="text-gray-700 dark:text-gray-300">Skills Wanted:</strong>{" "}
                    {match.skillsToLearn?.length > 0 ? (
                      match.skillsToLearn.map((skill, i) => (
                        <span
                          key={i}
                          className="inline-block bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 
                                     text-xs px-2 py-1 rounded-full mr-1 mt-1"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">N/A</span>
                    )}
                  </div>

                  {/* Availability */}
                  <div className="mt-2">
                    <strong className="text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <Calendar size={14} /> Availability:
                    </strong>{" "}
                    {Array.isArray(match.availability) && match.availability.length > 0 ? (
                      match.availability.map((slot, i) => (
                        <span
                          key={i}
                          className="inline-block bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 
                                     text-xs px-2 py-1 rounded-full mr-1 mt-1"
                        >
                          {slot.day} ({slot.time})
                        </span>
                      ))
                    ) : typeof match.availability === "object" && match.availability !== null ? (
                      <span className="inline-block bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 
                                         text-xs px-2 py-1 rounded-full mr-1 mt-1">
                        {match.availability.day} ({match.availability.time})
                      </span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">N/A</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex flex-col gap-2 items-end">
                <button
                  onClick={() => sendConnectionRequest(match._id)}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1 rounded-full 
                             shadow flex items-center gap-1 text-sm transition hover:scale-105"
                >
                  <UserPlus size={16} /> Connect
                </button>

                <button
                  disabled={!match.isConnected}
                  onClick={() =>
                    match.isConnected && (window.location.href = `/chat?to=${match._id}`)
                  }
                  className={`px-4 py-1 rounded-full flex items-center gap-1 text-sm shadow transition ${
                    match.isConnected
                      ? "bg-green-500 hover:bg-green-600 text-white hover:scale-105"
                      : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <MessageCircle size={16} /> Chat
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
