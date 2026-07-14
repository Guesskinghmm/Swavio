import axios from "axios";

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://swavio-backend.onrender.com",
  withCredentials: false,
});

export default instance;