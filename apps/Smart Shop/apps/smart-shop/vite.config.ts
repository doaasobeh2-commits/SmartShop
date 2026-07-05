import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  base: "./",
  plugins: [react()],
  resolve: {
    alias: {
      "@smart-shop/app": path.resolve(__dirname, "./src"),
      "@smart-shop/shared": path.resolve(__dirname, "../../shared"),
      "@smart-shop/core": path.resolve(__dirname, "../../core/src"),
      "@smart-shop/ecosystem": path.resolve(__dirname, "../../ecosystem/src"),
    },
  },
});
