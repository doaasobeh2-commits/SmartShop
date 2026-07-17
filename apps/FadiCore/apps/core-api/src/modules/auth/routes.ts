import type { FastifyInstance } from "fastify";
import rateLimit from "@fastify/rate-limit";
import { z } from "zod";
import { env, SESSION_COOKIE_NAME } from "../../config.js";
import { isDatabaseConnectionError } from "../../db/errors.js";
import { requireAdminSession } from "../../middleware/requireAdminSession.js";
import { db } from "../../db/client.js";
import { auditLogs } from "../../db/schema/index.js";
import { loginAdmin } from "./service.js";
import {
  clearSessionCookie,
  revokeSessionByToken,
  setSessionCookie,
} from "./session.js";

const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function authRoutes(app: FastifyInstance): Promise<void> {
  await app.register(async (scoped) => {
    await scoped.register(rateLimit, {
      max: env.LOGIN_RATE_MAX,
      timeWindow: env.LOGIN_RATE_WINDOW_MS,
      hook: "preHandler",
      errorResponseBuilder: () => ({
        statusCode: 429,
        error: "too_many_requests",
        message: "Too many login attempts. Try again later.",
      }),
    });

    scoped.post("/admin/auth/login", async (request, reply) => {
      const parsed = loginBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: "invalid_body",
          details: parsed.error.flatten(),
        });
      }

      const result = await loginAdmin({
        email: parsed.data.email,
        password: parsed.data.password,
        ip: request.ip,
        userAgent: request.headers["user-agent"],
      });

      if (!result.ok) {
        if (result.reason === "database_unavailable") {
          return reply.code(503).send({
            error: "database_unavailable",
            message:
              "Cannot reach PostgreSQL. Start apps/FadiCore/docker compose (port 5433), then run db:migrate and db:seed.",
          });
        }
        return reply.code(401).send({ error: "invalid_credentials" });
      }

      setSessionCookie(reply, result.token, result.expiresAt);

      return {
        user: {
          id: result.principal.id,
          email: result.principal.email,
          displayName: result.principal.displayName,
          role: result.principal.role,
        },
      };
    });
  });

  app.get(
    "/admin/auth/me",
    { preHandler: requireAdminSession },
    async (request) => {
      return {
        user: {
          id: request.admin!.id,
          email: request.admin!.email,
          displayName: request.admin!.displayName,
          role: request.admin!.role,
        },
      };
    },
  );

  app.post(
    "/admin/auth/logout",
    { preHandler: requireAdminSession },
    async (request, reply) => {
      try {
        const token = request.cookies[SESSION_COOKIE_NAME];
        if (token) {
          await revokeSessionByToken(token);
        }

        await db.insert(auditLogs).values({
          actorType: "admin",
          actorId: request.admin!.id,
          action: "admin.auth.logout",
          resourceType: "admin_user",
          resourceId: request.admin!.id,
          metaJson: {},
          ip: request.ip,
        });
      } catch (error) {
        if (isDatabaseConnectionError(error)) {
          clearSessionCookie(reply);
          return reply.code(503).send({
            error: "database_unavailable",
            message:
              "Cannot reach PostgreSQL while completing logout. Local session cookie was cleared.",
          });
        }
        throw error;
      }

      clearSessionCookie(reply);
      return { ok: true };
    },
  );
}
