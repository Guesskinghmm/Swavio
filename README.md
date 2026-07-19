# Swavio

A premium, minimalist full-stack platform enabling peer-to-peer skill exchange, real-time messaging, video conferencing, and gamified skill assessments.

---

## Key Features

- **Minimalist Design System**: Sleek, professional, and accessible user interface built on a custom Tailwind system utilizing modern typography (`Inter`), frosted glass navbar effects, and cohesive card container styles.
- **Master-Detail Messages**: Dual-column message layouts with a connections sidebar (displaying real-time unread badges) and an active conversation pane with integrated media sharing.
- **Smart Link Parsing**: In-chat links to video calls (such as secure Jitsi conferences) are automatically parsed into styled "Join Video Call" action buttons instead of raw URLs.
- **Interactive Quizzes & Leaderboards**: Skill assessment tests with responsive quiz answer select forms, animated confetti pass badges, and a rank-styled leaderboard table.
- **Dynamic Browser Status**: Active tab title syncs dynamically with the number of unread notifications, automatically updating browser tabs.
- **Secure Architecture**: User authentication managed via JWT, with dedicated endpoints for marking messages/notifications as read in the database.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React, React Router Dom, TailwindCSS, Framer Motion, Lucide Icons |
| **Backend** | Node.js, Express.js, Socket.io, Multer |
| **Database** | MongoDB (Mongoose Schema mapping) |
| **Integrations** | Jitsi Meet WebRTC, Canvas Confetti |

---

## Local Setup

Follow these steps to run the client and server environments locally:

### 1. Prerequisites
- Node.js (v18+ recommended)
- MongoDB Atlas account or local MongoDB instance

### 2. Backend Configuration
Navigate to the server directory, install dependencies, and configure environment variables.
```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JITSI_TENANT=your_jitsi_tenant_id
JITSI_KID=your_jitsi_kid
JITSI_API_KEY=your_jitsi_api_key
JITSI_PRIVATE_KEY_PATH=./jitsi-private-key.pem
```
*Note: Ensure your `jitsi-private-key.pem` file is placed directly in the `server/` directory.*

Start the backend server:
```bash
npm start
```

### 3. Frontend Configuration
Navigate to the client directory, install dependencies, and configure environment variables.
```bash
cd ../client
npm install
```

Create a `.env` file in the `client/` directory:
```env
REACT_APP_API_URL=http://localhost:5000
```

Start the React development server:
```bash
npm start
```
