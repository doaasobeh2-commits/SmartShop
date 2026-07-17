import type { FastifyInstance } from "fastify";
import rateLimit from "@fastify/rate-limit";
import { z } from "zod";
import { env } from "../../config.js";
import { platformApplicationKeys } from "../../db/schema/index.js";
import { requireUserSession } from "../../middleware/requireUserSession.js";
import {
  requireActiveMembership,
  requirePermission,
} from "../../middleware/requireHouseholdAccess.js";
import {
  ASSIGNABLE_MEMBER_ROLES,
  MANAGED_MEMBER_ROLES,
  can,
} from "../../permissions/householdPermissions.js";
import {
  changeMemberRole,
  publicMember,
} from "../households/service.js";
import { acceptClaimInvitation, createClaimInvitation } from "./claimsService.js";
import {
  createEnrollment,
  listHouseholdEnrollments,
  listMemberEnrollments,
  listPlatformApplications,
  updateEnrollmentStatus,
} from "./enrollmentsService.js";
import {
  createManagedMember,
  updateMemberProfile,
} from "./membersService.js";

const createManagedSchema = z.object({
  displayName: z.string().min(1).max(120),
  role: z.enum(MANAGED_MEMBER_ROLES),
  preferredLocale: z.string().min(2).max(16).optional(),
});

const patchMemberSchema = z
  .object({
    role: z.enum(ASSIGNABLE_MEMBER_ROLES).optional(),
    displayName: z.string().min(1).max(120).optional(),
    preferredLocale: z.string().min(2).max(16).nullable().optional(),
  })
  .refine(
    (v) =>
      v.role !== undefined ||
      v.displayName !== undefined ||
      v.preferredLocale !== undefined,
    { message: "at_least_one_field" },
  );

const createEnrollmentSchema = z.object({
  applicationKey: z.enum(platformApplicationKeys),
  status: z.enum(["invited", "active", "suspended", "removed"]).optional(),
});

const patchEnrollmentSchema = z.object({
  status: z.enum(["active", "suspended", "removed"]),
});

