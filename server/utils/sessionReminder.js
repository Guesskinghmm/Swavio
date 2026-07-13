import cron from "node-cron";
import Session from "../models/sessionModel.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

export const scheduleSessionReminders = (io) => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const next15Min = new Date(now.getTime() + 15 * 60 * 1000);

      // Find sessions happening in the next 15 mins
      const sessions = await Session.find({
        date: { $gte: now, $lte: next15Min },
        completed: false,
      });

      for (const session of sessions) {
        const timeDiff = new Date(session.date).getTime() - now.getTime();

        // Only send if time is between 14-15 mins to avoid duplicates
        if (timeDiff <= 15 * 60 * 1000 && timeDiff > 14 * 60 * 1000) {
          const msg = `⏰ Reminder: Your session on "${session.skill}" starts at ${new Date(session.date).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })}`;

          // Create notifications
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

          io.to(session.teacherId.toString()).emit("notification", teacherNotif);
          io.to(session.studentId.toString()).emit("notification", studentNotif);
        }
      }
    } catch (err) {
      console.error("❌ Error in session reminder:", err);
    }
  });
};
