import { motion } from "framer-motion";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 py-16 px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
      >
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600 dark:text-blue-400">
          Terms & Conditions
        </h1>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Welcome to <strong>Swavio</strong>! By accessing or using our
          services, you agree to the following terms and conditions.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">1. User Responsibilities</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Users must provide accurate information and comply with all local laws
          when using the platform.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">2. Prohibited Actions</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Users are not allowed to spam, harass, or attempt to breach platform
          security.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">3. Termination of Access</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          We reserve the right to suspend or terminate accounts for violating
          these terms.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">4. Changes to Terms</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Terms may be updated from time to time. Users will be notified of
          significant changes.
        </p>
      </motion.div>
    </div>
  );
}
