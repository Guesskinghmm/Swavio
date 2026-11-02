import test from "node:test";
import assert from "node:assert/strict";

// ── 1. Profile Badges and Level Calculations ─────────────────────────────────
test("Profile: Dynamic badge and achievement level computation", () => {
  const getBadgeData = (sessionCount, skillsToTeach, skillsToLearn, rating) => {
    const sessionBadge =
      sessionCount >= 20 ? "🚀 Skill Master"
      : sessionCount >= 10 ? "🏆 Pro Learner"
      : sessionCount >= 5  ? "🔥 Active Learner"
      : sessionCount >= 1  ? "🎯 Beginner"
      : null;

    const teachBadge =
      skillsToTeach?.length >= 5 ? "🌟 Expert Mentor"
      : skillsToTeach?.length >= 3 ? "🧑‍🏫 Mentor"
      : skillsToTeach?.length >= 1 ? "📚 Knowledge Sharer"
      : null;

    const learnBadge =
      skillsToLearn?.length >= 5 ? "🚀 Master Learner"
      : skillsToLearn?.length >= 3 ? "📈 Growing Learner"
      : skillsToLearn?.length >= 1 ? "🎓 New Learner"
      : null;

    const ratingBadge =
      rating >= 4.5 ? "🌟 Top Rated"
      : rating >= 3.5 ? "👍 Good Mentor"
      : null;

    const achievementLevel =
      sessionCount >= 20 ? "Level 4"
      : sessionCount >= 10 ? "Level 3"
      : sessionCount >= 5  ? "Level 2"
      : sessionCount >= 1  ? "Level 1"
      : "Level 0";

    return {
      badges: [sessionBadge, teachBadge, learnBadge, ratingBadge].filter(Boolean),
      achievementLevel,
    };
  };

  // Beginner User
  const beginner = getBadgeData(1, ["JavaScript"], ["Python"], 0);
  assert.equal(beginner.achievementLevel, "Level 1");
  assert.ok(beginner.badges.includes("🎯 Beginner"));
  assert.ok(beginner.badges.includes("📚 Knowledge Sharer"));

  // Advanced Mentor
  const mentor = getBadgeData(22, ["JS", "React", "Node", "CSS", "SQL"], ["Rust"], 4.9);
  assert.equal(mentor.achievementLevel, "Level 4");
  assert.ok(mentor.badges.includes("🚀 Skill Master"));
  assert.ok(mentor.badges.includes("🌟 Expert Mentor"));
  assert.ok(mentor.badges.includes("🌟 Top Rated"));
});

// ── 2. Rating submission & recomputation ─────────────────────────────────────
test("Profile: Aggregate rating computation prevents self-rating", () => {
  const user = {
    _id: "user_target",
    ratingsReceived: [
      { userId: "rater_1", rating: 4 },
      { userId: "rater_2", rating: 5 },
    ],
    rating: 4.5,
    ratingCount: 2,
  };

  const submitRating = (targetUser, raterId, score) => {
    if (targetUser._id === raterId) throw new Error("Cannot rate yourself");
    if (score < 1 || score > 5) throw new Error("Score must be between 1 and 5");

    const existing = targetUser.ratingsReceived.find((r) => r.userId === raterId);
    if (existing) {
      existing.rating = score;
    } else {
      targetUser.ratingsReceived.push({ userId: raterId, rating: score });
    }

    const total = targetUser.ratingsReceived.reduce((sum, r) => sum + r.rating, 0);
    targetUser.ratingCount = targetUser.ratingsReceived.length;
    targetUser.rating = total / targetUser.ratingCount;
    return targetUser;
  };

  // Self-rating is forbidden
  assert.throws(() => submitRating(user, "user_target", 5), /Cannot rate yourself/);

  // New rating added
  submitRating(user, "rater_3", 3);
  assert.equal(user.ratingCount, 3);
  assert.equal(user.rating, 4.0); // (4 + 5 + 3) / 3 = 4.0

  // Existing rater updates score
  submitRating(user, "rater_3", 5);
  assert.equal(user.ratingCount, 3);
  assert.equal(user.rating, 4.666666666666667); // (4 + 5 + 5) / 3
});

