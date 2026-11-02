import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Legacy support for older records that stored `users`
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);

// Pre-save hook: ensure participants is always populated if users was passed
chatSchema.pre("save", function (next) {
  if ((!this.participants || this.participants.length === 0) && this.users && this.users.length > 0) {
    this.participants = this.users;
  }
  next();
});

chatSchema.index({ participants: 1 });
chatSchema.index({ users: 1 });

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
