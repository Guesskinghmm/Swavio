import { google } from "googleapis";
import { getOAuthClient } from "../config/googleAuth.js";

export const getAuthUrl = (req, res) => {
  const oAuth2Client = getOAuthClient();
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar"],
  });
  res.json({ url });
};

export const googleCallback = async (req, res) => {
  const oAuth2Client = getOAuthClient();
  const { code } = req.query;

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    res.json(tokens); // Send tokens to frontend
  } catch (err) {
    res.status(500).json({ message: "Google Auth Failed", err });
  }
};

export const addEventToCalendar = async (req, res) => {
  try {
    const { title, date, time, tokens } = req.body;

    const oAuth2Client = getOAuthClient();
    oAuth2Client.setCredentials(tokens);

    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

    const event = {
      summary: title,
      start: { dateTime: `${date}T${time}:00Z`, timeZone: "Asia/Kolkata" },
      end: { dateTime: `${date}T${time}:00Z`, timeZone: "Asia/Kolkata" },
    };

    const result = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
    });

    res.json({ message: "Event Added", link: result.data.htmlLink });
  } catch (err) {
    res.status(500).json({ message: "Failed to add event", err });
  }
};
