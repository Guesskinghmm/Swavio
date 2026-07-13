import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    teacherName: { type: String, required: true },

    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    studentName: { type: String, required: true },

    skill: { type: String, required: true },

    date: { type: Date, required: true }, // ✅ Store as proper Date
    time: { type: String }, // ❌ Make optional or remove completely

    notes: { type: String },
    completed: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    feedback: { type: String, default: "" },
  },
  { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);
export default Session;
