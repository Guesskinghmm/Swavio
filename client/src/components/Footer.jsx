import { Link } from "react-router-dom";

const LINKS = [
  { label: "Privacy Policy",      to: "/privacy-policy" },
  { label: "Terms & Conditions",  to: "/terms" },
  { label: "Contact",             to: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">

        {/* Brand */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight">
            Swavio
          </span>
          <span className="text-gray-300 dark:text-gray-700 select-none">·</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Empowering skills, connecting learners
          </span>
        </div>

        {/* Links */}
        <nav className="flex items-center gap-5">
          {LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Copyright */}
        <p className="text-xs text-gray-400 dark:text-gray-500">
          &copy; {new Date().getFullYear()} Swavio
        </p>
      </div>
    </footer>
  );
}
