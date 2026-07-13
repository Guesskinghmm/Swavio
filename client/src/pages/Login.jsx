import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset error before submitting
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form);

      // ✅ Store token and userId
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user._id);
      localStorage.setItem("fullName", res.data.user.fullName); // ✅ This is needed!
      localStorage.setItem("user", JSON.stringify(res.data.user)); // Optional but helpful


      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.msg || "Login failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800">

      {/* Logo */}
      <img src={logo} alt="Swavio Logo" className="h-20 mb-4" />

      <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Login</h2>
      <p className="mb-6 text-gray-600 dark:text-gray-300 text-sm">
        Welcome back! Please login to your account.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 w-80"
      >
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full p-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-green-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          required
        />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          className="w-full p-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-green-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          required
        />

        {error && (
          <p className="text-red-500 text-sm mb-3 text-center">{error}</p>
        )}

        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white py-2 rounded w-full transition"
        >
          Login
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">
        Don’t have an account?{" "}
        <span
          onClick={() => navigate("/register")}
          className="text-green-500 cursor-pointer hover:underline"
        >
          Register
        </span>
      </p>
    </div>
  );
}