export async function familyRoutes(app: FastifyInstance): Promise<void> {
  const guards = [requireUserSession, requireActiveMembership];

  app.get("/applications", { preHandler: guards }, async () => {
    const applications = await listPlatformApplications();
    return { applications };
  });

  app.post(
    "/households/current/members",
    {
      preHandler: [...guards, requirePermission("members.create_managed")],
    },
    async (request, reply) => {
      const parsed = createManagedSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: "invalid_body",
          details: parsed.error.flatten(),
        });
      }

      const result = await createManagedMember({
        membership: request.membership!,
        displayName: parsed.data.displayName,
        role: parsed.data.role,
        preferredLocale: parsed.data.preferredLocale,
        ip: request.ip,
      });

      if (!result.ok) {
        const status = result.reason === "forbidden" ? 403 : 400;
        return reply.code(status).send({ error: result.reason });
      }

      return reply.code(201).send({ member: result.member });
    },
  );

  app.patch(
    "/households/current/members/:memberId",
    { preHandler: guards },
    async (request, reply) => {
      const params = z
        .object({ memberId: z.string().uuid() })
        .safeParse(request.params);
      const parsed = patchMemberSchema.safeParse(request.body);
      if (!params.success || !parsed.success) {
        return reply.code(400).send({ error: "invalid_body" });
      }

      const membership = request.membership!;
      const wantsRole = parsed.data.role !== undefined;
      const wantsProfile =
        parsed.data.displayName !== undefined ||
        parsed.data.preferredLocale !== undefined;

      if (wantsRole && !can(membership.role, "members.change_role")) {
        return reply.code(403).send({
          error: "forbidden",
          permission: "members.change_role",
        });
      }
      if (wantsProfile && !can(membership.role, "members.create_managed")) {
        return reply.code(403).send({
          error: "forbidden",
          permission: "members.create_managed",
        });
      }

      let memberPayload: ReturnType<typeof publicMember> | null = null;

      if (wantsProfile) {
        const profileResult = await updateMemberProfile({
          membership,
          memberId: params.data.memberId,
          displayName: parsed.data.displayName,
          preferredLocale: parsed.data.preferredLocale,
          ip: request.ip,
        });
        if (!profileResult.ok) {
          if (profileResult.reason === "not_found") {
            return reply.code(404).send({ error: "member_not_found" });
          }
          if (profileResult.reason === "not_managed") {
            return reply.code(400).send({ error: "not_managed" });
          }
          return reply.code(403).send({ error: profileResult.reason });
        }
        memberPayload = profileResult.member;
      }

      if (wantsRole) {
        const roleResult = await changeMemberRole({
          membership,
          memberId: params.data.memberId,
          newRole: parsed.data.role!,
          ip: request.ip,
        });
        if (!roleResult.ok) {
          if (roleResult.reason === "not_found") {
            return reply.code(404).send({ error: "member_not_found" });
          }
          return reply.code(403).send({ error: roleResult.reason });
        }
        memberPayload = publicMember(roleResult.member);
      }

      return { member: memberPayload };
    },
  );

  app.post(
    "/households/current/members/:memberId/claims",
    {
      preHandler: [...guards, requirePermission("members.manage_claims")],
    },
    async (request, reply) => {
      const params = z
        .object({ memberId: z.string().uuid() })
        .safeParse(request.params);
      if (!params.success) {
        return reply.code(400).send({ error: "invalid_params" });
      }

      const result = await createClaimInvitation({
        membership: request.membership!,
        memberId: params.data.memberId,
        ip: request.ip,
      });

      if (!result.ok) {
        const status =
          result.reason === "not_found"
            ? 404
            : result.reason === "already_linked"
              ? 409
              : 403;
        return reply.code(status).send({ error: result.reason });
      }

      return {
        claim: result.claim,
        ...(result.developmentOnlyToken
          ? {
              developmentOnlyToken: result.developmentOnlyToken,
              developmentOnlyNote:
                "Claim token returned only in development/test. No real email is sent.",
            }
          : {}),
      };
    },
  );

  await app.register(async (scoped) => {
    await scoped.register(rateLimit, {
      max: env.LOGIN_RATE_MAX,
      timeWindow: env.LOGIN_RATE_WINDOW_MS,
      hook: "preHandler",
      errorResponseBuilder: () => ({
        statusCode: 429,
        error: "too_many_requests",
        message: "Too many claim accept attempts. Try again later.",
      }),
    });

    scoped.post(
      "/members/claims/:token/accept",
      { preHandler: requireUserSession },
      async (request, reply) => {
        const params = z
          .object({ token: z.string().min(16) })
          .safeParse(request.params);
        if (!params.success) {
          return reply.code(400).send({ error: "invalid_token" });
        }

        const result = await acceptClaimInvitation({
          token: params.data.token,
          userId: request.user!.id,
          ip: request.ip,
        });

        if (!result.ok) {
          const status =
            result.reason === "invalid_token"
              ? 404
              : result.reason === "account_already_linked" ||
                  result.reason === "already_linked" ||
                  result.reason === "already_accepted"
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

  app.get(
    "/households/current/enrollments",
    {
      preHandler: [...guards, requirePermission("enrollments.view")],
    },
    async (request) => {
      const enrollments = await listHouseholdEnrollments(
        request.membership!.householdId,
      );
      return { enrollments };
    },
  );

  app.get(
    "/households/current/members/:memberId/enrollments",
    {
      preHandler: [...guards, requirePermission("enrollments.view")],
    },
    async (request, reply) => {
      const params = z
        .object({ memberId: z.string().uuid() })
        .safeParse(request.params);
      if (!params.success) {
        return reply.code(400).send({ error: "invalid_params" });
      }

      const result = await listMemberEnrollments({
        householdId: request.membership!.householdId,
        memberId: params.data.memberId,
      });
      if (!result.ok) {
        return reply.code(404).send({ error: "member_not_found" });
      }
      return { enrollments: result.enrollments };
    },
  );

  app.post(
    "/households/current/members/:memberId/enrollments",
    {
      preHandler: [...guards, requirePermission("enrollments.manage")],
    },
    async (request, reply) => {
      const params = z
        .object({ memberId: z.string().uuid() })
        .safeParse(request.params);
      const parsed = createEnrollmentSchema.safeParse(request.body);
      if (!params.success || !parsed.success) {
        return reply.code(400).send({ error: "invalid_body" });
      }

      const result = await createEnrollment({
        membership: request.membership!,
        memberId: params.data.memberId,
        applicationKey: parsed.data.applicationKey,
        status: parsed.data.status,
        ip: request.ip,
      });

      if (!result.ok) {
        const status =
          result.reason === "not_found"
            ? 404
            : result.reason === "duplicate_enrollment"
              ? 409
              : result.reason === "forbidden"
                ? 403
                : result.reason === "age_policy_blocked" ||
                    result.reason === "parental_approval_required"
                  ? 403
                  : 400;
        return reply.code(status).send({ error: result.reason });
      }

      return reply.code(201).send({ enrollment: result.enrollment });
    },
  );

  app.patch(
    "/households/current/enrollments/:enrollmentId",
    {
      preHandler: [...guards, requirePermission("enrollments.manage")],
    },
    async (request, reply) => {
      const params = z
        .object({ enrollmentId: z.string().uuid() })
        .safeParse(request.params);
      const parsed = patchEnrollmentSchema.safeParse(request.body);
      if (!params.success || !parsed.success) {
        return reply.code(400).send({ error: "invalid_body" });
      }

      const result = await updateEnrollmentStatus({
        membership: request.membership!,
        enrollmentId: params.data.enrollmentId,
        status: parsed.data.status,
        ip: request.ip,
      });

      if (!result.ok) {
        const status = result.reason === "not_found" ? 404 : 403;
        return reply.code(status).send({ error: result.reason });
      }

      return { enrollment: result.enrollment };
    },
  );
}
