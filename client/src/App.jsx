import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Home         from "./pages/Home";
import Login        from "./pages/Login";
import Register     from "./pages/Register";
import Dashboard    from "./pages/Dashboard";
import Matchmaking  from "./pages/Matchmaking";
import Connections  from "./pages/Connections";
import Chat         from "./pages/Chat";
import Sessions     from "./pages/Sessions";
import VideoCall    from "./pages/VideoCall";
import Profile      from "./pages/Profile";
import LearnMore    from "./pages/LearnMore";
import About        from "./pages/About";
import Navbar       from "./components/Navbar";
import Footer       from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import QuizList       from "./pages/quizzes/QuizList";
import QuizAttempt    from "./pages/quizzes/QuizAttempt";
import QuizResult     from "./pages/quizzes/QuizResult";
import Leaderboard    from "./pages/quizzes/Leaderboard";
import UserQuizHistory from "./pages/quizzes/UserQuizHistory";
import OtherProfile from "./pages/OtherProfile";
import UsersList    from "./pages/UsersList";
import Contact      from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms        from "./pages/Terms";
import NotificationsPage from "./pages/NotificationsPage";

import { socket } from "./socket";

// Routes where the global Footer should not render
const NO_FOOTER_ROUTES = ["/chat"];

export default function App() {
  const location = useLocation();
  const showFooter = !NO_FOOTER_ROUTES.includes(location.pathname);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?._id) {
      // Single authoritative socket join — not duplicated in Navbar/NotificationBell
      socket.emit("join", storedUser._id);
      localStorage.setItem("userId", storedUser._id);

      socket.on("connect", () => {
        // Re-join on reconnect so the server re-registers the socket ID
        socket.emit("join", storedUser._id);
      });
    }
    return () => {
      socket.off("connect");
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/"           element={<Home />} />
          <Route path="/login"      element={<Login />} />
          <Route path="/register"   element={<Register />} />
          <Route path="/dashboard"  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/matchmaking" element={<ProtectedRoute><Matchmaking /></ProtectedRoute>} />
          <Route path="/chat"       element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/videocall"  element={<ProtectedRoute><VideoCall /></ProtectedRoute>} />
          <Route path="/profile"    element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/learnmore"  element={<LearnMore />} />
          <Route path="/about"      element={<About />} />
          <Route path="/connections" element={<Connections />} />
          <Route path="/sessions"   element={<Sessions />} />
          <Route path="/quizzes"                    element={<QuizList />} />
          <Route path="/quizzes/attempt/:skill"     element={<QuizAttempt />} />
          <Route path="/quizzes/result"             element={<QuizResult />} />
          <Route path="/quizzes/leaderboard"        element={<Leaderboard />} />
          <Route path="/quiz-history/:userId"       element={<UserQuizHistory />} />
          <Route path="/profile/:userId"            element={<OtherProfile />} />
          <Route path="/users"       element={<UsersList />} />
          <Route path="/contact"     element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms"       element={<Terms />} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        </Routes>
      </div>
      {showFooter && <Footer />}
    </div>
  );
}
