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
  Globe,
  CheckCircle,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

const STATS = [
  { label: "Skills Swapped",       value: "2,345+", icon: TrendingUp },
  { label: "Active Users",         value: "985+",   icon: Users },
  { label: "Successful Matches",   value: "1,876+", icon: CheckCircle },
  { label: "Countries",            value: "24",     icon: Globe },
];

const FEATURES = [
  {
    title: "Real-Time Matching",
    desc:  "Find learners and mentors instantly based on your skills and interests.",
    icon:  Zap,
    color: "text-brand-500",
    bg:    "bg-brand-50 dark:bg-brand-900/20",
  },
  {
    title: "Interactive Chat",
    desc:  "Communicate seamlessly with mentors and learners to schedule sessions.",
    icon:  MessageSquare,
    color: "text-emerald-600",
    bg:    "bg-emerald-50 dark:bg-emerald-900/20",
  },
  {
    title: "Gamified Progress",
    desc:  "Earn badges and track your growth as you teach and learn new skills.",
    icon:  Target,
    color: "text-amber-500",
    bg:    "bg-amber-50 dark:bg-amber-900/20",
  },
];

const STEPS = [
  {
    num:   "01",
    title: "Create Your Profile",
    desc:  "Sign up, add the skills you can teach, and the skills you want to learn.",
  },
  {
    num:   "02",
    title: "Match & Connect",
    desc:  "Our algorithm connects you with learners or mentors worldwide.",
  },
  {
    num:   "03",
    title: "Learn & Share",
    desc:  "Chat, schedule sessions, and grow your skillset together.",
  },
];

const TESTIMONIALS = [
  { name: "Amit R.",   quote: "I learned French while teaching Python. A truly unique experience that accelerated both skills." },
  { name: "Sara K.",   quote: "Found my perfect match in minutes. We learn together every day and the progress is remarkable." },
  { name: "Leo M.",    quote: "Swavio helped me build a portfolio while learning guitar — two goals, one platform." },
];

const FAQ = [
  {
    question: "How does Swavio work?",
    answer: "Swavio connects learners and mentors based on the skills you want to learn and teach. You can match, chat, and start learning immediately.",
  },
  {
    question: "Is Swavio free to use?",
    answer: "Yes. Basic features are completely free. Premium plans are available for advanced matchmaking and progress tracking tools.",
  },
  {
    question: "How do I become a mentor?",
    answer: "Simply add skills you can teach to your profile. Learners can then match with you and request mentorship sessions.",
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use industry-standard encryption and never share your personal details without your consent.",
  },
  {
    question: "Can I learn multiple skills at once?",
    answer: "Yes. You can add multiple skills to learn and teach simultaneously, making your journey flexible.",
  },
];

const fadeUp = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

export default function Home() {
  const [openFAQ, setOpenFAQ] = useState(null);

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">

      {/* ── Hero ── */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-24 flex flex-col-reverse md:flex-row items-center gap-12">
        <motion.div
          className="md:w-1/2"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-brand-500 mb-4">
            Skill Exchange Platform
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-5">
            Exchange Skills.{" "}
            <span className="text-brand-600 dark:text-brand-400">
              Grow Together.
            </span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-8 max-w-lg">
            Swavio is the easiest way to learn something new by sharing
            what you already know — no fees, just reciprocal growth.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <Link to="/register" className="btn btn-primary btn-lg">
              Get started free
            </Link>
            <Link to="/learnmore" className="btn btn-secondary btn-lg">
              Learn more <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="md:w-1/2 flex justify-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <img
            src={heroImage}
            alt="Skill exchange illustration"
            className="w-full max-w-md rounded-2xl"
          />
        </motion.div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-gray-50 dark:bg-gray-800/50 border-y border-gray-200 dark:border-gray-700 py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ label, value, icon: Icon }, i) => (
            <motion.div
              key={i}
              className="text-center"
              {...fadeUp}
              transition={{ delay: i * 0.08 }}
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 mb-3">
                <Icon size={20} className="text-brand-600 dark:text-brand-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold tracking-widest uppercase text-brand-500 mb-2">Process</p>
            <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                className="card card-p"
                {...fadeUp}
                transition={{ delay: i * 0.1 }}
              >
                <span className="text-3xl font-black text-gray-100 dark:text-gray-700 leading-none block mb-4">
                  {step.num}
                </span>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-gray-50 dark:bg-gray-800/50 border-y border-gray-200 dark:border-gray-700 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold tracking-widest uppercase text-brand-500 mb-2">Features</p>
            <h2 className="text-3xl font-bold tracking-tight">Why Choose Swavio</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map(({ title, desc, icon: Icon, color, bg }, i) => (
              <motion.div
                key={i}
                className="card card-p"
                {...fadeUp}
                transition={{ delay: i * 0.1 }}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${bg} mb-4`}>
                  <Icon size={22} className={color} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold tracking-widest uppercase text-brand-500 mb-2">Testimonials</p>
            <h2 className="text-3xl font-bold tracking-tight">What Our Users Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                className="card card-p flex flex-col gap-4"
                {...fadeUp}
                transition={{ delay: i * 0.1 }}
              >
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white border-t border-gray-100 dark:border-gray-700 pt-3">
                  {t.name}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-gray-50 dark:bg-gray-800/50 border-y border-gray-200 dark:border-gray-700 py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold tracking-widest uppercase text-brand-500 mb-2">FAQ</p>
            <h2 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-2">
            {FAQ.map((faq, idx) => (
              <motion.div
                key={idx}
                className="card overflow-hidden"
                {...fadeUp}
                transition={{ delay: idx * 0.06 }}
              >
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                  onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openFAQ === idx ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 220, damping: 20 }}
                    className="shrink-0 ml-4"
                  >
                    <ChevronDown size={16} className="text-gray-400" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {openFAQ === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="px-5 pb-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-3">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Ready to grow your skills?
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
              Whether you're a teacher, a learner, or both — Swavio gives you the
              tools to connect, grow, and thrive.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link to="/register" className="btn btn-primary btn-lg">
                Create your account
              </Link>
              <Link to="/contact" className="btn btn-ghost btn-lg">
                Talk to us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
