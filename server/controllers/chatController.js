const Chat = require("../models/Chat");
const User = require("../models/User");

exports.accessChat = async (req, res) => {
  const { userId, partnerId } = req.body;

  if (!userId || !partnerId) {
    return res.status(400).json({ message: "UserId and PartnerId required" });
  }

  try {
    let chat = await Chat.findOne({
      users: { $all: [userId, partnerId] },
    }).populate("users", "fullName email profilePicture");

    if (!chat) {
      chat = await Chat.create({ users: [userId, partnerId] });
    }

    res.status(200).json(chat);
  } catch (err) {
    res.status(500).json({ message: "Failed to access or create chat", error: err.message });
  }
};

exports.getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({ users: req.params.userId })
      .populate("users", "fullName email profilePicture")
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (err) {
    res.status(500).json({ message: "Failed to get chats", error: err.message });
  }
};
