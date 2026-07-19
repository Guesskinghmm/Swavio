import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, Mail, Clock, Check, X, MessageCircle, Users } from "lucide-react";

export default function Connections() {
  const userId   = localStorage.getItem("userId");
  const navigate = useNavigate();
  const [pendingReceived, setPendingReceived] = useState([]);
  const [pendingSent,     setPendingSent]     = useState([]);
  const [accepted,        setAccepted]        = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [activeTab,       setActiveTab]       = useState("received");

  const fetchConnections = async () => {
    try {
      const [pendingRes, sentRes, acceptedRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/connection/pending/${userId}`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/connection/pending/sent/${userId}`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/connection/accepted/${userId}`),
      ]);
      setPendingReceived(pendingRes.data || []);
      setPendingSent(sentRes.data     || []);
      setAccepted(acceptedRes.data    || []);
    } catch (err) {
      console.error("Error fetching connections", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConnections(); }, []); // eslint-disable-line

  const handleAccept = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/connection/accept/${id}`);
      fetchConnections();
    } catch (err) { console.error("Failed to accept:", err); }
  };

  const handleReject = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/connection/${id}`);
      fetchConnections();
    } catch (err) { console.error("Failed to reject:", err); }
  };

  const TABS = [
    { key: "received", label: "Received",  count: pendingReceived.length },
    { key: "sent",     label: "Sent",      count: pendingSent.length },
    { key: "accepted", label: "Connected", count: accepted.length },
  ];

  const getUser = (conn, type) =>
    type === "received"
      ? conn.user1
      : type === "sent"
      ? conn.user2
      : conn.user1._id === userId
      ? conn.user2
      : conn.user1;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="page-title">Connections</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your connection requests and accepted matches.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-700 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "text-brand-600 dark:text-brand-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-1.5 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key
                  ? "bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              }`}>
                {tab.count}
              </span>
            )}
            {activeTab === tab.key && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 dark:bg-brand-400 rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {(() => {
            const data =
              activeTab === "received" ? pendingReceived :
              activeTab === "sent"     ? pendingSent     : accepted;
            const type = activeTab;

            if (data.length === 0) {
              return (
                <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                  <Users size={32} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">
                    {type === "received" ? "No pending requests." :
                     type === "sent"     ? "No sent requests."    :
                                          "No connections yet. Start connecting through Matchmaking."}
                  </p>
                </div>
              );
            }

            return (
              <div className="grid sm:grid-cols-2 gap-3">
                {data.map((conn) => {
                  const user = getUser(conn, type);
                  return (
                    <motion.div
                      key={conn._id}
                      className="card card-p flex items-start gap-4"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <img
                        src={user.profilePicture || "/default-avatar.png"}
                        alt={user.fullName}
                        className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {user.fullName || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 truncate">
                          <Mail size={11} /> {user.email}
                        </p>
                        {user.availability?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {user.availability.slice(0, 2).map((slot, i) => (
                              <span key={i} className="badge-gray text-xs">
                                <Clock size={10} className="inline mr-1" />
                                {slot.day} {slot.time}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 mt-3">
                          {type === "received" && (
                            <>
                              <button
                                onClick={() => handleAccept(conn._id)}
                                className="btn btn-primary btn-sm"
                              >
                                <Check size={13} /> Accept
                              </button>
                              <button
                                onClick={() => handleReject(conn._id)}
                                className="btn btn-secondary btn-sm"
                              >
                                <X size={13} /> Decline
                              </button>
                            </>
                          )}
                          {type === "sent" && (
                            <button
                              onClick={() => handleReject(conn._id)}
                              className="btn btn-secondary btn-sm"
                            >
                              <X size={13} /> Cancel
                            </button>
                          )}
                          {type === "accepted" && (
                            <button
                              onClick={() => navigate(`/chat?to=${user._id}`)}
                              className="btn btn-primary btn-sm"
                            >
                              <MessageCircle size={13} /> Message
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            );
          })()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
