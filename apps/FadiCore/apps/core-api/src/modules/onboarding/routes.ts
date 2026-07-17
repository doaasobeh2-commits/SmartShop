import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { platformApplicationKeys } from "../../db/schema/index.js";
import { requireUserSession } from "../../middleware/requireUserSession.js";
import {
  requireActiveMembership,
  requirePermission,
} from "../../middleware/requireHouseholdAccess.js";
import { discoverAddressMatch } from "./addressDiscovery.js";
import { resolveAppIdentity } from "./appIdentity.js";
import {
  approveJoinRequest,
  createJoinRequestByAddress,
  listHouseholdJoinRequests,
  listMyJoinRequests,
  rejectJoinRequest,
} from "./joinRequestsService.js";
import {
  approveParentalApproval,
  listHouseholdParentalApprovals,
  requestFitnessParentalApproval,
  revokeParentalApproval,
} from "./parentalApprovalsService.js";

const addressBodySchema = z.object({
  countryCode: z.string().length(2),
  postalCode: z.string().min(1).max(32),
  city: z.string().min(1).max(120),
  street: z.string().min(1).max(200),
  houseNumber: z.string().min(1).max(32),
  unit: z.string().max(64).optional(),
});

const joinRequestBodySchema = addressBodySchema.extend({
  requestedRole: z.enum(["adult", "teen", "child", "caregiver"]).optional(),
});

const parentalRequestSchema = z.object({
  parentEmail: z.string().email(),
});

