import User from "../models/User.js";
import Session from "../models/sessionModel.js";
import Connection from "../models/Connection.js";

export const getDashboardData = async (req, res) => {
  try {
    const { userId } = req.params;

    // Ownership check
    if (req.user._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Forbidden: Cannot view another user's dashboard." });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const sessions = await Session.find({
      $or: [{ teacherId: userId }, { studentId: userId }],
    }).sort({ date: -1 });

    const rawConnections = await Connection.find({
      $or: [{ user1: userId }, { user2: userId }],
    }).populate("user1 user2", "fullName profilePicture");

    const connections = rawConnections
      .map((c) => {
        if (!c.user1 || !c.user2) return null;
        const otherUser =
          c.user1._id.toString() === userId.toString() ? c.user2 : c.user1;
        return {
          _id: c._id,
          name: otherUser.fullName || "User",
          status: c.status,
        };
      })
      .filter(Boolean);

    res.json({
      user,
      sessions,
      connections,
      stats: {
        completedSessions: sessions.filter((s) => s.status === "completed").length,
        activeConnections: connections.filter((c) => c.status === "accepted").length,
        skillMastery: user.skillsToTeach?.length || 0,
      },
    });
  } catch (err) {
    console.error("❌ Dashboard Error:", err.message);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
};
