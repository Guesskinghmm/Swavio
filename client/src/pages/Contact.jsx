import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("Please fill all fields!");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to send message");

      setSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      console.error("Error submitting contact form:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl w-full grid md:grid-cols-2 gap-10"
      >
        {/* Contact Info Card */}
        <motion.div
          className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col justify-center"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6">
            Get in Touch
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Have any questions or feedback? Reach out to us and our support team
            will get back to you as soon as possible.
          </p>

          <div className="space-y-6 text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-3">
              <Mail className="w-6 h-6 text-blue-600" />
              <span>support@Swavio.com</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-6 h-6 text-blue-600" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-blue-600" />
              <span>Bangalore, India</span>
            </div>
          </div>
        </motion.div>

        {/* Contact Form Card */}
        <motion.form
          onSubmit={handleSubmit}
          className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          {submitted ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-green-600 mb-3">
                Message Sent Successfully 
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Our support team will reach out to you shortly.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-gray-50/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="mb-4">
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-gray-50/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="mb-4">
                <textarea
                  name="message"
                  placeholder="Your Message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-gray-50/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-xl transition disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
                {loading ? "Sending..." : "Send Message"}
              </button>
            </>
          )}
        </motion.form>
      </motion.div>
    </div>
  );
}
