import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F2F4F9",
        navy: {
          DEFAULT: "#1B3F91",
          soft: "#E8EEF8",
          muted: "#5B6B8C",
          ink: "#142447",
        },
        slate: {
          label: "#8B93A7",
          body: "#6B7289",
          line: "#E6E9F0",
          icon: "#9AA3B5",
        },
        success: {
          DEFAULT: "#1F9D63",
          soft: "#E8F7EF",
          text: "#1A8A56",
        },
        warning: {
          DEFAULT: "#D4A017",
          soft: "#FBF3DC",
          icon: "#E6B422",
        },
        accent: {
          purple: "#7B5EA7",
          purpleSoft: "#F0EBF7",
          blueSoft: "#E8EEF8",
          greenSoft: "#E8F6EE",
          yellowSoft: "#FBF4DE",
        },
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"DM Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(20, 36, 71, 0.04), 0 4px 12px rgba(20, 36, 71, 0.04)",
      },
      borderRadius: {
        card: "12px",
        nav: "10px",
      },
      spacing: {
        sidebar: "240px",
      },
    },
  },
  plugins: [],
} satisfies Config;
