import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import { motion } from "framer-motion";
import { Smile, Paperclip, Send, Video, Trash2 } from "lucide-react";
import { socket, SERVER_URL } from "../socket";
import VideoCall from "./VideoCall"; // ✅ Import modal component

export default function Chat() {
  const [searchParams] = useSearchParams();
  const receiverId = searchParams.get("to");
  const userId = localStorage.getItem("userId");

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [receiverUser, setReceiverUser] = useState(null);
  const [showCall, setShowCall] = useState(false);

  const fileInputRef = useRef();
  const chatEndRef = useRef();
  const chatContainerRef = useRef();

  // ✅ Track if user is at bottom
  const [isUserAtBottom, setIsUserAtBottom] = useState(true);

  // Fetch user data
  useEffect(() => {
    if (userId) axios.get(`${SERVER_URL}/api/users/${userId}`).then((res) => setCurrentUser(res.data));
    if (receiverId) axios.get(`${SERVER_URL}/api/users/${receiverId}`).then((res) => setReceiverUser(res.data));
  }, [userId, receiverId]);

  // Join socket room
  useEffect(() => {
    if (userId) socket.emit("join", userId);
  }, [userId]);

  // ✅ Fetch initial messages
  useEffect(() => {
    if (!userId || !receiverId) return;
    axios.get(`${SERVER_URL}/api/messages/${userId}/${receiverId}`).then((res) => setMessages(res.data));
  }, [userId, receiverId]);

  // ✅ Auto-refresh messages every 3 seconds
  useEffect(() => {
    if (!userId || !receiverId) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${SERVER_URL}/api/messages/${userId}/${receiverId}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Auto-refresh error:", err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);

    return () => clearInterval(interval);
  }, [userId, receiverId]);

  // ✅ Socket listeners
  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      if (
        (msg.senderId === receiverId && msg.receiverId === userId) ||
        (msg.senderId === userId && msg.receiverId === receiverId)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on("call-ended", ({ senderId }) => {
      if (senderId === receiverId) {
        setMessages((prev) => [
          ...prev,
          { text: "📴 Call ended", senderId: "system", createdAt: new Date() }
        ]);
        setShowCall(false);
      }
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("call-ended");
    };
  }, [receiverId, userId]);

  // ✅ Auto-scroll only if user is at bottom
  useEffect(() => {
    if (isUserAtBottom) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isUserAtBottom]);

  // ✅ Handle sending message
  const sendMessage = async (customText = null) => {
    if (!customText && !message && !selectedFile) return;

    const formData = new FormData();
    formData.append("senderId", userId);
    formData.append("receiverId", receiverId);
    formData.append("text", customText || message);
    formData.append("senderName", currentUser?.fullName || "Someone");
    if (selectedFile) formData.append("file", selectedFile);

    try {
      const res = await axios.post(`${SERVER_URL}/api/messages`, formData);
      socket.emit("sendMessage", res.data);
      setMessages((prev) => [...prev, res.data]);
      setMessage("");
      setSelectedFile(null);
      fileInputRef.current.value = "";
      setIsUserAtBottom(true); // ✅ Scroll down after sending message
    } catch (err) {
      console.error("Send error:", err);
    }
  };

  // ✅ Clear chat
  const clearChat = async () => {
    try {
      await axios.delete(`${SERVER_URL}/api/messages/${userId}/${receiverId}`);
      setMessages([]);
    } catch (err) {
      console.error("Clear chat error:", err);
    }
  };

  // ✅ Emoji picker
  const handleEmojiClick = (emojiData) => setMessage((prev) => prev + emojiData.emoji);

  // ✅ End video call
  const handleEndCall = () => {
    socket.emit("call-ended", { senderId: userId, receiverId });
    sendMessage("📴 Call ended");
    setShowCall(false);
  };

  // ✅ Render attachments
  const renderFileMessage = (fileUrl) => {
    const fullUrl = `${SERVER_URL}${fileUrl}`;
    const ext = fileUrl.split(".").pop().toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext))
      return <img src={fullUrl} className="w-40 rounded-md mb-1" />;
    if (["mp4", "webm", "ogg"].includes(ext))
      return <video src={fullUrl} className="w-40 rounded-md mb-1" controls />;
    return (
      <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline block mb-1">
        📎 {ext.toUpperCase()} File
      </a>
    );
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto p-4 h-screen flex flex-col bg-white dark:bg-gray-900 rounded-lg shadow-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          {receiverUser?.fullName || "Chat"}
        </h2>
        <button
          onClick={() => setShowCall(true)}
          className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-full shadow"
        >
          <Video size={18} />
        </button>
      </div>

      {/* Chat Messages */}
      <div
        ref={chatContainerRef}
        onScroll={() => {
          if (!chatContainerRef.current) return;
          const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
          setIsUserAtBottom(scrollTop + clientHeight >= scrollHeight - 50);
        }}
        className="flex-grow overflow-y-auto space-y-3 p-3"
      >
        {messages.map((msg, i) => {
          const isMine = msg.senderId === userId;
          const isSystem = msg.senderId === "system";
          return (
            <motion.div
              key={i}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div
                className={`p-3 max-w-xs rounded-2xl shadow break-words ${
                  isSystem
                    ? "bg-gray-300 text-gray-800 text-center"
                    : isMine
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none"
                }`}
              >
                {msg.fileUrl && renderFileMessage(msg.fileUrl)}
                {msg.text && <p>{msg.text}</p>}
                {!isSystem && (
                  <small className="text-xs opacity-70 block mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </small>
                )}
              </div>
            </motion.div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input bar */}
      <div className="flex items-center gap-2 p-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
        <button onClick={() => setShowEmoji(!showEmoji)} className="text-gray-500 hover:text-yellow-500">
          <Smile size={22} />
        </button>

        {showEmoji && (
          <div className="absolute bottom-20 left-4 z-10">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}

        <input
          className="flex-grow border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 focus:outline-none focus:ring focus:ring-blue-300 dark:bg-gray-700 dark:text-white"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => setSelectedFile(e.target.files[0])}
          accept=".pdf,image/*,video/*,.zip,.rar"
          hidden
        />
        <button onClick={() => fileInputRef.current.click()} className="text-gray-500 hover:text-blue-500">
          <Paperclip size={22} />
        </button>

        <button onClick={() => sendMessage()} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-full shadow">
          <Send size={18} />
        </button>

        <button onClick={clearChat} className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-full shadow">
          <Trash2 size={18} />
        </button>
      </div>

      {/* Video Call Modal */}
      {showCall && (
        <VideoCall
          userId={userId}
          receiverId={receiverId}
          onEndCall={handleEndCall}
        />
      )}
    </motion.div>
  );
}