export async function onboardingRoutes(app: FastifyInstance): Promise<void> {
  const householdGuards = [requireUserSession, requireActiveMembership];

  app.post(
    "/onboarding/address/discover",
    { preHandler: requireUserSession },
    async (request, reply) => {
      const parsed = addressBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: "invalid_body",
          details: parsed.error.flatten(),
        });
      }

      const result = await discoverAddressMatch(parsed.data);
      return {
        possibleMatch: result.possibleMatch,
        matchCountBand: result.matchCountBand,
      };
    },
  );

  app.post(
    "/onboarding/join-requests",
    { preHandler: requireUserSession },
    async (request, reply) => {
      const parsed = joinRequestBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: "invalid_body",
          details: parsed.error.flatten(),
        });
      }

      const { requestedRole, ...address } = parsed.data;
      const result = await createJoinRequestByAddress({
        userId: request.user!.id,
        address,
        requestedRole,
        ip: request.ip,
      });

      if (!result.ok) {
        const status =
          result.reason === "pending_exists" ||
          result.reason === "already_in_household"
            ? 409
            : 400;
        return reply.code(status).send({ error: result.reason });
      }

      return reply.code(201).send({ joinRequest: result.joinRequest });
    },
  );

  app.get(
    "/onboarding/join-requests/mine",
    { preHandler: requireUserSession },
    async (request) => {
      const joinRequests = await listMyJoinRequests(request.user!.id);
      return { joinRequests };
    },
  );

  app.get(
    "/households/current/join-requests",
    {
      preHandler: [...householdGuards, requirePermission("members.invite")],
    },
    async (request) => {
      const joinRequests = await listHouseholdJoinRequests(
        request.membership!.householdId,
      );
      return { joinRequests };
    },
  );

  app.post(
    "/households/current/join-requests/:id/approve",
    {
      preHandler: [...householdGuards, requirePermission("members.invite")],
    },
    async (request, reply) => {
      const params = z.object({ id: z.string().uuid() }).safeParse(request.params);
      if (!params.success) {
        return reply.code(400).send({ error: "invalid_params" });
      }

      const result = await approveJoinRequest({
        membership: request.membership!,
        requestId: params.data.id,
        ip: request.ip,
      });

      if (!result.ok) {
        const status =
          result.reason === "not_found"
            ? 404
            : result.reason === "forbidden"
              ? 403
              : result.reason === "requester_already_in_household" ||
                  result.reason === "duplicate_membership"
                ? 409
                : 400;
        return reply.code(status).send({ error: result.reason });
      }

      return { ok: true, memberId: result.memberId };
    },
  );

  app.post(
    "/households/current/join-requests/:id/reject",
    {
      preHandler: [...householdGuards, requirePermission("members.invite")],
    },
    async (request, reply) => {
      const params = z.object({ id: z.string().uuid() }).safeParse(request.params);
      if (!params.success) {
        return reply.code(400).send({ error: "invalid_params" });
      }

      const result = await rejectJoinRequest({
        membership: request.membership!,
        requestId: params.data.id,
        ip: request.ip,
      });

      if (!result.ok) {
        const status =
          result.reason === "not_found"
            ? 404
            : result.reason === "forbidden"
              ? 403
              : 400;
        return reply.code(status).send({ error: result.reason });
      }

      return { ok: true };
    },
  );

  app.post(
    "/onboarding/fitness/parental-request",
    { preHandler: requireUserSession },
    async (request, reply) => {
      const parsed = parentalRequestSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: "invalid_body",
          details: parsed.error.flatten(),
        });
      }

      const result = await requestFitnessParentalApproval({
        userId: request.user!.id,
        parentEmail: parsed.data.parentEmail,
        ip: request.ip,
      });

      if (!result.ok) {
        return reply.code(403).send({ error: result.reason });
      }

      return { ok: true, status: result.status };
    },
  );

  app.get(
    "/households/current/parental-approvals",
    {
      preHandler: [
        ...householdGuards,
        requirePermission("members.create_managed"),
      ],
    },
    async (request) => {
      const approvals = await listHouseholdParentalApprovals(
        request.membership!.householdId,
      );
      return { approvals };
    },
  );

  app.post(
    "/households/current/parental-approvals/:id/approve",
    {
      preHandler: [
        ...householdGuards,
        requirePermission("members.create_managed"),
      ],
    },
    async (request, reply) => {
      const params = z.object({ id: z.string().uuid() }).safeParse(request.params);
      if (!params.success) {
        return reply.code(400).send({ error: "invalid_params" });
      }

      const result = await approveParentalApproval({
        membership: request.membership!,
        approvalId: params.data.id,
        ip: request.ip,
      });

      if (!result.ok) {
        const status =
          result.reason === "not_found"
            ? 404
            : result.reason === "forbidden" ||
                result.reason === "self_approve_forbidden"
              ? 403
              : result.reason === "requester_already_in_household"
                ? 409
                : 400;
        return reply.code(status).send({ error: result.reason });
      }

      return { ok: true };
    },
  );

  app.post(
    "/households/current/parental-approvals/:id/revoke",
    {
      preHandler: [
        ...householdGuards,
        requirePermission("members.create_managed"),
      ],
    },
    async (request, reply) => {
      const params = z.object({ id: z.string().uuid() }).safeParse(request.params);
      if (!params.success) {
        return reply.code(400).send({ error: "invalid_params" });
      }

      const result = await revokeParentalApproval({
        membership: request.membership!,
        approvalId: params.data.id,
        ip: request.ip,
      });

      if (!result.ok) {
        const status =
          result.reason === "not_found"
            ? 404
            : result.reason === "forbidden"
              ? 403
              : 400;
        return reply.code(status).send({ error: result.reason });
      }

      return { ok: true };
    },
  );

  app.get(
    "/me/app-identity/:applicationKey",
    { preHandler: requireUserSession },
    async (request, reply) => {
      const params = z
        .object({ applicationKey: z.enum(platformApplicationKeys) })
        .safeParse(request.params);
      if (!params.success) {
        return reply.code(400).send({ error: "invalid_application" });
      }

      const result = await resolveAppIdentity({
        userId: request.user!.id,
        applicationKey: params.data.applicationKey,
      });

      if (!result.ok) {
        return reply.code(404).send({ error: result.reason });
      }

      return result.identity;
    },
  );
}
