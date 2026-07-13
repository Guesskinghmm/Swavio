import React, { useEffect, useState } from "react";
import axios from "axios";

export default function VideoCall() {
  const [meetingUrl, setMeetingUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const { data } = await axios.get("/api/video/create-room");
        setMeetingUrl(data.meetingUrl);
      } catch (err) {
        console.error("Error creating meeting:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMeeting();
  }, []);

  return (
    <div className="flex flex-col items-center p-4">
      {loading ? (
        <h2 className="text-lg font-semibold">Creating meeting...</h2>
      ) : (
        <>
          <h2 className="text-xl font-bold mb-4">Jitsi Video Call</h2>
          <a
            href={meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition duration-300"
          >
            Join Video Call
          </a>
          <p className="mt-3 text-gray-600">
            Share this link with others:{" "}
            <a
              href={meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-green-600"
            >
              {meetingUrl}
            </a>
          </p>
        </>
      )}
    </div>
  );
}
