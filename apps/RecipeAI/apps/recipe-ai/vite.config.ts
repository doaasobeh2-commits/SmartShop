import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  base: "./",
  plugins: [react()],
  resolve: {
    alias: {
      "@recipe-ai/app": path.resolve(__dirname, "./src"),
      "@recipe-ai/shared": path.resolve(__dirname, "../../shared"),
      "@recipe-ai/core": path.resolve(__dirname, "../../core/src"),
    },
  },
});