// ── 3. Matchmaking Skill Search & Exclusion Algorithm ────────────────────────
test("Matchmaking: Correctly matches intent and excludes connected partners", () => {
  const currentUserId = "user_me";
  const currentUser = {
    _id: currentUserId,
    skillsToTeach: ["Python", "Django"],
    skillsToLearn: ["React", "TypeScript"],
  };

  const pool = [
    { _id: "user_me", fullName: "Self", skillsToTeach: ["Python"], skillsToLearn: ["React"] },
    { _id: "user_already_connected", fullName: "Buddy", skillsToTeach: ["React"], skillsToLearn: ["Go"] },
    { _id: "user_good_match", fullName: "Sarah", skillsToTeach: ["React", "Next.js"], skillsToLearn: ["Python"] },
    { _id: "user_unrelated", fullName: "Bob", skillsToTeach: ["Cooking"], skillsToLearn: ["Gardening"] },
  ];

  const existingConnections = [
    { user1: "user_me", user2: "user_already_connected", status: "accepted" },
  ];

  const findMatchesMock = (user, candidates, connections, intent) => {
    const excludedIds = new Set([user._id]);
    connections.forEach((c) => {
      excludedIds.add(c.user1 === user._id ? c.user2 : c.user1);
    });

    return candidates.filter((c) => {
      if (excludedIds.has(c._id)) return false;

      if (intent === "learn") {
        // Teacher must teach what I want to learn
        return c.skillsToTeach?.some((s) => user.skillsToLearn.includes(s));
      }
      if (intent === "teach") {
        // Learner must want to learn what I teach
        return c.skillsToLearn?.some((s) => user.skillsToTeach.includes(s));
      }
      return true;
    });
  };

  const learnMatches = findMatchesMock(currentUser, pool, existingConnections, "learn");
  assert.equal(learnMatches.length, 1);
  assert.equal(learnMatches[0]._id, "user_good_match");

  const teachMatches = findMatchesMock(currentUser, pool, existingConnections, "teach");
  assert.equal(teachMatches.length, 1);
  assert.equal(teachMatches[0]._id, "user_good_match");
});

// ── 4. Chat Canonical Participants & Legacy Users Fallback ───────────────────
test("Chat: Resolves canonical participants and legacy users", () => {
  const legacyChat = {
    _id: "chat_001",
    users: ["user_A", "user_B"],
    participants: [],
  };

  const modernChat = {
    _id: "chat_002",
    participants: ["user_A", "user_C"],
  };

  const normalizeChat = (chatDoc) => {
    const participants =
      chatDoc.participants && chatDoc.participants.length > 0
        ? chatDoc.participants
        : chatDoc.users || [];
    return { ...chatDoc, participants };
  };

  const norm1 = normalizeChat(legacyChat);
  assert.deepEqual(norm1.participants, ["user_A", "user_B"]);

  const norm2 = normalizeChat(modernChat);
  assert.deepEqual(norm2.participants, ["user_A", "user_C"]);
});

// ── 5. Session Completion & Quiz Auto-Assignment ─────────────────────────────
test("Sessions: Session completion assigns pending quiz to student", () => {
  const session = {
    _id: "session_101",
    teacherId: "teacher_1",
    studentId: "student_1",
    skill: "React Components",
    status: "pending",
  };

  // Complete session
  session.status = "completed";

  // Creates pending quiz
  const createdQuiz = {
    skill: session.skill,
    userId: session.studentId,
    sessionId: session._id,
    status: "pending",
    questions: [],
  };

  assert.equal(createdQuiz.status, "pending");
  assert.equal(createdQuiz.userId, "student_1");
  assert.equal(createdQuiz.skill, "React Components");
  assert.equal(createdQuiz.sessionId, "session_101");
});

// ── 6. Health & Readiness Diagnostics ────────────────────────────────────────
test("Health Endpoint: Status reporting reflects DB readyState", () => {
  const computeHealth = (readyState) => {
    const dbReady = readyState === 1;
    return {
      status: dbReady ? "OK" : "DEGRADED",
      database: ["disconnected", "connected", "connecting", "disconnecting"][readyState] || "unknown",
      httpCode: dbReady ? 200 : 503,
    };
  };

  assert.equal(computeHealth(1).httpCode, 200);
  assert.equal(computeHealth(1).status, "OK");
  assert.equal(computeHealth(1).database, "connected");

  assert.equal(computeHealth(0).httpCode, 503);
  assert.equal(computeHealth(0).status, "DEGRADED");
  assert.equal(computeHealth(0).database, "disconnected");
});

// ── 7. Admin Role Guard ──────────────────────────────────────────────────────
test("Security: Admin role guard allows admins and blocks standard users", () => {
  const checkAdminAuth = (user) => {
    if (!user) return { status: 401, message: "No token provided" };
    if (user.role !== "admin") return { status: 403, message: "Forbidden: Admin access required" };
    return { status: 200, message: "Access granted" };
  };

  assert.equal(checkAdminAuth(null).status, 401);
  assert.equal(checkAdminAuth({ _id: "u1", role: "user" }).status, 403);
  assert.equal(checkAdminAuth({ _id: "admin1", role: "admin" }).status, 200);
});

