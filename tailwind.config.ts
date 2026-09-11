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
        tape: {
          bg: "#07080a",
          fg: "#e7edf2",
          muted: "#8b98a5",
          dim: "#5c6770",
          line: "#1c2128",
          lift: "#101317",
          amber: "#e8b86d",
          violet: "#a78bfa",
          ok: "#7dcea0",
          err: "#e07a7a",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "JetBrains Mono", "monospace"],
        display: ["var(--font-display)", "Barlow Condensed", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
