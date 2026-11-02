# Swavio

A premium, minimalist full-stack platform enabling peer-to-peer skill exchange, real-time messaging, video conferencing, and gamified skill assessments.

---

## Key Features

- **Minimalist Design System**: Sleek, accessible user interface built on a custom Tailwind system with modern typography (`Inter`), frosted glass navbar effects, and cohesive card container styles.
- **Master-Detail Messages**: Dual-column message layout with connections sidebar (displaying real-time unread badges) and active conversation pane with integrated Cloudinary media sharing.
- **Cloudinary File Attachments**: Full delivery HTTPS URLs stored directly with Cloudinary public IDs, MIME types, and original filenames, supporting secure image and PDF attachments.
- **Smart Link Parsing**: In-chat links to video calls (such as secure Jitsi conferences) are automatically parsed into styled "Join Video Call" action buttons instead of raw URLs.
- **Resource Ownership & Security**: Granular controller-level authorization checks ensuring users can only read, edit, or delete their own data and authorized connections/conversations.
- **Interactive Quizzes & Leaderboards**: Skill assessment tests generated via Groq (LLaMA 3.3), responsive multiple-choice cards, confetti animations on pass, and a global rank leaderboard.
- **Idempotent Background Reminders**: Automated cron reminder job targeting upcoming pending sessions within 14–15 minutes, utilizing atomic document claims to prevent duplicate notifications.
- **Health & Readiness Checks**: Dedicated `/health` endpoint returning database connectivity status, uptime, and system diagnostics for automated uptime monitoring.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, React Router v7, TailwindCSS, Framer Motion, Lucide Icons, Axios |
| **Backend** | Node.js, Express.js (ESM), Socket.IO, Multer + Cloudinary Storage |
| **Database** | MongoDB Atlas (Mongoose ODM with unique compound index validations) |
| **Integrations** | Jitsi Meet (8x8.vc RS256 JWTs), Groq SDK (`llama-3.3-70b-versatile`) |
| **Operations** | GitHub Actions CI, Express Rate Limiting, Atomic Cron Claims |

---

## Required Environment Variables

### 1. Server Environment (`server/.env`) 


| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | HTTP server port (Render injects this dynamically) | `5000` |
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/swavio?retryWrites=true&w=majority` |
| `JWT_SECRET` | Secret key for signing and verifying JSON Web Tokens | `openssl rand -hex 64` |
| `ALLOWED_ORIGINS` | Permitted CORS frontend origins (comma-separated) | `https://swavio.vercel.app,http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 Web Client ID | `your_client_id.apps.googleusercontent.com` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud identifier | `swavio-cloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | `abcdefghijklmnopqrstuvwxyz123` |
| `GROQ_API_KEY` | Groq AI Cloud API Key for quiz generation | `gsk_...` |
| `JITSI_TENANT` | Jitsi as a Service (8x8.vc) Tenant ID | `vpaas-magic-cookie-xxxxxxxxxxxxxxxx` |
| `JITSI_KID` | Jitsi Key ID from 8x8.vc console | `vpaas-magic-cookie-xxxxxxxxxxxxxxxx/xxxxxx` |
| `JITSI_PRIVATE_KEY` | RSA Private Key in PEM format (`\n` escaped) | `"-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----"` |

### 2. Client Environment (`client/.env`)

| Variable | Description | Example |
| :--- | :--- | :--- |
| `REACT_APP_API_URL` | Canonical backend base URL (no trailing slash) | `https://swavio-backend.onrender.com` |
| `REACT_APP_GOOGLE_CLIENT_ID` | Google OAuth 2.0 Web Client ID | `your_client_id.apps.googleusercontent.com` |
| `REACT_APP_JITSI_TENANT` | Jitsi as a Service Tenant ID for client rooms | `vpaas-magic-cookie-46c16990a7ac4b0795645bbc33e57d74` |
| `PORT` | Local dev port | `3000` |

---

## Architecture & Security Model

1. **Cloudinary Asset Storage**:
   - Files are uploaded directly to Cloudinary through `multer-storage-cloudinary`.
   - Message records store complete HTTPS URLs from `req.file.path`, along with `filePublicId`, `mimeType`, and `originalName`.
   - Legacy records referencing local paths (`/uploads/...`) fall back seamlessly to backend static asset serving without crashing client media previews.
   - Profile picture deletion calls `cloudinary.uploader.destroy()` using stored public IDs or legacy URL extraction.

