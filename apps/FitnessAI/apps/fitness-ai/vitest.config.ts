import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./src/fitnessBrain/validation/testSetup.ts"],
    include: ["src/fitnessBrain/validation/**/*.test.ts"],
  },
});
