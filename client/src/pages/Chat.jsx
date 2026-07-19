import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smile,
  Paperclip,
  Send,
  Video,
  Trash2,
  X,
  FileText,
  ChevronDown,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";
import { socket, SERVER_URL } from "../socket";
import VideoCall from "./VideoCall";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function FilePreviewMessage({ fileUrl }) {
  const fullUrl = `${SERVER_URL}${fileUrl}`;
  const ext = fileUrl.split(".").pop().toLowerCase();

  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext))
    return (
      <img
        src={fullUrl}
        alt="attachment"
        className="max-w-xs rounded-lg border border-white/20 mb-1"
      />
    );
  if (["mp4", "webm", "ogg"].includes(ext))
    return (
      <video src={fullUrl} controls className="max-w-xs rounded-lg mb-1" />
    );
  return (
    <a
      href={fullUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-xs underline opacity-90 mb-1"
    >
      <FileText size={14} />
      {ext.toUpperCase()} attachment
    </a>
  );
}

// ── Phase 3: Jitsi link parser ──────────────────────────────────────────────
// Matches https://8x8.vc/... URLs anywhere in a message string.
const JITSI_REGEX = /(https:\/\/8x8\.vc\/[^\s]+)/g;

function MessageContent({ text, isMine }) {
  if (!text) return null;

  const parts = text.split(JITSI_REGEX);
  if (parts.length === 1) {
    return <p className="leading-relaxed">{text}</p>;
  }

  return (
    <div className="space-y-2">
      {parts.map((part, i) => {
        if (JITSI_REGEX.test(part)) {
          JITSI_REGEX.lastIndex = 0;
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-opacity hover:opacity-90 ${
                isMine
                  ? "bg-white/20 text-white border border-white/30"
                  : "bg-brand-600 text-white"
              }`}
            >
              <Video size={14} className="shrink-0" />
              Join Video Call
            </a>
          );
        }
        JITSI_REGEX.lastIndex = 0;
        return part ? <p key={i} className="leading-relaxed">{part}</p> : null;
      })}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Chat() {
  const [searchParams, setSearchParams] = useSearchParams();
  const receiverId = searchParams.get("to");
  const userId = localStorage.getItem("userId");

  // Connections List & Sidebar
  const [connections, setConnections] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showCall, setShowCall] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [sending, setSending] = useState(false);

  const fileInputRef = useRef();
  const chatEndRef = useRef();
  const chatScrollRef = useRef();

  // Fetch current user details
  useEffect(() => {
    if (userId) {
      axios
        .get(`${SERVER_URL}/api/users/${userId}`)
        .then((r) => setCurrentUser(r.data))
        .catch((err) => console.error("Error fetching current user:", err));
    }
  }, [userId]);

  // Fetch accepted connections
  const fetchConnections = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`${SERVER_URL}/api/connection/accepted/${userId}`);
      setConnections(res.data || []);
    } catch (err) {
      console.error("Error fetching connections:", err);
    }
  }, [userId]);

  // Fetch notifications to compute unread counts in real-time
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`${SERVER_URL}/api/notifications/${userId}`);
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  }, [userId]);

  useEffect(() => {
    fetchConnections();
    fetchNotifications();
  }, [fetchConnections, fetchNotifications]);

  // Handle URL change or initial 'to' query param selection
  useEffect(() => {
    if (receiverId && connections.length > 0) {
      const matchedConn = connections.find((conn) => {
        const otherUser = conn.user1?._id === userId ? conn.user2 : conn.user1;
        return otherUser?._id === receiverId;
      });
      if (matchedConn) {
        const otherUser = matchedConn.user1?._id === userId ? matchedConn.user2 : matchedConn.user1;
        setActiveChatUser(otherUser);
      } else {
        // Fallback: direct fetch if connection list is not loaded/matched
        axios.get(`${SERVER_URL}/api/users/${receiverId}`)
          .then((res) => setActiveChatUser(res.data))
          .catch((err) => console.error("Error fetching fallback user:", err));
      }
    } else if (!receiverId) {
      setActiveChatUser(null);
    }
  }, [receiverId, connections, userId]);

  // Mark messages as read function (Phase 3)
  const markMessagesAsReadFn = useCallback(async (senderId) => {
    if (!userId || !senderId) return;
    try {
      await axios.put(`${SERVER_URL}/api/messages/${senderId}/${userId}/read`);
      // Update global notification components across the app
      window.dispatchEvent(new CustomEvent("notifications-updated"));
      // Refresh local notifications list
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark messages as read:", err);
    }
  }, [userId, fetchNotifications]);

  // Load message history when active user changes, and clear read notifications
  useEffect(() => {
    if (!userId || !activeChatUser?._id) {
      setMessages([]);
      return;
    }
    axios
      .get(`${SERVER_URL}/api/messages/${userId}/${activeChatUser._id}`)
      .then((res) => {
        setMessages(res.data);
        setIsAtBottom(true);
        // Clear unread state
        markMessagesAsReadFn(activeChatUser._id);
      })
      .catch((err) => console.error("Error loading messages:", err));
  }, [userId, activeChatUser, markMessagesAsReadFn]);

  // Named Socket Handlers (Phase 2 & Phase 3)
  useEffect(() => {
    const handleReceiveMessage = (msg) => {
      // ✅ Skip our own messages — already appended optimistically in sendMessage()
      if (msg.senderId === userId) return;

      const isCurrentActive = activeChatUser && msg.senderId === activeChatUser._id;
      if (
        (msg.senderId === activeChatUser?._id && msg.receiverId === userId) ||
        (msg.senderId === userId             && msg.receiverId === activeChatUser?._id)
      ) {
        setMessages((prev) => [...prev, msg]);
        if (isCurrentActive) {
          // Immediately mark message as read
          markMessagesAsReadFn(activeChatUser._id);
        }
      } else {
        // Notification for message from someone else - update counts
        fetchNotifications();
        window.dispatchEvent(new CustomEvent("notifications-updated"));
      }
    };

    const handleCallEnded = ({ senderId }) => {
      if (activeChatUser && senderId === activeChatUser._id) {
        setMessages((prev) => [
          ...prev,
          { text: "Call ended", senderId: "system", createdAt: new Date() },
        ]);
        setShowCall(false);
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("call-ended",     handleCallEnded);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("call-ended",     handleCallEnded);
    };
  }, [activeChatUser, userId, fetchNotifications, markMessagesAsReadFn]);

  // Auto scroll
  useEffect(() => {
    if (isAtBottom) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAtBottom]);

  const handleScroll = useCallback(() => {
    const el = chatScrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 60);
  }, []);

  // Send message
  const sendMessage = async (customText = null) => {
    if (!activeChatUser?._id) return;
    if (!customText && !message.trim() && !selectedFile) return;
    setSending(true);

    const formData = new FormData();
    formData.append("senderId",   userId);
    formData.append("receiverId", activeChatUser._id);
    formData.append("text",       customText || message);
    formData.append("senderName", currentUser?.fullName || "Someone");
    if (selectedFile) formData.append("file", selectedFile);

    try {
      const res = await axios.post(`${SERVER_URL}/api/messages`, formData);
      socket.emit("sendMessage", res.data);
      setMessages((prev) => [...prev, res.data]);
      setMessage("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setIsAtBottom(true);
    } catch (err) {
      console.error("Send error:", err);
    } finally {
      setSending(false);
    }
  };

  const clearChat = async () => {
    if (!activeChatUser?._id) return;
    try {
      await axios.delete(`${SERVER_URL}/api/messages/${userId}/${activeChatUser._id}`);
      setMessages([]);
    } catch (err) {
      console.error("Clear chat error:", err);
    }
  };

  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmoji(false);
  };

  const handleEndCall = () => {
    if (!activeChatUser?._id) return;
    socket.emit("call-ended", { senderId: userId, receiverId: activeChatUser._id });
    setShowCall(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectConnection = (userObj) => {
    setSearchParams({ to: userObj._id });
  };

  const goBackToSidebar = () => {
    setSearchParams({});
  };

  return (
    <div
      className="flex bg-white dark:bg-gray-900 overflow-hidden"
      style={{ height: "calc(100vh - 64px)" }}
    >
      {/* ── Sidebar (Left Column) ── */}
      <div
        className={`w-full md:w-80 shrink-0 flex flex-col border-r border-gray-200 dark:border-gray-800 ${
          activeChatUser ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <MessageSquare size={18} className="text-brand-500" />
            Messages
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {connections.length === 0 ? (
            <p className="text-xs text-center text-gray-400 dark:text-gray-500 py-10">
              No connections established yet.
            </p>
          ) : (
            connections.map((conn) => {
              const otherUser = conn.user1?._id === userId ? conn.user2 : conn.user1;
              if (!otherUser) return null;

              const isSelected = activeChatUser?._id === otherUser._id;
              // Calculate unread count using matches in link query params
              const userUnreadCount = notifications.filter(
                (n) => !n.isRead && n.type === "message" && n.link?.includes(`to=${otherUser._id}`)
              ).length;

              return (
                <button
                  key={conn._id}
                  onClick={() => selectConnection(otherUser)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                    isSelected
                      ? "bg-brand-50 dark:bg-brand-900/30"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <img
                    src={otherUser.profilePicture || "/default-avatar.png"}
                    alt={otherUser.fullName}
                    className="w-10 h-10 rounded-full object-cover border border-gray-150 dark:border-gray-700"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${
                      isSelected ? "text-brand-700 dark:text-brand-400" : "text-gray-900 dark:text-gray-200"
                    }`}>
                      {otherUser.fullName}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                      {otherUser.availability?.[0]
                        ? `${otherUser.availability[0].day} · ${otherUser.availability[0].time}`
                        : "SkillSwap Member"}
                    </p>
                  </div>
                  {userUnreadCount > 0 && (
                    <span className="shrink-0 bg-brand-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {userUnreadCount}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Active Chat Pane / Empty State (Right Column) ── */}
      <div
        className={`flex-1 flex-col bg-gray-50 dark:bg-gray-950 ${
          activeChatUser ? "flex" : "hidden md:flex"
        }`}
      >
        {activeChatUser ? (
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={goBackToSidebar}
                  className="md:hidden p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 mr-1"
                  aria-label="Back to messages list"
                >
                  <ArrowLeft size={18} />
                </button>
                <img
                  src={activeChatUser.profilePicture || "/default-avatar.png"}
                  alt={activeChatUser.fullName}
                  className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight truncate">
                    {activeChatUser.fullName}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Active now</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowCall(true)}
                  className="btn-ghost btn-sm rounded-lg text-gray-500 dark:text-gray-400"
                  title="Start video call"
                >
                  <Video size={18} />
                </button>
                <button
                  onClick={clearChat}
                  className="btn-ghost btn-sm rounded-lg text-gray-500 dark:text-gray-400 hover:text-red-500"
                  title="Clear chat"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Messages Scroll Container */}
            <div
              ref={chatScrollRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-2"
            >
              {messages.map((msg, i) => {
                const isMine = msg.senderId === userId;
                const isSystem = msg.senderId === "system";

                if (isSystem) {
                  return (
                    <div key={i} className="flex justify-center">
                      <span className="text-xs text-gray-450 dark:text-gray-500 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                        {msg.text}
                      </span>
                    </div>
                  );
                }

                return (
                  <motion.div
                    key={i}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div
                      className={`max-w-xs sm:max-w-md rounded-2xl px-3.5 py-2.5 text-sm break-words ${
                        isMine
                          ? "bg-brand-600 text-white rounded-br-sm"
                          : "bg-white dark:bg-gray-850 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800 rounded-bl-sm"
                      }`}
                      style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}
                    >
                      {msg.fileUrl && <FilePreviewMessage fileUrl={msg.fileUrl} />}
                      {msg.text && <MessageContent text={msg.text} isMine={isMine} />}
                      <p className={`text-[10px] mt-1 text-right ${isMine ? "text-white/60" : "text-gray-400 dark:text-gray-500"}`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Scroll bottom helper */}
            <AnimatePresence>
              {!isAtBottom && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => {
                    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
                    setIsAtBottom(true);
                  }}
                  className="absolute bottom-24 right-6 w-9 h-9 bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-full flex items-center justify-center shadow-float z-10"
                >
                  <ChevronDown size={16} className="text-gray-500" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Emoji picker container */}
            <AnimatePresence>
              {showEmoji && (
                <motion.div
                  className="absolute bottom-20 left-4 z-20"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                >
                  <EmojiPicker onEmojiClick={handleEmojiClick} height={360} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input bar */}
            <div className="shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-3">
              {selectedFile && (
                <div className="flex items-center gap-2 mb-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-805 rounded-lg px-3 py-2">
                  <Paperclip size={13} />
                  <span className="flex-1 truncate">{selectedFile.name}</span>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="hover:text-red-500 transition-colors"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowEmoji(!showEmoji)}
                  className="btn-ghost btn-sm rounded-lg text-gray-400 hover:text-amber-500 shrink-0"
                  aria-label="Emoji"
                >
                  <Smile size={20} />
                </button>

                <input
                  disabled={sending}
                  className="flex-1 min-w-0 px-4 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl border border-transparent focus:outline-none focus:border-brand-400 focus:bg-white dark:focus:bg-gray-700 transition-colors placeholder-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="Write a message…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                />

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                  accept=".pdf,image/*,video/*,.zip,.rar,.doc,.docx"
                  hidden
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-ghost btn-sm rounded-lg text-gray-400 hover:text-brand-500 shrink-0"
                  aria-label="Attach file"
                >
                  <Paperclip size={19} />
                </button>

                <button
                  onClick={() => sendMessage()}
                  disabled={sending || (!message.trim() && !selectedFile)}
                  className="btn btn-primary btn-sm rounded-xl shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Send"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>

            {/* Video Call Modal */}
            {showCall && (
              <VideoCall
                userId={userId}
                receiverId={activeChatUser._id}
                sendMessageFn={sendMessage}
                onEndCall={handleEndCall}
              />
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gray-50 dark:bg-gray-950">
            <div className="w-16 h-16 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-500 dark:text-brand-400 mb-4">
              <MessageSquare size={28} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Select a connection to start messaging
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
              Choose one of your learning partners from the sidebar to load the conversation thread.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
