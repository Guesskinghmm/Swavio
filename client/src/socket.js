// src/socket.js
import { io } from "socket.io-client";

export const SERVER_URL = "http://localhost:5000"; // or your server IP

export const socket = io(SERVER_URL, {
  transports: ["websocket"],
  autoConnect: true,
});
