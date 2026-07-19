import Session from "../models/sessionModel.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import Quiz from "../models/Quiz.js";

export const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [{ teacherId: req.params.userId }, { studentId: req.params.userId }],
    }).sort({ date: 1 });

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
};

export const createSession = async (req, res) => {
  try {
    const { teacherId, studentId, skill, date, time, notes } = req.body;

    if (!teacherId || !studentId || !skill || !date || !time) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const teacher = await User.findById(teacherId);
    const student = await User.findById(studentId);

    if (!teacher || !student) {
      return res.status(404).json({ error: "Teacher or Student not found" });
    }

    // ✅ Convert date+time to proper IST Date
    const sessionDateTime = new Date(`${date}T${time}:00`);

    const newSession = new Session({
      teacherId,
      teacherName: teacher.fullName,
      studentId,
      studentName: student.fullName,
      skill,
      date: sessionDateTime, // ✅ Save as Date
      notes,
    });

    await newSession.save();
    
    // 🔹 Increment session counts
    teacher.sessionsTaught += 1;
    await teacher.save();
    student.sessionsLearned += 1;
    await student.save();

    // ✅ Send personalised Notifications (correct subject for each recipient)
    const dateStr = sessionDateTime.toLocaleDateString("en-IN", { dateStyle: "medium" });
    const timeStr = sessionDateTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    const teacherMsg = `📅 Session confirmed: you'll teach "${skill}" to ${student.fullName} on ${dateStr} at ${timeStr}`;
    const studentMsg = `📅 ${teacher.fullName} scheduled a "${skill}" session with you on ${dateStr} at ${timeStr}`;

    const teacherNotif = await Notification.create({
      user: teacherId,
      type: "session",
      message: teacherMsg,
      link: "/sessions",
    });
    const studentNotif = await Notification.create({
      user: studentId,
      type: "session",
      message: studentMsg,
      link: "/sessions",
    });

    req.io?.to(studentId.toString()).emit("notification", studentNotif);
    req.io?.to(teacherId.toString()).emit("notification", teacherNotif);

    res.json(newSession);
  } catch (err) {
    console.error("❌ Error creating session:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateSession = async (req, res) => {
  try {
    const { date, time } = req.body;
    let updatedData = { ...req.body };

    // ✅ If date & time provided, convert to proper Date object
    if (date && time) {
      const sessionDateTime = new Date(`${date}T${time}:00`);
      updatedData.date = sessionDateTime;
      delete updatedData.time;
    }

    const session = await Session.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: "Failed to update session" });
  }
};

export const deleteSession = async (req, res) => {
  try {
    await Session.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete session" });
  }
};

export const completeSession = async (req, res) => {
  try {
    const { rating, feedback } = req.body;

    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { completed: true, rating, feedback },
      { new: true }
    );

    if (!session) return res.status(404).json({ error: "Session not found" });

    const student = await User.findById(session.studentId);
    if (student) {
      student.ratingsReceived.push({ userId: session.teacherId, rating });
      student.ratingCount = student.ratingsReceived.length;
      student.rating =
        student.ratingsReceived.reduce((sum, r) => sum + r.rating, 0) / student.ratingCount;

      student.badges = [];
      if (student.ratingCount >= 1) student.badges.push("⭐ Beginner Tutor");
      if (student.ratingCount >= 3 && student.rating >= 3) student.badges.push("🌟 Good Tutor");
      if (student.ratingCount >= 10 && student.rating >= 4.5) student.badges.push("🏆 Top Mentor");

      await student.save();
    }

    const notifMsg = `✅ Session on ${session.skill} is completed!`;
    const teacherNotif = await Notification.create({
      user: session.teacherId,
      type: "session_complete",
      message: notifMsg,
      link: "/sessions",
    });
    const studentNotif = await Notification.create({
      user: session.studentId,
      type: "session_complete",
      message: notifMsg,
      link: "/sessions",
    });

    req.io?.to(session.teacherId.toString()).emit("notification", teacherNotif);
    req.io?.to(session.studentId.toString()).emit("notification", studentNotif);

    if (session.skill) {
      const quiz = await Quiz.create({
        skill: session.skill,
        userId: session.studentId,
        status: "pending",
      });

      const quizNotif = await Notification.create({
        user: session.studentId,
        type: "quiz",
        message: `📝 New quiz available for ${session.skill} after your session!`,
        link: "/quizzes",
      });

      req.io?.to(session.studentId.toString()).emit("notification", quizNotif);
    }

    res.json(session);
  } catch (err) {
    console.error("❌ Complete Session Error:", err);
    res.status(500).json({ error: "Failed to complete session" });
  }
};
