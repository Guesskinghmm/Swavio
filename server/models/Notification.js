import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Receiver
    type: { type: String, required: true }, // "request", "message", "schedule", "quiz"
    message: { type: String, required: true },
    link: { type: String }, // optional, to redirect (e.g. /connections or /chat)
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
