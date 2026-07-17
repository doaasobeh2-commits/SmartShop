import { z } from "zod";
import { config as loadEnv } from "dotenv";

loadEnv();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8787),
  DATABASE_URL: z.string().min(1),
  COOKIE_SECURE: z
    .string()
    .optional()
    .transform((value) => value === "true"),
  COOKIE_DOMAIN: z.string().optional().default(""),
  SESSION_TTL_HOURS: z.coerce.number().int().positive().default(12),
  CORS_ORIGIN: z
    .string()
    .default("http://localhost:5180,http://localhost:5173"),
  ADMIN_BOOTSTRAP_EMAIL: z.string().email().default("fadi.admin@fadi.local"),
  ADMIN_BOOTSTRAP_PASSWORD: z.string().min(12).default("ChangeMe_Owner_2026!"),
  LOGIN_RATE_MAX: z.coerce.number().int().positive().default(5),
  LOGIN_RATE_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  /** Invitation lifetime in hours (default 7 days). */
  INVITE_TTL_HOURS: z.coerce.number().int().positive().default(168),
  /** Managed-member claim invitation lifetime in hours (default 7 days). */
  CLAIM_TTL_HOURS: z.coerce.number().int().positive().default(168),
  /** Household join-request lifetime in hours (default 7 days). */
  JOIN_TTL_HOURS: z.coerce.number().int().positive().default(168),
  /**
   * Policy: whether adults may create invitations.
   * Owners always can. Extensible later to per-household settings.
   */
  ADULT_CAN_INVITE: z.preprocess(
    (value) => value === true || value === "true",
    z.boolean(),
  ),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration");
}

export const env = parsed.data;

export function parseCorsOrigins(value: string): string[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export const ADMIN_SESSION_COOKIE_NAME = "fadi_admin_session";
/** @deprecated Use ADMIN_SESSION_COOKIE_NAME */
export const SESSION_COOKIE_NAME = ADMIN_SESSION_COOKIE_NAME;
export const USER_SESSION_COOKIE_NAME = "fadi_user_session";

export function isDevTokenExposureEnabled(): boolean {
  return env.NODE_ENV === "development" || env.NODE_ENV === "test";
}
