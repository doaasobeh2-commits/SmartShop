import { and, desc, eq } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../db/client.js";
import {
  householdMembers,
  type MemberRole,
  type MemberStatus,
} from "../db/schema/index.js";
import {
  can,
  type HouseholdPermission,
} from "../permissions/householdPermissions.js";

export type HouseholdMembershipContext = {
  memberId: string;
  householdId: string;
  userId: string;
  role: MemberRole;
  status: MemberStatus;
};

declare module "fastify" {
  interface FastifyRequest {
    membership?: HouseholdMembershipContext;
  }
}

/**
 * Loads the caller's active household membership.
 * Phase 2: "current" = most recently joined active membership.
 * Explicit household switching is deferred.
 */
export async function requireActiveMembership(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  if (!request.user) {
    reply.code(401).send({ error: "unauthorized" });
    return;
  }

  const rows = await db
    .select({
      memberId: householdMembers.id,
      householdId: householdMembers.householdId,
      userId: householdMembers.userId,
      role: householdMembers.role,
      status: householdMembers.status,
    })
    .from(householdMembers)
    .where(
      and(
        eq(householdMembers.userId, request.user.id),
        eq(householdMembers.status, "active"),
      ),
    )
    .orderBy(desc(householdMembers.joinedAt))
    .limit(1);

  const row = rows[0];
  if (!row || !row.userId) {
    reply.code(404).send({ error: "household_not_found" });
    return;
  }

  request.membership = {
    memberId: row.memberId,
    householdId: row.householdId,
    userId: row.userId,
    role: row.role,
    status: row.status,
  };
}

export function requirePermission(permission: HouseholdPermission) {
  return async function permissionGuard(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    if (!request.membership) {
      reply.code(403).send({ error: "forbidden" });
      return;
    }
    if (!can(request.membership.role, permission)) {
      reply.code(403).send({
        error: "forbidden",
        permission,
      });
      return;
    }
  };
}

export async function loadActiveMembershipForUser(
  userId: string,
  householdId?: string,
): Promise<HouseholdMembershipContext | null> {
  const conditions = [
    eq(householdMembers.userId, userId),
    eq(householdMembers.status, "active"),
  ];
  if (householdId) {
    conditions.push(eq(householdMembers.householdId, householdId));
  }

  const rows = await db
    .select({
      memberId: householdMembers.id,
      householdId: householdMembers.householdId,
      userId: householdMembers.userId,
      role: householdMembers.role,
      status: householdMembers.status,
    })
    .from(householdMembers)
    .where(and(...conditions))
    .orderBy(desc(householdMembers.joinedAt))
    .limit(1);

  const row = rows[0];
  if (!row || !row.userId) return null;
  return {
    memberId: row.memberId,
    householdId: row.householdId,
    userId: row.userId,
    role: row.role,
    status: row.status,
  };
}
