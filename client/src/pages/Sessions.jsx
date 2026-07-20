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
  BookOpen,
  Plus,
  Loader2,
} from "lucide-react";

// Helper: formats local date and time to YYYY-MM-DDTHH:MM
const getMinDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function Sessions() {
  const userId = localStorage.getItem("userId");
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    skill: "",
    datetime: "",
    studentId: "",
    notes: "",
  });
  
  const [editId, setEditId] = useState(null);
  const [sessionType, setSessionType] = useState("teaching");
  const [showModal, setShowModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false); // ✅ Prevents double-submit

  // Fetch partners from established connections
  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/connection/accepted/${userId}`);
      const partnersList = (res.data || [])
        .map((conn) => {
          const otherUser = conn.user1?._id === userId ? conn.user2 : conn.user1;
          return otherUser;
        })
        .filter(Boolean);
      setStudents(partnersList);
    } catch (err) {
      console.error("❌ Error fetching established connections", err);
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
  }, [userId]); // eslint-disable-line

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    if (!formData.skill || !formData.datetime || !formData.studentId) {
      alert("⚠️ Please fill in all required fields (Skill, Date & Time, and User)");
      return;
    }

    const selectedDateTime = new Date(formData.datetime);
    if (selectedDateTime < new Date()) {
      alert("⚠️ Cannot book a session in the past!");
      return;
    }

    if (saving) return; // ✅ Guard: block re-entry if already saving
    setSaving(true);

    const [date, time] = formData.datetime.split("T");
    const payload = {
      teacherId: sessionType === "teaching" ? userId : formData.studentId,
      studentId: sessionType === "learning" ? userId : formData.studentId,
      skill: formData.skill,
      date,
      time,
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
    } finally {
      setSaving(false); // ✅ Always re-enable
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setFormData({ skill: "", datetime: "", studentId: "", notes: "" });
    setEditId(null);
    setSessionType("teaching");
  };

  const handleEdit = (session) => {
    const d = new Date(session.date);
    setSessionType(session.teacherId === userId ? "teaching" : "learning");
    
    // Format to local YYYY-MM-DDTHH:MM for datetime-local input
    const offset = d.getTimezoneOffset() * 60000;
    const localISOTime = new Date(d.getTime() - offset).toISOString().slice(0, 16);

    setFormData({
      skill: session.skill,
      datetime: localISOTime,
      studentId: session.teacherId === userId ? session.studentId : session.teacherId,
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
      const payload = {};
      if (selectedSession.studentId === userId) {
        payload.rating = rating;
        payload.feedback = feedback;
      }
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/sessions/${selectedSession._id}/complete`,
        payload
      );
      setShowModal(false);
      fetchSessions();
    } catch (err) {
      console.error("❌ Error completing session", err);
      alert("❌ Failed to complete session!");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pendingSessions = sessions.filter((s) => !s.completed);
  const completedSessions = sessions.filter((s) => s.completed);

  const isFormInvalid = !formData.skill || !formData.datetime || !formData.studentId;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title mb-1">My Sessions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Schedule and manage your peer tutoring exchange sessions.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary btn-md shrink-0 shadow-sm"
          >
            <Plus size={16} /> Schedule Session
          </button>
        )}
      </div>

      {/* Booking Form Card */}
      {showForm && (
        <div className="card card-p mb-10 border border-gray-200 dark:border-gray-800 animate-fade-in-up">
          <h2 className="section-heading mb-6 flex items-center gap-2">
            <BookOpen size={16} className="text-brand-500" />
            {editId ? "Edit Scheduled Session" : "Schedule New Session"}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Session Type
              </label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
                className="input p-3 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="teaching">🧑‍🏫 Teaching (You teach others)</option>
                <option value="learning">📚 Learning (Others teach you)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                {sessionType === "teaching" ? "Select Student" : "Select Tutor"}
              </label>
              <select
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                className="input p-3 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">👥 Choose partner...</option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Topic / Skill
              </label>
              <input
                type="text"
                name="skill"
                placeholder="e.g. French, Python, Guitar"
                value={formData.skill}
                onChange={handleChange}
                className="input p-3 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Date & Time
              </label>
              <input
                type="datetime-local"
                name="datetime"
                min={getMinDateTime()}
                value={formData.datetime}
                onChange={handleChange}
                className="input p-3 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                placeholder="Add any goals, preparation links, or description..."
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="input p-3 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving || isFormInvalid}
              className="btn btn-primary btn-md flex-1 md:flex-initial md:px-8 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                  Saving...
                </>
              ) : editId ? (
                "Update Session"
              ) : (
                "Save & Book"
              )}
            </button>
            <button
              onClick={resetForm}
              className="btn btn-secondary btn-md"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Upcoming Sessions List */}
      <Section
        title="Upcoming Sessions"
        sessions={pendingSessions}
        userId={userId}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onMarkComplete={setShowModal}
        setSelectedSession={setSelectedSession}
      />

      {/* Completed Sessions List */}
      <Section
        title="Completed Sessions"
        sessions={completedSessions}
        userId={userId}
        completed
      />

      {/* Rating / Completion Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in-up">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400">
                <CheckCircle2 size={20} />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Complete Session
              </h2>
            </div>
            
            {selectedSession?.studentId === userId ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  You completed your learning session with <strong>{selectedSession?.teacherName}</strong>. Please rate their teaching to help them gain badges!
                </p>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Rating
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="input p-3 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>
                        {num} Star{num > 1 ? "s" : ""} {num === 5 ? " - Excellent!" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Feedback (Optional)
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="input p-3 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Write a brief review of the teaching..."
                    rows={3}
                  />
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Are you sure you want to mark this tutoring session with <strong>{selectedSession?.studentName}</strong> as completed?
              </p>
            )}
            
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCompleteSession}
                className="btn btn-primary btn-md flex-1"
              >
                Confirm Completion
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-secondary btn-md flex-1"
              >
                Cancel
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
  if (sessions.length === 0) {
    return (
      <div className="mb-10 text-center py-10 flex flex-col items-center justify-center">
        <Calendar size={32} className="text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
          {completed ? "No completed sessions yet." : "No upcoming sessions booked."}
        </p>
      </div>
    );
  }

  return (
    <div className="mb-10 animate-fade-in-up">
      <h3 className="text-xs font-semibold tracking-wider uppercase text-gray-400 dark:text-gray-500 mb-4 px-1">
        {title}
      </h3>
      <div className="grid grid-cols-1 gap-4">
        {sessions.map((session) => {
          const d = new Date(session.date);
          const isTeacher = session.teacherId === userId;
          
          return (
            <div
              key={session._id}
              className="card card-p flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-200 dark:border-gray-800"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h4 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                    {session.skill}
                  </h4>
                  <span className={isTeacher ? "badge-brand" : "badge-green"}>
                    {isTeacher ? "🧑‍🏫 Teaching" : "📚 Learning"}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-gray-400" />
                    {d.toLocaleDateString("en-IN", { dateStyle: "medium" })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} className="text-gray-400" />
                    {d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="flex items-center gap-1.5 sm:col-span-2 mt-0.5">
                    <User size={13} className="text-gray-400" />
                    {isTeacher ? `Student: ${session.studentName}` : `Teacher: ${session.teacherName}`}
                  </span>
                </div>
                
                {session.notes && (
                  <p className="text-xs text-gray-450 dark:text-gray-500 italic mt-1 pl-4 border-l border-gray-200 dark:border-gray-800">
                    "{session.notes}"
                  </p>
                )}
              </div>

              {!completed && (
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => {
                      setSelectedSession(session);
                      onMarkComplete(true);
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    <CheckCircle2 size={13} /> Complete
                  </button>
                  <button
                    onClick={() => onEdit(session)}
                    className="btn btn-secondary btn-sm"
                    aria-label="Edit schedule"
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                  <button
                    onClick={() => onDelete(session._id)}
                    className="btn btn-ghost btn-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                    aria-label="Delete schedule"
                  >
                    <Trash2 size={13} /> Delete
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
