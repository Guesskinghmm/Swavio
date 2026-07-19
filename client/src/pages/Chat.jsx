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
    // No Jitsi link — render as plain text
    return <p className="leading-relaxed">{text}</p>;
  }

  return (
    <div className="space-y-2">
      {parts.map((part, i) => {
        if (JITSI_REGEX.test(part)) {
          // Reset lastIndex since we're reusing the regex
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
        // Reset lastIndex for reuse
        JITSI_REGEX.lastIndex = 0;
        return part ? <p key={i} className="leading-relaxed">{part}</p> : null;
      })}
    </div>
  );
}


// ── Component ─────────────────────────────────────────────────────────────────

export default function Chat() {
  const [searchParams]  = useSearchParams();
  const receiverId      = searchParams.get("to");
  const userId          = localStorage.getItem("userId");

  const [messages,      setMessages]      = useState([]);
  const [message,       setMessage]       = useState("");
  const [selectedFile,  setSelectedFile]  = useState(null);
  const [showEmoji,     setShowEmoji]     = useState(false);
  const [currentUser,   setCurrentUser]   = useState(null);
  const [receiverUser,  setReceiverUser]  = useState(null);
  const [showCall,      setShowCall]      = useState(false);
  const [isAtBottom,    setIsAtBottom]    = useState(true);
  const [sending,       setSending]       = useState(false);

  const fileInputRef     = useRef();
  const chatEndRef       = useRef();
  const chatScrollRef    = useRef();

  // ── Fetch user info ──────────────────────────────────────────────────────
  useEffect(() => {
    if (userId)     axios.get(`${SERVER_URL}/api/users/${userId}`)    .then((r) => setCurrentUser(r.data));
    if (receiverId) axios.get(`${SERVER_URL}/api/users/${receiverId}`).then((r) => setReceiverUser(r.data));
  }, [userId, receiverId]);

  // ── Load initial messages ────────────────────────────────────────────────
  useEffect(() => {
    if (!userId || !receiverId) return;
    axios
      .get(`${SERVER_URL}/api/messages/${userId}/${receiverId}`)
      .then((res) => setMessages(res.data));
  }, [userId, receiverId]);

  // ── Socket listeners (Phase 2: named handlers so off() works correctly) ──
  useEffect(() => {
    const handleReceiveMessage = (msg) => {
      if (
        (msg.senderId === receiverId && msg.receiverId === userId) ||
        (msg.senderId === userId    && msg.receiverId === receiverId)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const handleCallEnded = ({ senderId }) => {
      if (senderId === receiverId) {
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
  }, [receiverId, userId]);

  // ── Auto-scroll ──────────────────────────────────────────────────────────
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

  // ── Send message (Phase 3 Bug 1: correct FormData for Multer) ────────────
  const sendMessage = async (customText = null) => {
    if (!customText && !message.trim() && !selectedFile) return;
    setSending(true);

    const formData = new FormData();
    formData.append("senderId",   userId);
    formData.append("receiverId", receiverId);
    formData.append("text",       customText || message);
    formData.append("senderName", currentUser?.fullName || "Someone");
    if (selectedFile) formData.append("file", selectedFile);

    try {
      // Axios auto-sets Content-Type: multipart/form-data for FormData
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
    try {
      await axios.delete(`${SERVER_URL}/api/messages/${userId}/${receiverId}`);
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
    socket.emit("call-ended", { senderId: userId, receiverId });
    setShowCall(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Layout: Phase 3 Bug 2 — Chat owns viewport, no footer ────────────────
  // height = 100vh - 64px navbar
  return (
    <div
      className="flex flex-col bg-gray-50 dark:bg-gray-900"
      style={{ height: "calc(100vh - 64px)" }}
    >

      {/* ── Header ── */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <img
            src={receiverUser?.profilePicture || "/default-avatar.png"}
            alt={receiverUser?.fullName}
            className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700"
          />
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
              {receiverUser?.fullName || "Loading…"}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Active now</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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

      {/* ── Messages list — flex-1 + overflow-y-auto fixes viewport bug ── */}
      <div
        ref={chatScrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-2"
      >
        {messages.map((msg, i) => {
          const isMine   = msg.senderId === userId;
          const isSystem = msg.senderId === "system";

          if (isSystem) {
            return (
              <div key={i} className="flex justify-center">
                <span className="text-xs text-gray-400 dark:text-gray-500 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
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
                    : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-sm"
                }`}
                style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }}
              >
                {msg.fileUrl && <FilePreviewMessage fileUrl={msg.fileUrl} />}
                {msg.text && <MessageContent text={msg.text} isMine={isMine} />}
                <p className={`text-xs mt-1.5 ${isMine ? "text-white/60" : "text-gray-400"}`}>
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </motion.div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Scroll-to-bottom button */}
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
            className="absolute bottom-24 right-6 w-9 h-9 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center shadow-float"
          >
            <ChevronDown size={16} className="text-gray-500" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Emoji picker ── */}
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

      {/* ── Input bar ── */}
      <div className="shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-3">

        {/* File selected indicator */}
        {selectedFile && (
          <div className="flex items-center gap-2 mb-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
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
            className="flex-1 min-w-0 px-4 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl border border-transparent focus:outline-none focus:border-brand-400 focus:bg-white dark:focus:bg-gray-700 transition-colors placeholder-gray-400"
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

      {/* ── Video Call Modal (Phase 3 Bug 3) ── */}
      {showCall && (
        <VideoCall
          userId={userId}
          receiverId={receiverId}
          sendMessageFn={sendMessage}
          onEndCall={handleEndCall}
        />
      )}
    </div>
  );
}
