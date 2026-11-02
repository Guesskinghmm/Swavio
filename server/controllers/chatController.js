import Chat from "../models/Chat.js";

// Access or create chat between two participants
export const accessChat = async (req, res) => {
  const { userId, partnerId } = req.body;

  if (!userId || !partnerId) {
    return res.status(400).json({ message: "UserId and PartnerId required" });
  }

  const callerId = req.user._id.toString();
  // Ownership authorization: caller must be one of the chat participants
  if (callerId !== userId.toString() && callerId !== partnerId.toString()) {
    return res.status(403).json({ message: "Forbidden: Not a participant in this chat." });
  }

  try {
    // Query canonical participants with fallback to legacy users
    let chat = await Chat.findOne({
      $or: [
        { participants: { $all: [userId, partnerId] } },
        { users: { $all: [userId, partnerId] } },
      ],
    }).populate("participants", "fullName email profilePicture");

    if (!chat) {
      chat = await Chat.create({
        participants: [userId, partnerId],
      });
      chat = await Chat.findById(chat._id).populate("participants", "fullName email profilePicture");
    } else if ((!chat.participants || chat.participants.length === 0) && chat.users) {
      // Inline migration of legacy record
      chat.participants = chat.users;
      await chat.save();
      await chat.populate("participants", "fullName email profilePicture");
    }

    res.status(200).json(chat);
  } catch (err) {
    console.error("accessChat error:", err.message);
    res.status(500).json({ message: "Failed to access or create chat", error: err.message });
  }
};

// Get all chats for a user — owner only
export const getUserChats = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Forbidden: Cannot view another user's chat list." });
    }

    const chats = await Chat.find({
      $or: [
        { participants: userId },
        { users: userId },
      ],
    })
      .populate("participants", "fullName email profilePicture")
      .populate("users", "fullName email profilePicture")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    // Normalize so callers always receive canonical participants
    const normalizedChats = chats.map((c) => {
      const obj = c.toObject();
      if ((!obj.participants || obj.participants.length === 0) && obj.users) {
        obj.participants = obj.users;
      }
      return obj;
    });

    res.status(200).json(normalizedChats);
  } catch (err) {
    console.error("getUserChats error:", err.message);
    res.status(500).json({ message: "Failed to get chats", error: err.message });
  }
};
