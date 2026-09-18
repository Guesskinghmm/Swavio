import Chat from "../models/Chat.js";
import User from "../models/User.js";

export const accessChat = async (req, res) => {
  const { userId, partnerId } = req.body;

  if (!userId || !partnerId) {
    return res.status(400).json({ message: "UserId and PartnerId required" });
  }

  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, partnerId] },
    }).populate("participants", "fullName email profilePicture");

    if (!chat) {
      chat = await Chat.create({ participants: [userId, partnerId] });
    }

    res.status(200).json(chat);
  } catch (err) {
    res.status(500).json({ message: "Failed to access or create chat", error: err.message });
  }
};

export const getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.params.userId })
      .populate("participants", "fullName email profilePicture")
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (err) {
    res.status(500).json({ message: "Failed to get chats", error: err.message });
  }
};
