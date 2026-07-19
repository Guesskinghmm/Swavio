// src/socket.js
import { io } from "socket.io-client";

export const SERVER_URL =
  process.env.REACT_APP_API_URL || "https://swavio-backend.onrender.com";

export const socket = io(SERVER_URL, {
  transports: ["websocket"],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

