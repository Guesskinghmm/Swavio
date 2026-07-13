import React, { useState } from "react";
import { Link } from "react-router-dom";
import heroImage from "../assets/hero-skills.png";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Target,
  Zap,
  ChevronDown,
  Users,
  ShieldCheck,
  Clock,
  Globe,
  Sparkles,
  CheckCircle,
  TrendingUp,
} from "lucide-react";

const Home = () => {
  const [openFAQ, setOpenFAQ] = useState(null);

  const stats = [
    { label: "Skills Swapped", value: 2345, icon: <TrendingUp className="w-8 h-8 text-indigo-500" /> },
    { label: "Active Users", value: 985, icon: <Users className="w-8 h-8 text-green-500" /> },
    { label: "Successful Matches", value: 1876, icon: <CheckCircle className="w-8 h-8 text-yellow-500" /> },
    { label: "Countries", value: 24, icon: <Globe className="w-8 h-8 text-purple-500" /> },
  ];

  const features = [
    {
      title: "Real-Time Matching",
      desc: "Find learners and mentors instantly based on your skills and interests.",
      icon: <Zap className="w-10 h-10 text-indigo-500 mb-4" />,
    },
    {
      title: "Interactive Chat",
      desc: "Communicate seamlessly with mentors and learners to schedule sessions.",
      icon: <MessageSquare className="w-10 h-10 text-green-500 mb-4" />,
    },
    {
      title: "Gamified Progress",
      desc: "Earn badges and track your growth as you teach and learn new skills.",
      icon: <Target className="w-10 h-10 text-yellow-500 mb-4" />,
    },
  ];

  const steps = [
    {
      title: "1. Create Your Profile",
      desc: "Sign up, add the skills you can teach, and the skills you want to learn.",
      icon: <Users className="w-12 h-12 text-purple-500 mb-3" />,
    },
    {
      title: "2. Match & Connect",
      desc: "Our AI instantly connects you with learners or mentors worldwide.",
      icon: <Zap className="w-12 h-12 text-yellow-500 mb-3" />,
    },
    {
      title: "3. Learn & Share",
      desc: "Chat, schedule sessions, and grow your skillset together.",
      icon: <Clock className="w-12 h-12 text-blue-500 mb-3" />,
    },
  ];

  const testimonials = [
    { name: "Amit", quote: "I learned French while teaching Python. It’s a unique experience!" },
    { name: "Sara", quote: "I found my perfect match in minutes and now we learn together daily." },
    { name: "Leo", quote: "Swavio helped me build a portfolio while learning guitar." },
  ];

  const faqData = [
    {
      question: "How does Swavio work?",
      answer:
        "Swavio connects learners and mentors based on the skills you want to learn and teach. You can match, chat, and start learning immediately.",
    },
    {
      question: "Is Swavio free?",
      answer:
        "Yes! Basic features are completely free. Premium plans are available for advanced matchmaking and tracking tools.",
    },
    {
      question: "How do I become a mentor?",
      answer:
        "Simply add skills you can teach to your profile. Learners can then match with you and request mentorship sessions.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Absolutely. We use industry-standard encryption and never share your personal details without your consent.",
    },
    {
      question: "Can I learn multiple skills at once?",
      answer:
        "Yes! You can add multiple skills to learn and teach simultaneously, making your journey even more flexible.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-white">
      {/* Hero Section */}
      <section className="flex flex-col-reverse md:flex-row items-center justify-between max-w-7xl mx-auto px-6 py-20">
        <motion.div
          className="md:w-1/2 text-center md:text-left"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Exchange Skills.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Grow Together.
            </span>
          </h1>
          <p className="text-lg mb-6 text-gray-600 dark:text-gray-300">
            Welcome to Swavio – the easiest way to learn something new by
            sharing what you know.
          </p>
          <Link
            to="/learnmore"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg transition shadow-lg hover:shadow-xl"
          >
            Learn More
          </Link>
        </motion.div>

        <motion.div
          className="md:w-1/2 mb-10 md:mb-0 flex justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <img
            src={heroImage}
            alt="Swavio Hero"
            className="w-full max-w-lg transition-transform duration-500 transform hover:scale-105 hover:rotate-1 hover:shadow-2xl hover:brightness-110"
          />
        </motion.div>
      </section>

      {/* Animated Stats */}
      <section className="bg-white dark:bg-gray-900 py-16 px-6 shadow-inner">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg py-8 px-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:scale-105 transition-transform"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15 }}
            >
              <div className="flex justify-center mb-3">{stat.icon}</div>
              <motion.h3
                className="text-4xl font-bold text-blue-600 dark:text-blue-400"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                {stat.value}
              </motion.h3>
              <p className="text-sm mt-2 text-gray-600 dark:text-gray-300 font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick Steps */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700 
                hover:shadow-2xl relative group overflow-hidden"
                whileHover={{ scale: 1.05, y: -4 }}
              >
                {/* Premium glow border */}
                <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition duration-500"></div>
                
                <div className="flex justify-center relative z-10">{step.icon}</div>
                <h3 className="text-xl font-semibold mb-2 relative z-10">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 relative z-10">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features with Premium Glow */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Swavio?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700 
                hover:shadow-2xl relative group overflow-hidden"
                whileHover={{ scale: 1.05, y: -4 }}
              >
                <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition duration-500"></div>
                
                <div className="flex justify-center relative z-10">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-center relative z-10">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-center relative z-10">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials with Glow */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 py-16 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10">What Our Users Say</h2>
          <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                className="bg-white dark:bg-gray-900 shadow-md rounded-2xl p-6 w-full md:w-1/3 
                hover:shadow-2xl transition-all duration-300 cursor-pointer border border-transparent 
                hover:border-blue-300 dark:hover:border-blue-600 relative group overflow-hidden"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                whileHover={{ scale: 1.05, rotate: [0, 1, -1, 0] }}
              >
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition duration-500"></div>
                
                <p className="text-gray-600 dark:text-gray-300 italic mb-4 relative z-10">
                  “{t.quote}”
                </p>
                <h4 className="font-semibold text-blue-600 dark:text-blue-400 relative z-10">– {t.name}</h4>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white dark:bg-gray-900 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            Frequently Asked Questions
          </h2>
          {faqData.map((faq, idx) => (
            <motion.div
              key={idx}
              className="border border-gray-200 dark:border-gray-700 rounded-xl mb-4 overflow-hidden cursor-pointer 
              hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 relative group"
              onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition duration-500"></div>
              
              <div className="flex justify-between items-center p-4 relative z-10">
                <h3 className="text-lg font-medium">{faq.question}</h3>
                <motion.div
                  animate={{ rotate: openFAQ === idx ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </div>
              <AnimatePresence>
                {openFAQ === idx && (
                  <motion.div
                    className="px-4 pb-4 text-gray-600 dark:text-gray-300 relative z-10"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Still have questions or need help?
          </p>
          <Link
            to="/contact"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg 
            shadow-lg hover:shadow-2xl hover:scale-105 transition transform inline-block"
          >
            Contact Support
          </Link>
        </motion.div>
      </section>

{/* Call to Action */}
<section className="relative py-20 text-center text-gray-900 dark:text-white bg-transparent mb-0 pb-0">
  {/* Glass Background */}
  <div className="absolute inset-0 bg-white/40 dark:bg-white/10 backdrop-blur-md border-t border-white/20"></div>

  <div className="relative z-10 px-6 pb-16">
    <h2 className="text-4xl font-extrabold mb-6 drop-shadow-sm">
      Ready to Level Up Your Skills?
    </h2>
    <p className="mb-8 text-lg opacity-80 max-w-2xl mx-auto leading-relaxed">
      Whether you’re a teacher, a learner, or both — Swavio gives you the tools to grow, connect, and thrive.
    </p>
    <Link
      to="/register"
      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg 
                 hover:shadow-xl hover:scale-105 transition-transform duration-300 
                 relative overflow-hidden group"
    >
      <span className="relative z-10">🚀 Get Started</span>
      <span className="absolute inset-0 bg-white opacity-0 
                       group-hover:opacity-20 blur-xl transition duration-500"></span>
    </Link>
  </div>
</section>
    </div>
  );
};

export default Home;
