import { and, eq, gt } from "drizzle-orm";
import { env } from "../../config.js";
import { db } from "../../db/client.js";
import {
  householdJoinRequests,
  householdMembers,
  userAccounts,
  type MemberRole,
} from "../../db/schema/index.js";
import { writeAudit } from "../../lib/audit.js";
import {
  normalizeAddress,
  type AddressInput,
} from "../../lib/addressNormalize.js";
import type { HouseholdMembershipContext } from "../../middleware/requireHouseholdAccess.js";
import { can } from "../../permissions/householdPermissions.js";
import { loadActiveMembershipForUser } from "../../middleware/requireHouseholdAccess.js";
import { findHouseholdIdsByAddressHash } from "./addressDiscovery.js";

export function publicJoinRequest(row: {
  id: string;
  requesterUserId: string;
  targetHouseholdId: string;
  requestedRole: MemberRole | string;
  status: string;
  createdAt: Date;
  expiresAt: Date;
  resolvedAt: Date | null;
  resolvedByMemberId: string | null;
  requesterEmail?: string | null;
  requesterDisplayName?: string | null;
}) {
  return {
    id: row.id,
    requesterUserId: row.requesterUserId,
    targetHouseholdId: row.targetHouseholdId,
    requestedRole: row.requestedRole,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    expiresAt: row.expiresAt.toISOString(),
    resolvedAt: row.resolvedAt?.toISOString() ?? null,
    resolvedByMemberId: row.resolvedByMemberId,
    ...(row.requesterEmail !== undefined
      ? {
          requesterEmail: row.requesterEmail ?? null,
          requesterDisplayName: row.requesterDisplayName ?? null,
        }
      : {}),
  };
}

export async function createJoinRequestByAddress(input: {
  userId: string;
  address: AddressInput;
  requestedRole?: MemberRole;
  ip?: string;
}): Promise<
  | { ok: true; joinRequest: ReturnType<typeof publicJoinRequest> }
  | {
      ok: false;
      reason:
        | "already_in_household"
        | "no_match"
        | "ambiguous_address"
        | "pending_exists"
        | "invalid_role";
    }
> {
  const existing = await loadActiveMembershipForUser(input.userId);
  if (existing) {
    return { ok: false, reason: "already_in_household" };
  }

  const role = input.requestedRole ?? "adult";
  if (role === "owner") {
    return { ok: false, reason: "invalid_role" };
  }

  const normalized = normalizeAddress(input.address);
  const householdIds = await findHouseholdIdsByAddressHash(
    normalized.normalizedAddressHash,
  );

  if (householdIds.length === 0) {
    return { ok: false, reason: "no_match" };
  }
  if (householdIds.length > 1) {
    return { ok: false, reason: "ambiguous_address" };
  }

  const targetHouseholdId = householdIds[0]!;
  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + env.JOIN_TTL_HOURS * 60 * 60 * 1000,
  );

  const pending = await db
    .select({ id: householdJoinRequests.id })
    .from(householdJoinRequests)
    .where(
      and(
        eq(householdJoinRequests.requesterUserId, input.userId),
        eq(householdJoinRequests.targetHouseholdId, targetHouseholdId),
        eq(householdJoinRequests.status, "pending"),
        gt(householdJoinRequests.expiresAt, now),
      ),
    )
    .limit(1);
  if (pending[0]) {
    return { ok: false, reason: "pending_exists" };
  }

  try {
    const [row] = await db
      .insert(householdJoinRequests)
      .values({
        requesterUserId: input.userId,
        targetHouseholdId,
        requestedRole: role,
        status: "pending",
        createdAt: now,
        expiresAt,
      })
      .returning();

    await writeAudit({
      actorType: "user",
      actorId: input.userId,
      action: "household.join_request.created",
      resourceType: "household_join_request",
      resourceId: row.id,
      metaJson: { targetHouseholdId },
      ip: input.ip,
    });

    return { ok: true, joinRequest: publicJoinRequest(row) };
  } catch (error) {
    const message = String((error as { message?: string })?.message ?? "");
    if (message.includes("household_join_requests_pending_uidx")) {
      return { ok: false, reason: "pending_exists" };
    }
    throw error;
  }
}

export async function listHouseholdJoinRequests(householdId: string) {
  const rows = await db
    .select({
      id: householdJoinRequests.id,
      requesterUserId: householdJoinRequests.requesterUserId,
      targetHouseholdId: householdJoinRequests.targetHouseholdId,
      requestedRole: householdJoinRequests.requestedRole,
      status: householdJoinRequests.status,
      createdAt: householdJoinRequests.createdAt,
      expiresAt: householdJoinRequests.expiresAt,
      resolvedAt: householdJoinRequests.resolvedAt,
      resolvedByMemberId: householdJoinRequests.resolvedByMemberId,
      requesterEmail: userAccounts.email,
      requesterDisplayName: userAccounts.displayName,
    })
    .from(householdJoinRequests)
    .innerJoin(
      userAccounts,
      eq(householdJoinRequests.requesterUserId, userAccounts.id),
    )
    .where(eq(householdJoinRequests.targetHouseholdId, householdId));

  return rows.map(publicJoinRequest);
}

