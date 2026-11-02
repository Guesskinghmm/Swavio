import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema(
  {
    user1:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Requester
    user2:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Recipient
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
    // Canonical pair key to prevent duplicate reverse-order connections (A-B and B-A)
    pairKey: { type: String, unique: true, index: true },
  },
  { timestamps: true }
);

// Populate pairKey before validation/save to ensure deterministic uniqueness regardless of order
connectionSchema.pre("validate", function (next) {
  if (this.user1 && this.user2) {
    const id1 = this.user1.toString();
    const id2 = this.user2.toString();
    this.pairKey = id1 < id2 ? `${id1}_${id2}` : `${id2}_${id1}`;
  }
  next();
});

connectionSchema.index({ user1: 1, user2: 1 });
connectionSchema.index({ status: 1 });

export default mongoose.model("Connection", connectionSchema);
