import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000", // ✅ or your deployed backend URL
  withCredentials: false,
});

export default instance;
