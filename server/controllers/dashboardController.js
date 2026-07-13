import User from "../models/User.js";
import Session from "../models/sessionModel.js";
import Connection from "../models/Connection.js";

export const getDashboardData = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    const sessions = await Session.find({
      $or: [{ teacherId: userId }, { studentId: userId }],
    }).sort({ date: -1 });

    // ✅ Populate users
    const rawConnections = await Connection.find({
      $or: [{ user1: userId }, { user2: userId }],
    }).populate("user1 user2");

    // ✅ Extract the other user's name
    const connections = rawConnections.map((c) => {
      const otherUser =
        c.user1._id.toString() === userId.toString() ? c.user2 : c.user1;
      return {
        _id: c._id,
        name: otherUser.fullName, // ✅ This is what RecentActivity.jsx needs
        status: c.status,
      };
    });

    res.json({
      user,
      sessions,
      connections,
      stats: {
        completedSessions: sessions.filter((s) => s.status === "completed").length,
        activeConnections: connections.length,
        skillMastery: user.skillsToTeach?.length || 0,
      },
    });
  } catch (err) {
    console.error("❌ Dashboard Error:", err);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
};