import User from '../models/User.js';
import Match from '../models/Match.js';

// 🔍 Find matching users based on intent (learn/teach) and skill
export const findMatches = async (req, res) => {
  const { userId } = req.params;
  const { intent, skill, availability } = req.query;

  try {
    const currentUser = await User.findById(userId);
    if (!currentUser) return res.status(404).json({ message: 'User not found' });

    const query = { _id: { $ne: userId } }; // Exclude current user

    // ✅ Match logic
    if (intent === "learn") {
      // I want to learn → find tutors
      if (skill) {
        query.skillsToTeach = { $regex: new RegExp(`^${skill}$`, "i") };
      } else if (currentUser.skillsToLearn?.length > 0) {
        query.skillsToTeach = { $in: currentUser.skillsToLearn };
      }
    } 
    else if (intent === "teach") {
      // I want to teach → find learners
      if (skill) {
        query.skillsToLearn = { $regex: new RegExp(`^${skill}$`, "i") };
      } else if (currentUser.skillsToTeach?.length > 0) {
        query.skillsToLearn = { $in: currentUser.skillsToTeach };
      }
    }

    // ✅ Optional: Filter by availability
    if (availability) {
      query["availability.day"] = { $regex: availability, $options: "i" };
    }

    const matches = await User.find(query).select('-password');
    res.json(matches);
  } catch (err) {
    console.error('Matchmaking error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🟢 Save a match request
export const createMatchRequest = async (req, res) => {
  try {
    const { user1, user2 } = req.body;

    const exists = await Match.findOne({
      $or: [
        { user1, user2 },
        { user1: user2, user2: user1 }
      ]
    });

    if (exists) return res.status(400).json({ message: 'Match already exists' });

    const match = await Match.create({ user1, user2 });
    res.status(201).json(match);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create match' });
  }
};

// ❌ Delete a match
export const deleteMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    await Match.findByIdAndDelete(matchId);
    res.status(200).json({ message: 'Match deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete match' });
  }
};

// 📃 Get all matches for a user
export const getMyMatches = async (req, res) => {
  try {
    const { userId } = req.params;

    const matches = await Match.find({
      $or: [{ user1: userId }, { user2: userId }]
    }).populate('user1 user2', '-password');

    const myMatches = matches.map(m =>
      m.user1._id.toString() === userId ? m.user2 : m.user1
    );

    res.json(myMatches);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch matches' });
  }
};
