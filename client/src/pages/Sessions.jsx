import { useEffect, useState } from "react";
import axios from "axios";
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  Edit2,
  Trash2,
  Star,
} from "lucide-react";

export default function Sessions() {
  const userId = localStorage.getItem("userId");
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    skill: "",
    date: "",
    time: "",
    studentId: "",
    notes: "",
  });
  const [editId, setEditId] = useState(null);
  const [sessionType, setSessionType] = useState("teaching");
  const [showModal, setShowModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`);
      setStudents(res.data.filter((u) => u._id !== userId));
    } catch (err) {
      console.error("❌ Error fetching users", err);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/sessions/${userId}`);
      setSessions(res.data);
    } catch (err) {
      console.error("❌ Error fetching sessions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchSessions();
  }, [userId]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    if (!formData.skill || !formData.date || !formData.time || !formData.studentId) {
      alert("⚠️ Please fill in all fields");
      return;
    }

    const payload = {
      teacherId: sessionType === "teaching" ? userId : formData.studentId,
      studentId: sessionType === "learning" ? userId : formData.studentId,
      skill: formData.skill,
      date: formData.date,
      time: formData.time,
      notes: formData.notes,
    };

    try {
      editId
        ? await axios.put(`${process.env.REACT_APP_API_URL}/api/sessions/${editId}`, payload)
        : await axios.post(`${process.env.REACT_APP_API_URL}/api/sessions`, payload);

      fetchSessions();
      resetForm();
    } catch (err) {
      console.error("❌ Error saving session", err);
      alert("❌ Failed to save session!");
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setFormData({ skill: "", date: "", time: "", studentId: "", notes: "" });
    setEditId(null);
    setSessionType("teaching");
  };

  const handleEdit = (session) => {
    const d = new Date(session.date);
    setSessionType(session.teacherId === userId ? "teaching" : "learning");
    setFormData({
      skill: session.skill,
      date: d.toISOString().split("T")[0],
      time: d.toISOString().slice(11, 16),
      studentId:
        session.teacherId === userId ? session.studentId : session.teacherId,
      notes: session.notes || "",
    });
    setEditId(session._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ Are you sure you want to delete this session?")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/sessions/${id}`);
      fetchSessions();
    } catch (err) {
      console.error("❌ Error deleting session", err);
    }
  };

  const handleCompleteSession = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/sessions/${selectedSession._id}/complete`,
        { rating, feedback }
      );
      setShowModal(false);
      fetchSessions();
    } catch (err) {
      console.error("❌ Error completing session", err);
      alert("❌ Failed to complete session!");
    }
  };

  if (loading)
    return <p className="text-center p-6 text-gray-600">⏳ Loading Sessions...</p>;

  const pendingSessions = sessions.filter((s) => !s.completed);
  const completedSessions = sessions.filter((s) => s.completed);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-600 drop-shadow">
        My Sessions
      </h1>

      <button
        onClick={() => resetForm() || setShowForm(!showForm)}
        className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 
                   text-white px-6 py-2 rounded-full shadow-md hover:shadow-xl transition transform hover:scale-105 mb-6"
      >
        {showForm ? "Cancel" : "➕ Book New Session"}
      </button>

      {showForm && (
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md p-6 rounded-lg shadow-xl mb-8 space-y-4 animate-fadeIn">
          <select
            value={sessionType}
            onChange={(e) => setSessionType(e.target.value)}
            className="border p-2 rounded w-full text-black"
          >
            <option value="teaching">🧑‍🏫 Teaching</option>
            <option value="learning">📚 Learning</option>
          </select>
          <input
            type="text"
            name="skill"
            placeholder="Skill"
            value={formData.skill}
            onChange={handleChange}
            className="border p-2 rounded w-full text-black"
          />
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="border p-2 rounded w-full text-black"
          />
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className="border p-2 rounded w-full text-black"
          />
          <select
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            className="border p-2 rounded w-full text-black"
          >
            <option value="">👥 Select User</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.fullName}
              </option>
            ))}
          </select>
          <textarea
            name="notes"
            placeholder="Notes (Optional)"
            value={formData.notes}
            onChange={handleChange}
            className="border p-2 rounded w-full text-black"
          />
          <button
            onClick={handleSave}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full shadow transition w-full hover:scale-105"
          >
            {editId ? "💾 Update Session" : "Save Session"}
          </button>
        </div>
      )}

      {/* Upcoming Sessions */}
      <Section
        title="Upcoming Sessions"
        sessions={pendingSessions}
        userId={userId}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onMarkComplete={setShowModal}
        setSelectedSession={setSelectedSession}
      />

      {/* Completed Sessions */}
      <Section
        title="Completed Sessions"
        sessions={completedSessions}
        userId={userId}
        completed
      />

      {/* Rating Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 animate-fadeIn">
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-xl w-96 shadow-2xl space-y-3 transform animate-scaleIn">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
              <Star className="text-yellow-500" /> Rate Session
            </h2>
            <label>Rating:</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="border p-2 rounded w-full text-black"
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num} Star{num > 1 && "s"}
                </option>
              ))}
            </select>
            <label>Feedback:</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="border p-2 rounded w-full text-black"
              placeholder="Write your feedback..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-full transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteSession}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full shadow transition hover:scale-105"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  sessions,
  userId,
  completed = false,
  onEdit,
  onDelete,
  onMarkComplete,
  setSelectedSession,
}) {
  if (sessions.length === 0)
    return (
      <p className="text-gray-500 text-center mb-6">
        {completed ? "No completed sessions yet." : "No upcoming sessions."}
      </p>
    );

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        {completed ? "✅ " : "📅 "}
        {title}
      </h2>
      <div className="space-y-4">
        {sessions.map((session) => {
          const d = new Date(session.date);
          return (
            <div
              key={session._id}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md p-5 rounded-xl shadow-md 
                         hover:shadow-2xl transition transform hover:scale-105 flex justify-between items-center"
            >
              <div className="space-y-1">
                <h3 className="text-xl font-semibold text-indigo-600">
                  {session.skill}
                </h3>
                <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Calendar size={16} className="text-indigo-500" />{" "}
                  {d.toLocaleDateString("en-IN", { dateStyle: "long" })}
                </p>
                <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Clock size={16} className="text-blue-500" />{" "}
                  {d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </p>
                <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <User size={16} className="text-emerald-500" /> With{" "}
                  {session.teacherId === userId
                    ? session.studentName
                    : session.teacherName}
                </p>
                {session.notes && (
                  <p className="text-gray-500 italic">📝 {session.notes}</p>
                )}
                {completed && (
                  <p className="text-green-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={16} /> Completed
                  </p>
                )}
              </div>
              {!completed && (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setSelectedSession(session);
                      onMarkComplete(true);
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full flex items-center gap-1 text-sm transition hover:scale-105"
                  >
                    <CheckCircle2 size={16} /> Complete
                  </button>
                  <button
                    onClick={() => onEdit(session)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-full flex items-center gap-1 text-sm transition hover:scale-105"
                  >
                    <Edit2 size={16} /> Edit
                  </button>
                  <button
                    onClick={() => onDelete(session._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full flex items-center gap-1 text-sm transition hover:scale-105"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
