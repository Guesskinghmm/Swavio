import QuizResult from "../models/QuizResult.js";
import User from "../models/User.js";

export const getLeaderboard = async (req, res) => {
  try {
    // ✅ Always return GLOBAL leaderboard (no friends logic)
    const leaderboard = await QuizResult.aggregate([
      {
        $group: {
          _id: "$userId", // ✅ Group by user
          totalScore: { $sum: "$score" },
          quizzesTaken: { $sum: 1 },
        },
      },
      { $sort: { totalScore: -1 } }, // Sort by score
    ]);

    // ✅ Get all userIds
    const userIds = leaderboard.map((entry) => entry._id);

    // ✅ Fetch user details in ONE query
    const users = await User.find(
      { _id: { $in: userIds } },
      { fullName: 1 }
    );

    // ✅ Map user names
    const leaderboardWithNames = leaderboard.map((entry) => {
      const user = users.find((u) => u._id.toString() === entry._id.toString());
      return {
        userId: entry._id,
        name: user?.fullName || "Unknown",
        score: entry.totalScore,
        quizzesTaken: entry.quizzesTaken,
      };
    });

    res.json(leaderboardWithNames);
  } catch (err) {
    console.error("❌ Leaderboard Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
