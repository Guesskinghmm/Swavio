// client/src/components/ChatHistory.jsx
import { useEffect, useState } from "react";
import axios from "../api/axios";

const ChatHistory = ({ userId }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    axios.get(`/api/messages/${userId}`).then(res => setMessages(res.data));
  }, [userId]);

  return (
    <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded shadow">
      <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">📜 Chat History</h3>
      {messages.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-300">No messages yet.</p>
      ) : (
        <ul className="space-y-2 max-h-64 overflow-y-auto text-sm">
          {messages.map(msg => (
            <li key={msg._id} className="text-gray-700 dark:text-gray-300">
              <strong>{msg.sender === userId ? "You" : "Partner"}:</strong> {msg.content}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChatHistory;
