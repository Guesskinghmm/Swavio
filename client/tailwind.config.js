/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        logo: ["Pacifico", "cursive"], // Stylish cursive logo font
        sans: ["Poppins", "sans-serif"], // Default clean font
      },
      backgroundImage: {
        "gradient-skill":
          "linear-gradient(90deg, #ffffff, #e0e0ff, #f0f0ff)",
      },
      animation: {
        shimmer: "shimmer 3s infinite linear",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
