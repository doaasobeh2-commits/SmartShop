import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAdminOwner } from "../../middleware/requireAdminOwner.js";
import { assertNoSecretsInJson } from "../../lib/redact.js";
import {
  getAdminHousehold,
  getAdminOverview,
  getAdminUser,
  listAdminAuditLogs,
  listAdminHouseholds,
  listAdminInvitations,
  listAdminSessions,
  listAdminUsers,
} from "./service.js";

function sendSafe(reply: import("fastify").FastifyReply, payload: unknown) {
  assertNoSecretsInJson(payload);
  return reply.send(payload);
}

export async function adminReadRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/admin/overview",
    { preHandler: requireAdminOwner },
    async (_request, reply) => {
      const data = await getAdminOverview();
      return sendSafe(reply, data);
    },
  );

  app.get(
    "/admin/users",
    { preHandler: requireAdminOwner },
    async (_request, reply) => {
      const users = await listAdminUsers();
      return sendSafe(reply, { users });
    },
  );

  app.get(
    "/admin/users/:userId",
    { preHandler: requireAdminOwner },
    async (request, reply) => {
      const params = z.object({ userId: z.string().uuid() }).safeParse(request.params);
      if (!params.success) {
        return reply.code(400).send({ error: "invalid_params" });
      }
      const user = await getAdminUser(params.data.userId);
      if (!user) {
        return reply.code(404).send({ error: "user_not_found" });
      }
      return sendSafe(reply, { user });
    },
  );

  app.get(
    "/admin/households",
    { preHandler: requireAdminOwner },
    async (_request, reply) => {
      const households = await listAdminHouseholds();
      return sendSafe(reply, { households });
    },
  );

  app.get(
    "/admin/households/:householdId",
    { preHandler: requireAdminOwner },
    async (request, reply) => {
      const params = z
        .object({ householdId: z.string().uuid() })
        .safeParse(request.params);
      if (!params.success) {
        return reply.code(400).send({ error: "invalid_params" });
      }
      const detail = await getAdminHousehold(params.data.householdId);
      if (!detail) {
        return reply.code(404).send({ error: "household_not_found" });
      }
      return sendSafe(reply, detail);
    },
  );

  app.get(
    "/admin/invitations",
    { preHandler: requireAdminOwner },
    async (_request, reply) => {
      const invitations = await listAdminInvitations();
      return sendSafe(reply, { invitations });
    },
  );

  app.get(
    "/admin/sessions",
    { preHandler: requireAdminOwner },
    async (_request, reply) => {
      const sessions = await listAdminSessions();
      return sendSafe(reply, { sessions });
    },
  );

  app.get(
    "/admin/audit-logs",
    { preHandler: requireAdminOwner },
    async (request, reply) => {
      const query = z
        .object({
          page: z.coerce.number().int().positive().default(1),
          pageSize: z.coerce.number().int().positive().max(100).default(25),
          actorType: z.string().optional(),
          action: z.string().optional(),
          from: z.string().datetime().optional(),
          to: z.string().datetime().optional(),
        })
        .safeParse(request.query);

      if (!query.success) {
        return reply.code(400).send({
          error: "invalid_query",
          details: query.error.flatten(),
        });
      }

      const data = await listAdminAuditLogs({
        page: query.data.page,
        pageSize: query.data.pageSize,
        actorType: query.data.actorType,
        action: query.data.action,
        from: query.data.from ? new Date(query.data.from) : undefined,
        to: query.data.to ? new Date(query.data.to) : undefined,
      });
      return sendSafe(reply, data);
    },
  );
}
