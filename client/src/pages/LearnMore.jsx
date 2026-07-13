import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Rocket, Lightbulb, Target } from "lucide-react";

const LearnMore = () => {
  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-white"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-5xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold text-center mb-10 text-blue-600 dark:text-blue-400">
          Learn More About Swavio
        </h1>

        {/* Section 1 */}
        <section className="mb-16">
          <div className="flex items-center gap-2 mb-4">
            <Rocket className="w-7 h-7 text-blue-500" />
            <h2 className="text-2xl font-semibold">What is Swavio?</h2>
          </div>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Swavio is a platform where people come together to exchange skills.
            You offer a skill you’re good at and in return learn a skill from someone else.
            Whether it's coding, painting, languages, or music — you can grow while helping others grow.
          </p>
        </section>

        {/* Section 2 */}
        <section className="mb-16">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-7 h-7 text-yellow-500" />
            <h2 className="text-2xl font-semibold">How It Works</h2>
          </div>
          <ul className="space-y-4 list-disc pl-6 text-gray-700 dark:text-gray-300">
            <li>Create your profile with skills you can offer and skills you want to learn.</li>
            <li>Get matched with users who complement your skill set.</li>
            <li>Chat in real-time, share files, or even jump on a video call.</li>
            <li>Track your learning progress and earn badges as you go.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="mb-16">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-7 h-7 text-red-500" />
            <h2 className="text-2xl font-semibold">Who Can Use Swavio?</h2>
          </div>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Anyone! Whether you’re a student, professional, hobbyist, or lifelong learner,
            you’ll find like-minded people who want to learn and teach collaboratively.
          </p>
        </section>

        {/* CTA Section */}
        <section className="text-center mt-20">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Join the Swavio Movement?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Connect. Learn. Grow. One skill at a time.
          </p>
          <Link
            to="/register"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition duration-300"
          >
            Get Started
          </Link>
        </section>
      </div>
    </motion.div>
  );
};

export default LearnMore;
