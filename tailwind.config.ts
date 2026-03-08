import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        rose: {
          50: "#fdf2f4",
          100: "#fce7eb",
          200: "#f9d0d9",
          300: "#f4aab9",
          400: "#ec7a92",
          500: "#e04d6e",
          600: "#cb2f54",
          700: "#ab2345",
          800: "#8f203e",
          900: "#7a1e3a",
          950: "#440c1a",
        },
        nude: {
          50: "#faf8f6",
          100: "#f5f0eb",
          200: "#e9dfd5",
          300: "#d9c9b8",
          400: "#c5ae96",
          500: "#b5957a",
          600: "#a7826c",
          700: "#8b6b5a",
          800: "#73594d",
          900: "#5f4b42",
          950: "#322721",
        },
        wine: {
          50: "#faf5f5",
          100: "#f5ebeb",
          200: "#ead6d6",
          300: "#d9b8b8",
          400: "#c29191",
          500: "#ab6e6e",
          600: "#945757",
          700: "#7b4848",
          800: "#663e3e",
          900: "#563636",
          950: "#2d1a1a",
        },
        brand: {
          rose: "#e8b4b8",
          "rose-light": "#f5dfe1",
          "rose-pastel": "#f9eef0",
          nude: "#e8ddd4",
          "nude-soft": "#f5f0eb",
          wine: "#8b6b6b",
          "wine-soft": "#a08080",
        },
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      backgroundImage: {
        "gradient-soft":
          "linear-gradient(160deg, #fdf4f5 0%, #faf5f6 40%, #f8f2ee 100%)",
        "gradient-hero":
          "linear-gradient(180deg, #fdf4f5 0%, #faf8f6 35%, #f6f2ee 100%)",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
