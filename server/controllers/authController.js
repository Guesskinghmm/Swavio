import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import User from '../models/User.js';

export const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password)
      return res.status(400).json({ msg: 'All fields required' });

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(400).json({ msg: 'User already exists' });

    const hashed = await bcrypt.hash(password, 12);
    const user = new User({
      fullName,
      email: normalizedEmail,
      password: hashed,
      authProvider: 'local',
    });
    await user.save();

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing!");
      return res.status(500).json({ msg: "Server config error" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({ token, user: userObj });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ msg: 'Email already exists' });
    }
    console.error("Registration error:", error.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ msg: 'Email/password required' });

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    if (!user.password && user.authProvider === 'google') {
      return res.status(400).json({
        msg: 'This account was created with Google Sign-In. Please sign in with Google.',
      });
    }

    const match = await bcrypt.compare(password, user.password || '');
    if (!match) return res.status(401).json({ msg: 'Invalid credentials' });

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing!");
      return res.status(500).json({ msg: "Server config error" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    const userObj = user.toObject();
    delete userObj.password;

    res.json({ token, user: userObj });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// ── Google OAuth Sign-In / Registration ──────────────────────────────────────
export const googleAuth = async (req, res) => {
  try {
    const { credential, accessToken } = req.body;

    if (!credential && !accessToken) {
      return res.status(400).json({ msg: "Google credential or access token required" });
    }

    let email, name, picture, sub;

    if (credential) {
      // Verify Google ID token with Google's public tokeninfo endpoint
      const response = await axios.get(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
      );
      const data = response.data;
      if (!data || !data.email) {
        return res.status(401).json({ msg: "Invalid Google credential" });
      }

      if (process.env.GOOGLE_CLIENT_ID && data.aud && data.aud !== process.env.GOOGLE_CLIENT_ID) {
        return res.status(401).json({ msg: "Google token audience mismatch" });
      }

      email = data.email.toLowerCase().trim();
      name = data.name || data.given_name || email.split("@")[0];
      picture = data.picture;
      sub = data.sub;
    } else if (accessToken) {
      const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = response.data;
      if (!data || !data.email) {
        return res.status(401).json({ msg: "Invalid Google access token" });
      }

      email = data.email.toLowerCase().trim();
      name = data.name || data.given_name || email.split("@")[0];
      picture = data.picture;
      sub = data.sub;
    }

    if (!email) {
      return res.status(400).json({ msg: "Google account did not provide an email" });
    }

    // Find or create user
    let user = await User.findOne({ email });

    if (user) {
      let shouldSave = false;
      if (!user.googleId) {
        user.googleId = sub;
        shouldSave = true;
      }
      if ((!user.profilePicture || user.profilePicture === "/default-avatar.png") && picture) {
        user.profilePicture = picture;
        shouldSave = true;
      }
      if (shouldSave) {
        await user.save();
      }
    } else {
      user = new User({
        fullName: name,
        email,
        profilePicture: picture || "/default-avatar.png",
        googleId: sub,
        authProvider: "google",
      });
      await user.save();
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing!");
      return res.status(500).json({ msg: "Server config error" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const userObj = user.toObject();
    delete userObj.password;

    res.json({ token, user: userObj });
  } catch (error) {
    console.error("Google Auth error:", error.response?.data || error.message);
    res.status(401).json({ msg: "Google authentication failed", error: error.message });
  }
};

// ── Public Google Client ID Endpoint ──────────────────────────────────────────
export const getGoogleClientId = (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.REACT_APP_GOOGLE_CLIENT_ID || "";
  res.json({ clientId });
};
