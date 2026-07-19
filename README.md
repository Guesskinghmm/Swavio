# Swavio

A clean, minimalist full-stack platform enabling real-time messaging and peer-to-peer video conferencing over the web.

---

##  Key Features

*   **Real-Time Messaging:** Instantaneous, low-latency text chat powered by WebSockets.
*   **Video Conferencing:** High-fidelity audio/video rooms using authenticated WebRTC signaling.
*   **Secure Authentication:** User data protection and session management via JSON Web Tokens (JWT).
*   **Cloud Architecture:** Fully decoupled client-server architecture backed by a cloud-managed NoSQL cluster.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React, Context API, CSS3 |
| **Backend** | Node.js, Express.js, Socket.io |
| **Database** | MongoDB Atlas (Cloud Cluster) |
| **Integrations** | Jitsi vPaaS / WebRTC |
| **Deployment** | Vercel (Client), Render (Server) |

---

## 💻 Local Setup

Follow these steps to run the client and server environments locally:

### 1. Prerequisites
* Node.js (v18+ recommended)
* MongoDB Atlas account or local MongoDB instance

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
REACT_APP_API_URL
```

Start the React development server:
```bash
npm start
```

---

## 🔒 Security & Architecture Notes
*   **Environment Isolation:** All cryptographic secrets, database credentials, and private keys are strictly managed via environment variables and isolated from source control via `.gitignore`.
*   **Signaling Infrastructure:** WebSockets handle the initial signaling and state coordination, while the actual video streams leverage Jitsi’s secure media infrastructure.
