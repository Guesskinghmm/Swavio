import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Matchmaking from "./pages/Matchmaking";
import Connections from "./pages/Connections";
import Chat from "./pages/Chat";
import Sessions from "./pages/Sessions";
import VideoCall from "./pages/VideoCall";
import Profile from "./pages/Profile";
import LearnMore from "./pages/LearnMore";
import About from "./pages/About";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import QuizList from "./pages/quizzes/QuizList";
import QuizAttempt from "./pages/quizzes/QuizAttempt";
import QuizResult from "./pages/quizzes/QuizResult";
import Leaderboard from "./pages/quizzes/Leaderboard";
import UserQuizHistory from "./pages/quizzes/UserQuizHistory";
import OtherProfile from "./pages/OtherProfile";
import UsersList from "./pages/UsersList";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";

import { socket } from "./socket";

export default function App() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?._id) {
      setUserId(storedUser._id);
      localStorage.setItem("userId", storedUser._id);
      console.log("✅ App joining socket as:", storedUser._id);
      socket.emit("join", storedUser._id);

      socket.on("connect", () => {
        console.log("🔗 Socket connected:", socket.id);
      });
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar socket={socket} />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/matchmaking" element={<ProtectedRoute><Matchmaking /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/videocall" element={<ProtectedRoute><VideoCall /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/learnmore" element={<LearnMore />} />
          <Route path="/about" element={<About />} />
          <Route path="/connections" element={<Connections />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/quizzes" element={<QuizList />} />
          <Route path="/quizzes/attempt/:skill" element={<QuizAttempt />} />
          <Route path="/quizzes/result" element={<QuizResult />} />
          <Route path="/quizzes/leaderboard" element={<Leaderboard />} />
          <Route path="/quiz-history/:userId" element={<UserQuizHistory />} />
          <Route path="/profile/:userId" element={<OtherProfile />} />
          <Route path="/users" element={<UsersList />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
