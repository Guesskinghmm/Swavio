import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 via-gray-900 to-black text-gray-300 py-10 mt-12 border-t border-gray-800 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
        
        {/* Left Section */}
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold text-white mb-1 tracking-wide">
            Swavio
          </h2>
          <p className="text-sm text-gray-400">
            Empowering skills, connecting learners.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex gap-6 text-sm font-medium">
          {[
            { label: "Privacy Policy", to: "/privacy-policy" },
            { label: "Terms & Conditions", to: "/terms" },
            { label: "Contact", to: "/contact" },
          ].map((link, idx) => (
            <Link
              key={idx}
              to={link.to}
              className="relative group transition duration-300"
            >
              <span className="text-gray-400 group-hover:text-white transition duration-300">
                {link.label}
              </span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 group-hover:w-full"></span>
            </Link>
          ))}
        </div>

        {/* Copyright */}
        <div className="text-xs text-gray-500 text-center md:text-right">
          &copy; {new Date().getFullYear()} Swavio. All rights reserved.
        </div>
      </div>

      {/* Subtle gradient glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-10 blur-3xl pointer-events-none"></div>
    </footer>
  );
}
