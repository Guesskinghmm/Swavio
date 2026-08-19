import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter as Router } from "react-router-dom";
import { NotificationProvider } from "./context/NotificationContext";
import { Provider } from "react-redux";
import { store } from "./store";
import axios from "axios";

// Set up global axios interceptor to attach JWT token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </Router>
    </Provider>
  </React.StrictMode>
);
