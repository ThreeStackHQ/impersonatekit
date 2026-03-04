import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#020617",
        foreground: "#f1f5f9",
        accent: {
          DEFAULT: "#6366f1",
          foreground: "#f1f5f9",
        },
      },
    },
  },
  plugins: [],
};

export default config;
