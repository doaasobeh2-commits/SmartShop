import type { FastifyInstance } from "fastify";
import rateLimit from "@fastify/rate-limit";
import { z } from "zod";
import { env } from "../../config.js";
import { rateLimitErrorBody } from "../../lib/handledErrors.js";
import { requireUserSession } from "../../middleware/requireUserSession.js";
import {
  requireActiveMembership,
  requirePermission,
} from "../../middleware/requireHouseholdAccess.js";
import { ASSIGNABLE_MEMBER_ROLES } from "../../permissions/householdPermissions.js";
import {
  acceptInvitation,
  createInvitation,
  listInvitations,
  revokeInvitation,
} from "./service.js";

const createInviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(ASSIGNABLE_MEMBER_ROLES),
});

export async function invitationRoutes(app: FastifyInstance): Promise<void> {
  const guards = [requireUserSession, requireActiveMembership];

  app.post(
    "/households/current/invitations",
    {
      preHandler: [...guards, requirePermission("members.invite")],
    },
    async (request, reply) => {
      const parsed = createInviteSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: "invalid_body",
          details: parsed.error.flatten(),
        });
      }

      const result = await createInvitation({
        membership: request.membership!,
        email: parsed.data.email,
        role: parsed.data.role,
        ip: request.ip,
      });

      if (!result.ok) {
        const status =
          result.reason === "already_member" ||
          result.reason === "pending_invite_exists"
            ? 409
            : 400;
        return reply.code(status).send({ error: result.reason });
      }

      return {
        invitation: result.invitation,
        ...(result.developmentOnlyToken
          ? {
              developmentOnlyToken: result.developmentOnlyToken,
              developmentOnlyNote:
                "Invite token returned only in development/test. No real email is sent in Phase 2.",
            }
          : {}),
      };
    },
  );

  app.get(
    "/households/current/invitations",
    {
      preHandler: [...guards, requirePermission("invitations.view")],
    },
    async (request) => {
      const invitations = await listInvitations(
        request.membership!.householdId,
      );
      return { invitations };
    },
  );

  app.post(
    "/households/current/invitations/:invitationId/revoke",
    {
      preHandler: [...guards, requirePermission("invitations.revoke")],
    },
    async (request, reply) => {
      const params = z
        .object({ invitationId: z.string().uuid() })
        .safeParse(request.params);
      if (!params.success) {
        return reply.code(400).send({ error: "invalid_params" });
      }

      const result = await revokeInvitation({
        membership: request.membership!,
        invitationId: params.data.invitationId,
        ip: request.ip,
      });

      if (!result.ok) {
        const status = result.reason === "not_found" ? 404 : 409;
        return reply.code(status).send({ error: result.reason });
      }

      return { ok: true };
    },
  );

  await app.register(async (scoped) => {
    await scoped.register(rateLimit, {
      max: env.LOGIN_RATE_MAX,
      timeWindow: env.LOGIN_RATE_WINDOW_MS,
      hook: "preHandler",
      errorResponseBuilder: () => rateLimitErrorBody(),
    });

    scoped.post(
      "/invitations/:token/accept",
      { preHandler: requireUserSession },
      async (request, reply) => {
        const params = z
          .object({ token: z.string().min(16) })
          .safeParse(request.params);
        if (!params.success) {
          return reply.code(400).send({ error: "invalid_token" });
        }

        const result = await acceptInvitation({
          token: params.data.token,
          userId: request.user!.id,
          userEmail: request.user!.email,
          ip: request.ip,
        });

        if (!result.ok) {
          const status =
            result.reason === "invalid_token"
              ? 404
              : result.reason === "already_member"
                ? 409
                : 400;
          return reply.code(status).send({ error: result.reason });
        }

        return {
          ok: true,
          householdId: result.householdId,
          memberId: result.memberId,
          role: result.role,
        };
      },
    );
  });
}
