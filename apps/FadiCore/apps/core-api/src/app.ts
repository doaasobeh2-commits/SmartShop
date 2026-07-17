import Fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import { env } from "./config.js";
import { authRoutes } from "./modules/auth/routes.js";
import { healthRoutes } from "./modules/health/routes.js";
import { userAuthRoutes } from "./modules/users/routes.js";
import { householdRoutes } from "./modules/households/routes.js";
import { invitationRoutes } from "./modules/invitations/routes.js";

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "production" ? "info" : "debug",
    },
  });

  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
  });

  await app.register(cookie);

  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(userAuthRoutes);
  await app.register(householdRoutes);
  await app.register(invitationRoutes);

  return app;
}
