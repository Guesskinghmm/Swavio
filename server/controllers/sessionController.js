import Session      from "../models/sessionModel.js";
import User         from "../models/User.js";
import Notification from "../models/Notification.js";
import Quiz         from "../models/Quiz.js";

// ── Helper: require caller to be teacher or student ───────────────────────────
function assertSessionParticipant(session, callerId) {
  const isParticipant =
    session.teacherId.toString() === callerId ||
    session.studentId.toString() === callerId;
  return isParticipant;
}

export const getSessions = async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user._id.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Forbidden: Cannot view another user's sessions." });
    }

    const sessions = await Session.find({
      $or: [{ teacherId: userId }, { studentId: userId }],
    }).sort({ date: 1 });
    res.json(sessions);
  } catch (err) {
    console.error("getSessions error:", err.message);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
};

export const createSession = async (req, res) => {
  try {
    const { teacherId, studentId, skill, date, time, notes } = req.body;
    const callerId = req.user._id.toString();

    if (!teacherId || !studentId || !skill || !date || !time)
      return res.status(400).json({ error: "All fields are required" });

    // Only teacher or student may create the session record
    if (callerId !== teacherId && callerId !== studentId)
      return res.status(403).json({ error: "Forbidden: you are not a participant in this session." });

    const teacher = await User.findById(teacherId);
    const student = await User.findById(studentId);
    if (!teacher || !student)
      return res.status(404).json({ error: "Teacher or Student not found" });

    const sessionDateTime = new Date(`${date}T${time}:00`);

    const newSession = new Session({
      teacherId,
      teacherName: teacher.fullName,
      studentId,
      studentName: student.fullName,
      skill,
      date: sessionDateTime,
      notes,
    });

    await newSession.save();

    teacher.sessionsTaught += 1;
    await teacher.save();
    student.sessionsLearned += 1;
    await student.save();

    const dateStr = sessionDateTime.toLocaleDateString("en-IN", { dateStyle: "medium" });
    const timeStr = sessionDateTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    const teacherMsg = `📅 Session confirmed: you'll teach "${skill}" to ${student.fullName} on ${dateStr} at ${timeStr}`;
    const studentMsg = `📅 ${teacher.fullName} scheduled a "${skill}" session with you on ${dateStr} at ${timeStr}`;

    const teacherNotif = await Notification.create({ user: teacherId, type: "session", message: teacherMsg, link: "/sessions" });
    const studentNotif = await Notification.create({ user: studentId, type: "session", message: studentMsg, link: "/sessions" });

    req.io?.to(studentId.toString()).emit("notification", studentNotif);
    req.io?.to(teacherId.toString()).emit("notification", teacherNotif);

    res.status(201).json(newSession);
  } catch (err) {
    console.error("❌ Error creating session:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ error: "Session not found" });

    if (!assertSessionParticipant(session, req.user._id.toString()))
      return res.status(403).json({ error: "Forbidden: not a session participant." });

    const { date, time } = req.body;
    let updatedData = { ...req.body };

    if (date && time) {
      updatedData.date = new Date(`${date}T${time}:00`);
      delete updatedData.time;
    }

    const updated = await Session.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.json(updated);
  } catch (err) {
    console.error("updateSession error:", err.message);
    res.status(500).json({ error: "Failed to update session" });
  }
};

export const deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ error: "Session not found" });

    if (!assertSessionParticipant(session, req.user._id.toString()))
      return res.status(403).json({ error: "Forbidden: not a session participant." });

    await Session.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("deleteSession error:", err.message);
    res.status(500).json({ error: "Failed to delete session" });
  }
};

export const completeSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ error: "Session not found" });

    if (!assertSessionParticipant(session, req.user._id.toString()))
      return res.status(403).json({ error: "Forbidden: not a session participant." });

    const { rating, feedback } = req.body;

    const updatedSession = await Session.findByIdAndUpdate(
      req.params.id,
      { status: "completed", rating, feedback },
      { new: true }
    );

    const numRating = Number(rating);
    if (teacher && !isNaN(numRating) && numRating >= 1 && numRating <= 5) {
      teacher.ratingsReceived.push({ userId: updatedSession.studentId, rating: numRating });
      teacher.ratingCount = teacher.ratingsReceived.length;
      teacher.rating = teacher.ratingsReceived.reduce((sum, r) => sum + r.rating, 0) / teacher.ratingCount;

      teacher.badges = [];
      if (teacher.ratingCount >= 1)  teacher.badges.push("⭐ Beginner Tutor");
      if (teacher.ratingCount >= 3 && teacher.rating >= 3)   teacher.badges.push("🌟 Good Tutor");
      if (teacher.ratingCount >= 10 && teacher.rating >= 4.5) teacher.badges.push("🏆 Top Mentor");

      await teacher.save();
    }

    const notifMsg = `✅ Session on ${updatedSession.skill} is completed!`;
    const teacherNotif = await Notification.create({ user: updatedSession.teacherId, type: "session_complete", message: notifMsg, link: "/sessions" });
    const studentNotif = await Notification.create({ user: updatedSession.studentId, type: "session_complete", message: notifMsg, link: "/sessions" });

    req.io?.to(updatedSession.teacherId.toString()).emit("notification", teacherNotif);
    req.io?.to(updatedSession.studentId.toString()).emit("notification", studentNotif);

    // Assign a pending quiz to the student — only fields declared in Quiz schema
    if (updatedSession.skill) {
      const quiz = await Quiz.create({
        skill:    updatedSession.skill,
        userId:   updatedSession.studentId,   // declared in schema
        status:   "pending",                  // declared in schema
        questions: [],                        // empty until student generates via Groq
      });

      const quizNotif = await Notification.create({
        user:    updatedSession.studentId,
        type:    "quiz",
        message: `📝 New quiz available for ${updatedSession.skill} after your session!`,
        link:    "/quizzes",
      });

      req.io?.to(updatedSession.studentId.toString()).emit("notification", quizNotif);
    }

    res.json(updatedSession);
  } catch (err) {
    console.error("❌ Complete Session Error:", err.message);
    res.status(500).json({ error: "Failed to complete session" });
  }
};
