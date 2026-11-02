import test from "node:test";
import assert from "node:assert/strict";

test("Connections: Deterministic pairKey prevents reverse duplicates", () => {
  const userA = "507f1f77bcf86cd799439011";
  const userB = "507f1f77bcf86cd799439022";

  const getPairKey = (u1, u2) => (u1 < u2 ? `${u1}_${u2}` : `${u2}_${u1}`);

  const key1 = getPairKey(userA, userB);
  const key2 = getPairKey(userB, userA);

  assert.equal(key1, key2, "Pair key must be identical regardless of who initiated");
  assert.equal(key1, `${userA}_${userB}`);
});

test("Reminders: Idempotency check prevents duplicate reminder dispatch", () => {
  // Simulate session document state
  const session = {
    _id: "session_001",
    status: "pending",
    reminderSent: false,
  };

  // Instance 1 claims the session
  const claimReminder = (doc) => {
    if (doc.status !== "pending" || doc.reminderSent) {
      return null; // Already sent or not pending
    }
    doc.reminderSent = true;
    return doc;
  };

  const claimedFirst = claimReminder(session);
  assert.ok(claimedFirst, "First server instance successfully claims reminder");
  assert.equal(session.reminderSent, true);

  // Instance 2 attempts to claim the same session
  const claimedSecond = claimReminder(session);
  assert.equal(claimedSecond, null, "Second server instance gets rejected (idempotent)");
});

test("Reminders: Status query filtering", () => {
  const sessions = [
    { id: 1, status: "pending", reminderSent: false },
    { id: 2, status: "completed", reminderSent: false },
    { id: 3, status: "cancelled", reminderSent: false },
    { id: 4, status: "pending", reminderSent: true },
  ];

  const eligible = sessions.filter(
    (s) => s.status === "pending" && !s.reminderSent
  );

  assert.equal(eligible.length, 1);
  assert.equal(eligible[0].id, 1);
});

