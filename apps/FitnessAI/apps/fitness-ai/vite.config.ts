import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  base: "./",
  plugins: [react()],
  resolve: {
    alias: {
      "@fitness-ai/app": path.resolve(__dirname, "./src"),
      "@fitness-ai/shared": path.resolve(__dirname, "../../shared"),
      "@fitness-ai/core": path.resolve(__dirname, "../../core/src"),
    },
  },
});
