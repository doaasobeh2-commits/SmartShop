import type { Config } from "tailwindcss";

export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "../../shared/**/*.{ts,tsx}",
    "../../ecosystem/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: {
          DEFAULT: "var(--foreground)",
          80: "color-mix(in srgb, var(--foreground) 80%, transparent)",
          70: "color-mix(in srgb, var(--foreground) 70%, transparent)",
          15: "color-mix(in srgb, var(--foreground) 15%, transparent)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          15: "color-mix(in srgb, var(--primary) 15%, transparent)",
          30: "color-mix(in srgb, var(--primary) 30%, transparent)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
          50: "color-mix(in srgb, var(--secondary) 50%, transparent)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: {
            DEFAULT: "var(--muted-foreground)",
            60: "color-mix(in srgb, var(--muted-foreground) 60%, transparent)",
            50: "color-mix(in srgb, var(--muted-foreground) 50%, transparent)",
          },
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
          10: "color-mix(in srgb, var(--accent) 10%, transparent)",
          25: "color-mix(in srgb, var(--accent) 25%, transparent)",
        },
        border: "var(--border)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"],
      },
      boxShadow: {
        "primary-30": "0 10px 15px -3px rgba(99, 102, 241, 0.3)",
      },
    },
  },
  plugins: [],
} satisfies Config;
