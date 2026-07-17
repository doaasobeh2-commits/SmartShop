import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: [
    "./src/db/schema/admin.ts",
    "./src/db/schema/households.ts",
    "./src/db/schema/apps.ts",
    "./src/db/schema/audit.ts",
  ],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://fadi:fadi@localhost:5433/fadi_core",
  },
  strict: true,
  verbose: true,
});
