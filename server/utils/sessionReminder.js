import cron from "node-cron";
import Session from "../models/sessionModel.js";
import Notification from "../models/Notification.js";

/**
 * scheduleSessionReminders
 * Runs once every minute to send reminders for upcoming sessions starting in 14-15 minutes.
 *
 * Idempotency & Multi-Instance Handling:
 * 1. Checks `status: "pending"` (aligned with Session schema).
 * 2. Checks `reminderSent: { $ne: true }`.
 * 3. Atomically updates `reminderSent: true` using `Session.findOneAndUpdate` with a condition
 *    `reminderSent: { $ne: true }` before dispatching notifications. If another instance claimed
 *    it first, `claimed` returns null and processing skips.
 *
 * Note for horizontal scaling:
 * When scaling to multiple backend instances, run the reminder job as a dedicated background worker
 * or acquire a distributed lock (e.g., Redis Redlock) before scheduling.
 */
export const scheduleSessionReminders = (io) => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const minWindow = new Date(now.getTime() + 14 * 60 * 1000);
      const maxWindow = new Date(now.getTime() + 15 * 60 * 1000);

      // Find pending sessions scheduled in the 14-15 minute window where reminder hasn't fired
      const sessions = await Session.find({
        status: "pending",
        reminderSent: { $ne: true },
        date: { $gte: minWindow, $lte: maxWindow },
      });

      for (const session of sessions) {
        // Atomic claim: only one server instance can claim this session
        const claimed = await Session.findOneAndUpdate(
          { _id: session._id, reminderSent: { $ne: true } },
          { $set: { reminderSent: true } },
          { new: false }
        );

        if (!claimed) continue; // Another instance already processed this reminder

        const timeStr = new Date(session.date).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        });

        const msg = `⏰ Reminder: Your session on "${session.skill}" starts at ${timeStr}`;

        const teacherNotif = await Notification.create({
          user: session.teacherId,
          type: "reminder",
          message: msg,
          link: "/sessions",
        });

        const studentNotif = await Notification.create({
          user: session.studentId,
          type: "reminder",
          message: msg,
          link: "/sessions",
        });

        if (io) {
          io.to(session.teacherId.toString()).emit("notification", teacherNotif);
          io.to(session.studentId.toString()).emit("notification", studentNotif);
        }
      }
    } catch (err) {
      console.error("❌ Error in session reminder job:", err.message);
    }
  });
};