export async function listMyJoinRequests(userId: string) {
  const rows = await db
    .select()
    .from(householdJoinRequests)
    .where(eq(householdJoinRequests.requesterUserId, userId));
  return rows.map(publicJoinRequest);
}

export async function approveJoinRequest(input: {
  membership: HouseholdMembershipContext;
  requestId: string;
  ip?: string;
}): Promise<
  | { ok: true; memberId: string }
  | {
      ok: false;
      reason:
        | "not_found"
        | "forbidden"
        | "not_pending"
        | "expired"
        | "requester_already_in_household"
        | "duplicate_membership";
    }
> {
  if (!can(input.membership.role, "members.invite")) {
    return { ok: false, reason: "forbidden" };
  }

  return db.transaction(async (tx) => {
    const rows = await tx
      .select()
      .from(householdJoinRequests)
      .where(
        and(
          eq(householdJoinRequests.id, input.requestId),
          eq(
            householdJoinRequests.targetHouseholdId,
            input.membership.householdId,
          ),
        ),
      )
      .for("update")
      .limit(1);

    const request = rows[0];
    if (!request) return { ok: false as const, reason: "not_found" as const };
    if (request.status !== "pending") {
      return { ok: false as const, reason: "not_pending" as const };
    }
    if (request.expiresAt <= new Date()) {
      await tx
        .update(householdJoinRequests)
        .set({ status: "expired", resolvedAt: new Date() })
        .where(eq(householdJoinRequests.id, request.id));
      return { ok: false as const, reason: "expired" as const };
    }

    const otherMembership = await tx
      .select({ id: householdMembers.id })
      .from(householdMembers)
      .where(
        and(
          eq(householdMembers.userId, request.requesterUserId),
          eq(householdMembers.status, "active"),
        ),
      )
      .limit(1);
    if (otherMembership[0]) {
      return {
        ok: false as const,
        reason: "requester_already_in_household" as const,
      };
    }

    const accounts = await tx
      .select({ displayName: userAccounts.displayName })
      .from(userAccounts)
      .where(eq(userAccounts.id, request.requesterUserId))
      .limit(1);

    const now = new Date();
    let memberId: string;
    try {
      const [member] = await tx
        .insert(householdMembers)
        .values({
          householdId: input.membership.householdId,
          userId: request.requesterUserId,
          displayName: accounts[0]?.displayName?.trim() || "Member",
          role: request.requestedRole,
          status: "active",
          joinedAt: now,
          updatedAt: now,
        })
        .returning({ id: householdMembers.id });
      memberId = member.id;
    } catch (error) {
      const message = String((error as { message?: string })?.message ?? "");
      if (message.includes("unique") || message.includes("uidx")) {
        return {
          ok: false as const,
          reason: "duplicate_membership" as const,
        };
      }
      throw error;
    }

    await tx
      .update(householdJoinRequests)
      .set({
        status: "approved",
        resolvedAt: now,
        resolvedByMemberId: input.membership.memberId,
      })
      .where(eq(householdJoinRequests.id, request.id));

    await writeAudit(
      {
        actorType: "user",
        actorId: input.membership.userId,
        action: "household.join_request.approved",
        resourceType: "household_join_request",
        resourceId: request.id,
        metaJson: {
          requesterUserId: request.requesterUserId,
          memberId,
        },
        ip: input.ip,
      },
      tx,
    );

    return { ok: true as const, memberId };
  });
}

export async function rejectJoinRequest(input: {
  membership: HouseholdMembershipContext;
  requestId: string;
  ip?: string;
}): Promise<
  | { ok: true }
  | { ok: false; reason: "not_found" | "forbidden" | "not_pending" }
> {
  if (!can(input.membership.role, "members.invite")) {
    return { ok: false, reason: "forbidden" };
  }

  const rows = await db
    .select()
    .from(householdJoinRequests)
    .where(
      and(
        eq(householdJoinRequests.id, input.requestId),
        eq(
          householdJoinRequests.targetHouseholdId,
          input.membership.householdId,
        ),
      ),
    )
    .limit(1);

  const request = rows[0];
  if (!request) return { ok: false, reason: "not_found" };
  if (request.status !== "pending") {
    return { ok: false, reason: "not_pending" };
  }

  const now = new Date();
  await db
    .update(householdJoinRequests)
    .set({
      status: "rejected",
      resolvedAt: now,
      resolvedByMemberId: input.membership.memberId,
    })
    .where(eq(householdJoinRequests.id, request.id));

  await writeAudit({
    actorType: "user",
    actorId: input.membership.userId,
    action: "household.join_request.rejected",
    resourceType: "household_join_request",
    resourceId: request.id,
    metaJson: { requesterUserId: request.requesterUserId },
    ip: input.ip,
  });

  return { ok: true };
}
