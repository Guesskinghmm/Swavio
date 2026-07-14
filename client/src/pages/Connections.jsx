import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Clock, Check, X, MessageCircle } from "lucide-react";

export default function Connections() {
  const userId = localStorage.getItem("userId");
  const [pendingReceived, setPendingReceived] = useState([]);
  const [pendingSent, setPendingSent] = useState([]);
  const [accepted, setAccepted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("received");

  const fetchConnections = async () => {
    try {
      const [pendingRes, sentRes, acceptedRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/connection/pending/${userId}`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/connection/pending/sent/${userId}`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/connection/accepted/${userId}`),
      ]);
      setPendingReceived(pendingRes.data || []);
      setPendingSent(sentRes.data || []);
      setAccepted(acceptedRes.data || []);
    } catch (err) {
      console.error("Error fetching connections", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleAccept = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/connection/accept/${id}`);
      fetchConnections();
    } catch (err) {
      console.error("Failed to accept request:", err);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/connection/${id}`);
      fetchConnections();
    } catch (err) {
      console.error("Failed to reject/cancel request:", err);
    }
  };

  const renderAvailability = (availability) => {
    if (!availability || availability.length === 0) {
      return (
        <span className="text-gray-500 text-xs flex items-center gap-1">
          <Clock size={14} /> No availability
        </span>
      );
    }
    return availability.map((slot, idx) => (
      <span
        key={`${slot.day}-${slot.time}-${idx}`}
        className="inline-block bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 px-2 py-0.5 rounded-full mr-1 text-xs"
      >
        {slot.day} ({slot.time})
      </span>
    ));
  };

  const Card = ({ user, actions }) => (
    <motion.div
      className="backdrop-blur-md bg-white/70 dark:bg-gray-800/70 rounded-2xl shadow-lg border border-gray-200/30 dark:border-gray-700/50 p-5 flex justify-between items-center hover:shadow-2xl hover:scale-[1.01] transition-all"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-center gap-4">
        <img
          src={user.profilePicture || "/default-avatar.png"}
          alt="User"
          className="w-16 h-16 rounded-full border-2 border-indigo-400 object-cover shadow-sm"
        />
        <div>
          <p className="font-semibold text-lg text-gray-800 dark:text-gray-200 flex items-center gap-1">
            <User size={18} /> {user.fullName || "Unnamed User"}
          </p>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Mail size={14} /> {user.email}
          </p>
          <div className="mt-2">{renderAvailability(user.availability)}</div>
        </div>
      </div>
      {actions}
    </motion.div>
  );

  const TabContent = ({ data, type }) => (
    <AnimatePresence>
      {data.length === 0 ? (
        <motion.p
          className="text-center text-gray-500 dark:text-gray-400 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {type === "received"
            ? "No pending requests."
            : type === "sent"
            ? "No sent requests."
            : "No accepted connections yet."}
        </motion.p>
      ) : (
        <motion.div
          className="grid sm:grid-cols-2 gap-5 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {data.map((conn) => {
            const user =
              type === "received"
                ? conn.user1
                : type === "sent"
                ? conn.user2
                : conn.user1._id === userId
                ? conn.user2
                : conn.user1;

            const actions =
              type === "received" ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(conn._id)}
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg shadow-sm"
                  >
                    <Check size={16} /> Accept
                  </button>
                  <button
                    onClick={() => handleReject(conn._id)}
                    className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg shadow-sm"
                  >
                    <X size={16} /> Reject
                  </button>
                </div>
              ) : type === "sent" ? (
                <button
                  onClick={() => handleReject(conn._id)}
                  className="flex items-center gap-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg shadow-sm"
                >
                  <X size={16} /> Cancel
                </button>
              ) : (
                <button
                  onClick={() =>
                    (window.location.href = `/chat?to=${user._id}`)
                  }
                  className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg shadow-sm"
                >
                  <MessageCircle size={16} /> Chat
                </button>
              );

            return <Card key={conn._id} user={user} actions={actions} />;
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (loading) return <p className="text-center p-6 text-lg">Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 text-gray-900 dark:text-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
        Connections
      </h1>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-8">
        {[
          { key: "received", label: "Pending Received" },
          { key: "sent", label: "Pending Sent" },
          { key: "accepted", label: "Accepted" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2 rounded-full font-medium transition-all shadow-sm ${
              activeTab === tab.key
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "received" && (
        <TabContent data={pendingReceived} type="received" />
      )}
      {activeTab === "sent" && <TabContent data={pendingSent} type="sent" />}
      {activeTab === "accepted" && (
        <TabContent data={accepted} type="accepted" />
      )}
    </div>
  );
}
