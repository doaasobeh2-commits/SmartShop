import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireUserSession } from "../../middleware/requireUserSession.js";
import {
  requireActiveMembership,
  requirePermission,
} from "../../middleware/requireHouseholdAccess.js";
import {
  createHouseholdWithAddress,
  getCurrentHousehold,
  listCurrentMembers,
  publicHousehold,
  publicMember,
  removeMember,
  updateCurrentHousehold,
} from "./service.js";

const patchHouseholdSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  preferredLocale: z.string().min(2).max(16).optional(),
});

const createHouseholdSchema = z.object({
  name: z.string().min(1).max(120),
  preferredLocale: z.string().min(2).max(16).optional(),
  address: z.object({
    countryCode: z.string().length(2),
    postalCode: z.string().min(1).max(32),
    city: z.string().min(1).max(120),
    street: z.string().min(1).max(200),
    houseNumber: z.string().min(1).max(32),
    unit: z.string().max(64).optional(),
  }),
});

export async function householdRoutes(app: FastifyInstance): Promise<void> {
  const guards = [requireUserSession, requireActiveMembership];

  app.post(
    "/households",
    { preHandler: requireUserSession },
    async (request, reply) => {
      const parsed = createHouseholdSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: "invalid_body",
          details: parsed.error.flatten(),
        });
      }

      const result = await createHouseholdWithAddress({
        userId: request.user!.id,
        displayName: request.user!.displayName,
        name: parsed.data.name,
        preferredLocale: parsed.data.preferredLocale,
        address: parsed.data.address,
        ip: request.ip,
      });

      if (!result.ok) {
        const status =
          result.reason === "already_in_household" ? 409 : 400;
        return reply.code(status).send({ error: result.reason });
      }

      return reply.code(201).send({
        household: result.household,
        memberId: result.memberId,
      });
    },
  );

  app.get(
    "/households/current",
    {
      preHandler: [...guards, requirePermission("household.view")],
    },
    async (request, reply) => {
      const household = await getCurrentHousehold(request.membership!);
      if (!household) {
        return reply.code(404).send({ error: "household_not_found" });
      }
      return { household: publicHousehold(household) };
    },
  );

  app.patch(
    "/households/current",
    {
      preHandler: [...guards, requirePermission("household.manage")],
    },
    async (request, reply) => {
      const parsed = patchHouseholdSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: "invalid_body",
          details: parsed.error.flatten(),
        });
      }
      if (
        parsed.data.name === undefined &&
        parsed.data.preferredLocale === undefined
      ) {
        return reply.code(400).send({ error: "invalid_body" });
      }

      const updated = await updateCurrentHousehold(
        request.membership!,
        parsed.data,
        request.ip,
      );
      return { household: publicHousehold(updated) };
    },
  );

  app.get(
    "/households/current/members",
    {
      preHandler: [...guards, requirePermission("members.view")],
    },
    async (request) => {
      const members = await listCurrentMembers(request.membership!.householdId);
      return { members: members.map(publicMember) };
    },
  );

  // PATCH /households/current/members/:memberId lives in family/routes.ts
  // (role + managed profile fields).

  app.delete(
    "/households/current/members/:memberId",
    {
      preHandler: [...guards, requirePermission("members.remove")],
    },
    async (request, reply) => {
      const params = z
        .object({ memberId: z.string().uuid() })
        .safeParse(request.params);
      if (!params.success) {
        return reply.code(400).send({ error: "invalid_params" });
      }

      const result = await removeMember({
        membership: request.membership!,
        memberId: params.data.memberId,
        ip: request.ip,
      });

      if (!result.ok) {
        if (result.reason === "not_found") {
          return reply.code(404).send({ error: "member_not_found" });
        }
        return reply.code(403).send({ error: "cannot_remove_owner" });
      }

      return { ok: true };
    },
  );
}
