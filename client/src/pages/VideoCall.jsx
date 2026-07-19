import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Copy,
  Check,
  ExternalLink,
  PhoneOff,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { socket } from "../socket";

/**
 * VideoCall
 *
 * Rendered as a modal overlay from Chat.jsx.
 * On mount it:
 *   1. Fetches a Jitsi meeting URL from the backend.
 *   2. Sends the link as a chat message to the other participant.
 *   3. Displays a clean "Join Room" and "Copy Link" interface.
 *      The raw URL/JWT is never rendered as visible text.
 *
 * Props:
 *   userId       – current user's ID
 *   receiverId   – the other participant's ID
 *   sendMessageFn – the Chat.sendMessage() function to auto-send the link
 *   onEndCall    – callback to close the modal
 */
export default function VideoCall({ userId, receiverId, sendMessageFn, onEndCall }) {
  const [meetingUrl, setMeetingUrl] = useState("");
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [copied,     setCopied]     = useState(false);
  const [linkSent,   setLinkSent]   = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchMeeting = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/video/create-room`
        );
        if (cancelled) return;

        setMeetingUrl(data.meetingUrl);

        // Auto-send the meeting link as a chat message
        if (sendMessageFn && !linkSent) {
          await sendMessageFn(`Video call started — join here: ${data.meetingUrl}`);
          setLinkSent(true);
        }

        // Notify the other participant via socket
        socket.emit("video-call-invite", {
          senderId:   userId,
          receiverId,
          meetingUrl: data.meetingUrl,
        });
      } catch (err) {
        if (!cancelled) setError("Unable to create a meeting room. Please try again.");
        console.error("Error creating meeting:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMeeting();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line

  const handleCopy = () => {
    if (!meetingUrl) return;
    navigator.clipboard.writeText(meetingUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-sm card card-p"
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1,    opacity: 1 }}
          exit={{ scale: 0.92,   opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
              <Video size={18} className="text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Video Call</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {loading ? "Setting up your room…" : error ? "Failed to connect" : "Room is ready"}
              </p>
            </div>
          </div>

          {/* Body */}
          {loading && (
            <div className="flex flex-col items-center py-6 gap-3">
              <Loader2 size={24} className="text-brand-500 animate-spin" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Creating your secure room…</p>
            </div>
          )}

          {error && !loading && (
            <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-3 mb-4">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {meetingUrl && !loading && (
            <>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                Your meeting room is ready. The link has been shared with the other
                participant. Use the buttons below to join or copy the link.
              </p>

              <div className="space-y-2">
                {/* Join Room */}
                <a
                  href={meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-md w-full"
                >
                  <ExternalLink size={15} />
                  Join Room
                </a>

                {/* Copy Link */}
                <button
                  onClick={handleCopy}
                  className="btn btn-secondary btn-md w-full"
                >
                  {copied ? (
                    <><Check size={15} /> Link copied</>
                  ) : (
                    <><Copy size={15} /> Copy link</>
                  )}
                </button>
              </div>

              <div className="divider my-4" />
            </>
          )}

          {/* End Call */}
          <button
            onClick={onEndCall}
            className="btn btn-danger btn-md w-full"
          >
            <PhoneOff size={15} />
            End call
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
