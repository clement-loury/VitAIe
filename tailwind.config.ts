import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        violet: {
          DEFAULT: "#5B2D8E",
          50: "#F3EDFB",
          100: "#E7DBFA",
          200: "#CEB7F4",
          500: "#5B2D8E",
          600: "#4a2478",
          700: "#3a1d5f",
        },
        teal: {
          DEFAULT: "#1AA8A8",
          50: "#E6F7F7",
          100: "#CCF0F0",
          500: "#1AA8A8",
          600: "#158888",
        },
        surface: "#F5F5FA",
        dark: "#1C1C2E",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        "3xl": "20px",
      },
      boxShadow: {
        card: "0 2px 12px rgba(0,0,0,0.06)",
        hover: "0 8px 30px rgba(91,45,142,0.12)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out",
        "pulse-slow": "pulse 3s infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
