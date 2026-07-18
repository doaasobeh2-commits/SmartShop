import type { FastifyInstance } from "fastify";
import rateLimit from "@fastify/rate-limit";
import { z } from "zod";
import { env, USER_SESSION_COOKIE_NAME } from "../../config.js";
import { isDatabaseConnectionError } from "../../db/errors.js";
import { writeAudit } from "../../lib/audit.js";
import { replyDatabaseUnavailable, rateLimitErrorBody } from "../../lib/handledErrors.js";
import { requireUserSession } from "../../middleware/requireUserSession.js";
import { loadActiveMembershipForUser } from "../../middleware/requireHouseholdAccess.js";
import { listActiveEnrollmentsForMember } from "../family/enrollmentsService.js";
import { loginUser, registerUser } from "./service.js";
import {
  clearUserSessionCookie,
  revokeUserSessionByToken,
  setUserSessionCookie,
} from "./session.js";

const registerBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
  displayName: z.string().min(1).max(120),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD")
    .optional(),
  preferredLocale: z.string().min(2).max(16).optional(),
});

const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function userAuthRoutes(app: FastifyInstance): Promise<void> {
  await app.register(async (scoped) => {
    await scoped.register(rateLimit, {
      max: env.LOGIN_RATE_MAX,
      timeWindow: env.LOGIN_RATE_WINDOW_MS,
      hook: "preHandler",
      errorResponseBuilder: () => rateLimitErrorBody(),
    });

    scoped.post("/auth/register", async (request, reply) => {
      const parsed = registerBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: "invalid_body",
          details: parsed.error.flatten(),
        });
      }

      const result = await registerUser({
        ...parsed.data,
        ip: request.ip,
        userAgent: request.headers["user-agent"],
      });

      if (!result.ok) {
        if (result.reason === "email_taken") {
          return reply.code(409).send({ error: "email_taken" });
        }
        if (result.reason === "weak_password") {
          return reply.code(400).send({ error: "weak_password" });
        }
        if (result.reason === "invalid_date_of_birth") {
          return reply.code(400).send({ error: "invalid_date_of_birth" });
        }
        return replyDatabaseUnavailable(reply, request);
      }

      setUserSessionCookie(reply, result.token, result.expiresAt);
      return {
        user: {
          id: result.principal.id,
          email: result.principal.email,
          displayName: result.principal.displayName,
          status: result.principal.status,
          dateOfBirth: result.dateOfBirth,
        },
        householdId: null,
      };
    });

    scoped.post("/auth/login", async (request, reply) => {
      const parsed = loginBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: "invalid_body",
          details: parsed.error.flatten(),
        });
      }

      const result = await loginUser({
        email: parsed.data.email,
        password: parsed.data.password,
        ip: request.ip,
        userAgent: request.headers["user-agent"],
      });

      if (!result.ok) {
        if (result.reason === "database_unavailable") {
          return replyDatabaseUnavailable(reply, request);
        }
        return reply.code(401).send({ error: "invalid_credentials" });
      }

      setUserSessionCookie(reply, result.token, result.expiresAt);
      return {
        user: {
          id: result.principal.id,
          email: result.principal.email,
          displayName: result.principal.displayName,
          status: result.principal.status,
        },
      };
    });
  });

  app.get("/auth/me", { preHandler: requireUserSession }, async (request) => {
    const membership = await loadActiveMembershipForUser(request.user!.id);
    const enrollments = membership
      ? await listActiveEnrollmentsForMember(membership.memberId)
      : [];
    return {
      user: {
        id: request.user!.id,
        email: request.user!.email,
        displayName: request.user!.displayName,
        status: request.user!.status,
      },
      householdId: membership?.householdId ?? null,
      memberId: membership?.memberId ?? null,
      memberRole: membership?.role ?? null,
      enrollments,
    };
  });

  app.post(
    "/auth/logout",
    { preHandler: requireUserSession },
    async (request, reply) => {
      try {
        const token = request.cookies[USER_SESSION_COOKIE_NAME];
        if (token) {
          await revokeUserSessionByToken(token);
        }
        await writeAudit({
          actorType: "user",
          actorId: request.user!.id,
          action: "user.logout",
          resourceType: "user_account",
          resourceId: request.user!.id,
          ip: request.ip,
        });
      } catch (error) {
        if (isDatabaseConnectionError(error)) {
          clearUserSessionCookie(reply);
          return replyDatabaseUnavailable(reply, request, error);
        }
        throw error;
      }

      clearUserSessionCookie(reply);
      return { ok: true };
    },
  );
}
