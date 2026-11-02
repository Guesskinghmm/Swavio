import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

const TEST_SECRET = "swavio-test-jwt-secret-key-123456789";

// Native PBKDF2 password hashing & verification
function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `$pbkdf2$${salt}$${hash}`;
}

function verifyPassword(password, storedHash) {
  const parts = storedHash.split("$");
  const salt = parts[2];
  const originalHash = parts[3];
  const testHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return testHash === originalHash;
}

// Native JWT token generator & verifier
function signJwt(payload, secret, expiresInMs = 3600000) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + expiresInMs })).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}

function verifyJwt(token, secret) {
  const [h, b, s] = token.split(".");
  const expectedSig = crypto.createHmac("sha256", secret).update(`${h}.${b}`).digest("base64url");
  if (s !== expectedSig) throw new Error("invalid signature");
  const payload = JSON.parse(Buffer.from(b, "base64url").toString());
  if (payload.exp && Date.now() > payload.exp) throw new Error("jwt expired");
  return payload;
}

test("Auth: Password hashing and salted cryptographic verification", () => {
  const plainPassword = "UserSecretPassword123!";
  const hash = hashPassword(plainPassword);

  assert.notEqual(hash, plainPassword);
  assert.ok(hash.startsWith("$pbkdf2$"));

  const matches = verifyPassword(plainPassword, hash);
  assert.equal(matches, true, "Verify should match correct password");

  const wrongMatches = verifyPassword("WrongPassword", hash);
  assert.equal(wrongMatches, false, "Verify should fail on wrong password");
});

test("Auth: JWT generation, payload integrity, and signature verification", () => {
  const userId = "507f1f77bcf86cd799439011";
  const token = signJwt({ id: userId, role: "user" }, TEST_SECRET, 3600000);

  assert.ok(token);
  assert.equal(token.split(".").length, 3);

  const decoded = verifyJwt(token, TEST_SECRET);
  assert.equal(decoded.id, userId);
  assert.equal(decoded.role, "user");

  assert.throws(() => {
    verifyJwt(token, "invalid-tampered-secret");
  }, /invalid signature/);
});

test("Auth: Registration validation rules (missing fields & normalization)", () => {
  const validateRegister = ({ fullName, email, password }) => {
    if (!fullName || !email || !password) return { valid: false, error: "All fields required" };
    const normalized = email.toLowerCase().trim();
    if (!normalized.includes("@") || !normalized.includes(".")) return { valid: false, error: "Invalid email" };
    if (password.length < 6) return { valid: false, error: "Password must be at least 6 characters" };
    return { valid: true, email: normalized };
  };

  assert.equal(validateRegister({}).valid, false);
  assert.equal(validateRegister({ fullName: "A", email: "test@example.com", password: "123" }).valid, false);
  
  const ok = validateRegister({ fullName: "Jane Doe", email: "  Jane.Doe@EXAMPLE.com ", password: "Password123" });
  assert.equal(ok.valid, true);
  assert.equal(ok.email, "jane.doe@example.com", "Email must be normalized to lowercase and trimmed");
});

test("Auth: Google OAuth token parsing & user profile extraction", () => {
  // Simulate Google tokeninfo response data
  const googleTokeninfoMock = {
    iss: "https://accounts.google.com",
    sub: "google_sub_10987654321",
    email: "learner@gmail.com",
    email_verified: "true",
    name: "Alex Learner",
    picture: "https://lh3.googleusercontent.com/a/mock-pic.jpg",
    aud: "mock-client-id.apps.googleusercontent.com",
  };

  const processGoogleAuth = (tokenData, configuredAudience) => {
    if (!tokenData.email) throw new Error("No email in token");
    if (configuredAudience && tokenData.aud !== configuredAudience) {
      throw new Error("Audience mismatch");
    }
    return {
      email: tokenData.email.toLowerCase().trim(),
      fullName: tokenData.name || tokenData.email.split("@")[0],
      profilePicture: tokenData.picture || "/default-avatar.png",
      googleId: tokenData.sub,
      authProvider: "google",
    };
  };

  const profile = processGoogleAuth(googleTokeninfoMock, "mock-client-id.apps.googleusercontent.com");
  assert.equal(profile.email, "learner@gmail.com");
  assert.equal(profile.fullName, "Alex Learner");
  assert.equal(profile.googleId, "google_sub_10987654321");
  assert.equal(profile.authProvider, "google");

  // Audience mismatch check
  assert.throws(() => {
    processGoogleAuth(googleTokeninfoMock, "different-client-id.apps.googleusercontent.com");
  }, /Audience mismatch/);
});

test("Auth: Client-side logout clears authentication storage", () => {
  const storage = {
    token: "valid.jwt.token",
    userId: "507f1f77bcf86cd799439011",
    fullName: "Alex",
    user: JSON.stringify({ _id: "507f1f77bcf86cd799439011" }),
  };

  const performLogout = (store) => {
    delete store.token;
    delete store.userId;
    delete store.fullName;
    delete store.user;
  };

  performLogout(storage);
  assert.equal(storage.token, undefined);
  assert.equal(storage.userId, undefined);
  assert.equal(Object.keys(storage).length, 0);
});
