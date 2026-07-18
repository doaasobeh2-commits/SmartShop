import Fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import { env, parseCorsOrigins } from "./config.js";
import { LOGGER_REDACT_PATHS } from "./lib/loggerRedact.js";
import { registerSafeErrorHandlers } from "./lib/safeErrors.js";
import { authRoutes } from "./modules/auth/routes.js";
import { healthRoutes } from "./modules/health/routes.js";
import { userAuthRoutes } from "./modules/users/routes.js";
import { householdRoutes } from "./modules/households/routes.js";
import { invitationRoutes } from "./modules/invitations/routes.js";
import { adminReadRoutes } from "./modules/adminRead/routes.js";
import { familyRoutes } from "./modules/family/routes.js";
import { onboardingRoutes } from "./modules/onboarding/routes.js";

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "production" ? "info" : "debug",
      redact: {
        paths: [...LOGGER_REDACT_PATHS],
        censor: "[Redacted]",
      },
    },
  });

  await registerSafeErrorHandlers(app);

  const corsOrigins = parseCorsOrigins(env.CORS_ORIGIN);
  await app.register(cors, {
    origin: (origin, cb) => {
      if (!origin || corsOrigins.includes(origin)) {
        cb(null, true);
        return;
      }
      cb(null, false);
    },
    credentials: true,
  });

  await app.register(cookie);

  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(userAuthRoutes);
  await app.register(householdRoutes);
  await app.register(invitationRoutes);
  await app.register(familyRoutes);
  await app.register(onboardingRoutes);
  await app.register(adminReadRoutes);

  return app;
}
