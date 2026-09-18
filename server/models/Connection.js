import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema(
  {
    user1: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    user2: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" }
  },
  { timestamps: true }
);

connectionSchema.index({ user1: 1, user2: 1 });
connectionSchema.index({ status: 1 });

export default mongoose.model("Connection", connectionSchema);
