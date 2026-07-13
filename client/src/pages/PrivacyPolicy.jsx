import { motion } from "framer-motion";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 py-16 px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
      >
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600 dark:text-blue-400">
          Privacy Policy
        </h1>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          At <strong>Swavio</strong>, your privacy is our priority. This policy
          outlines how we collect, use, and protect your data.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          We collect your name, email address, and usage data to improve your
          learning experience on our platform.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">2. How We Use Your Data</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Your information helps us personalize content, send notifications, and
          enhance platform security.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">3. Data Protection</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          We implement industry-standard security measures to protect your data
          from unauthorized access.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">4. Contact Us</h2>
        <p className="text-gray-600 dark:text-gray-400">
          For privacy concerns, contact us at{" "}
          <span className="text-blue-600 dark:text-blue-400">
            support@swavio.com
          </span>
          .
        </p>
      </motion.div>
    </div>
  );
}