2. **Canonical Connection Relationship**:
   - `Connection` is the single source of truth for user connections.
   - Dual-direction duplicate requests (A→B and B→A) are prevented at both the database level via a deterministic `pairKey` (`[minId, maxId].join('_')` with unique index) and route-level validation.
   - `user1` always represents the initiator/sender and `user2` represents the receiver.

3. **Resource Ownership Authorization**:
   - Every protected route enforces ownership checks at the controller level:
     - Profile updates: `req.user._id === req.params.userId` (403 otherwise).
     - Messages: caller must be `senderId` or `receiverId` in the thread (403 otherwise).
     - Connection accept: only `user2` (receiver) can accept (403 otherwise).
     - Connection delete/reject: caller must be `user1` or `user2` (403 otherwise).
     - Sessions: caller must be `teacherId` or `studentId` (403 otherwise).
     - Notifications: caller must be the notification recipient (403 otherwise).
     - Quiz submission: submitted `userId` must match `req.user._id` (403 otherwise).
     - Admin endpoints (`GET /api/contact`): protected with `adminOnly` role check.

4. **Video Room Security**:
   - `/api/video/create-room` requires a valid authenticated user JWT.
   - If a target `receiverId` is passed, the route verifies that an accepted `Connection` or scheduled/completed `Session` exists between the users.
   - Signed Jitsi meeting URLs and RSA private keys are never logged in backend output.

5. **Multi-Instance Scaling & Redis**:
   - In production, when scaling the backend horizontally across multiple containers/instances:
     1. **Socket.IO**: Configure `@socket.io/redis-adapter` with Redis URL to ensure real-time messaging and notifications route across all node clusters.
     2. **Background Reminders**: Run `scheduleSessionReminders` inside a single dedicated worker container or acquire a distributed lock (e.g., Redis Redlock) to prevent duplicate cron executions.

---

## Backward Compatibility & Migration Guidance

- **Chat Schema Migration**:
  The `Chat` model canonicalizes on `participants`. Old records that stored `users` are dynamically read using `$or: [{ participants: id }, { users: id }]` and migrated inline on read/access without requiring destructive database schema changes.
- **Match to Connection Migration**:
  If a legacy MongoDB database contains an orphaned `matches` collection, run the following MongoDB shell snippet to migrate any missing records into `connections`:
  ```javascript
  db.matches.find().forEach(function(match) {
    var pKey = match.user1.toString() < match.user2.toString()
      ? match.user1.toString() + "_" + match.user2.toString()
      : match.user2.toString() + "_" + match.user1.toString();
    db.connections.updateOne(
      { pairKey: pKey },
      { $setOnInsert: { user1: match.user1, user2: match.user2, status: "accepted", pairKey: pKey, createdAt: match.createdAt || new Date() } },
      { upsert: true }
    );
  });
  ```
- **Local Profile Images**:
  Old records where `profilePicture` begins with `/uploads/...` continue to be displayed by prefixing `REACT_APP_API_URL` via the shared `avatarUrl.js` utility. When a user updates or deletes their avatar, it transitions cleanly to Cloudinary management.

---

## Local Development & Testing

### 1. Run Tests
```bash
# Run server test suite (23 passing tests)
cd server
npm test
```

### 2. Start Backend Locally
```bash
cd server
npm start
```

### 3. Start Frontend Locally
```bash
cd client
npm start
```

---

## Deployment Steps

### Deploying Backend on Render

1. Create a new **Web Service** on [Render](https://dashboard.render.com).
2. Connect your Swavio repository and set the **Root Directory** to `server`.
3. Set **Runtime** to `Node`.
4. Set **Build Command** to:
   ```bash
   npm install
   ```
5. Set **Start Command** to:
   ```bash
   node index.js
   ```
6. Add the following **Environment Variables** in Render Dashboard:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `ALLOWED_ORIGINS` (e.g. `https://your-app.vercel.app`)
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `GROQ_API_KEY`
   - `JITSI_TENANT`
   - `JITSI_KID`
   - `JITSI_PRIVATE_KEY` (Paste the RSA private key PEM with literal `\n`)
7. Click **Deploy Web Service**. Verify health by visiting `https://your-service.onrender.com/health`.

### Deploying Frontend on Vercel

1. Create a new project on [Vercel](https://vercel.com).
2. Import the Swavio repository and select the **Root Directory** as `client`.
3. Set the Framework Preset to **Create React App**.
4. Configure **Environment Variables**:
   - `REACT_APP_API_URL`: Your Render backend URL (e.g. `https://your-backend.onrender.com`)
   - `REACT_APP_JITSI_TENANT`: Your Jitsi tenant ID
5. Deploy.
