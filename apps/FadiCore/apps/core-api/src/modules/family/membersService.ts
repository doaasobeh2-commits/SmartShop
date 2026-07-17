import { and, eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import {
  householdMembers,
  userAccounts,
  type MemberRole,
} from "../../db/schema/index.js";
import { writeAudit } from "../../lib/audit.js";
import type { HouseholdMembershipContext } from "../../middleware/requireHouseholdAccess.js";
import {
  can,
  isMinorRole,
  MANAGED_MEMBER_ROLES,
} from "../../permissions/householdPermissions.js";
import { publicMember } from "../households/service.js";

export async function createManagedMember(input: {
  membership: HouseholdMembershipContext;
  displayName: string;
  role: MemberRole;
  preferredLocale?: string;
  ip?: string;
}): Promise<
  | { ok: true; member: ReturnType<typeof publicMember> }
  | {
      ok: false;
      reason: "forbidden" | "invalid_role";
    }
> {
  if (!(MANAGED_MEMBER_ROLES as readonly string[]).includes(input.role)) {
    return { ok: false, reason: "invalid_role" };
  }
  if (!can(input.membership.role, "members.create_managed")) {
    return { ok: false, reason: "forbidden" };
  }

  const now = new Date();
  const [row] = await db
    .insert(householdMembers)
    .values({
      householdId: input.membership.householdId,
      userId: null,
      displayName: input.displayName.trim().slice(0, 120) || "Member",
      preferredLocale: input.preferredLocale?.trim() || null,
      role: input.role,
      status: "active",
      createdByMemberId: input.membership.memberId,
      joinedAt: now,
      updatedAt: now,
    })
    .returning();

  await writeAudit({
    actorType: "user",
    actorId: input.membership.userId,
    action: "household.member.managed_created",
    resourceType: "household_member",
    resourceId: row.id,
    metaJson: {
      role: input.role,
      householdId: input.membership.householdId,
    },
    ip: input.ip,
  });

  return {
    ok: true,
    member: publicMember({
      id: row.id,
      householdId: row.householdId,
      userId: row.userId,
      role: row.role,
      status: row.status,
      joinedAt: row.joinedAt,
      displayName: row.displayName,
      preferredLocale: row.preferredLocale,
      createdByMemberId: row.createdByMemberId,
      linkedAccount: false,
    }),
  };
}

export async function updateMemberProfile(input: {
  membership: HouseholdMembershipContext;
  memberId: string;
  displayName?: string;
  preferredLocale?: string | null;
  ip?: string;
}): Promise<
  | { ok: true; member: ReturnType<typeof publicMember> }
  | {
      ok: false;
      reason: "not_found" | "forbidden" | "not_managed";
    }
> {
  if (!can(input.membership.role, "members.create_managed")) {
    return { ok: false, reason: "forbidden" };
  }

  const targets = await db
    .select()
    .from(householdMembers)
    .where(
      and(
        eq(householdMembers.id, input.memberId),
        eq(householdMembers.householdId, input.membership.householdId),
        eq(householdMembers.status, "active"),
      ),
    )
    .limit(1);

  const target = targets[0];
  if (!target) return { ok: false, reason: "not_found" };
  if (target.userId !== null) {
    return { ok: false, reason: "not_managed" };
  }

  const now = new Date();
  const [updated] = await db
    .update(householdMembers)
    .set({
      ...(input.displayName !== undefined
        ? { displayName: input.displayName.trim().slice(0, 120) || "Member" }
        : {}),
      ...(input.preferredLocale !== undefined
        ? {
            preferredLocale: input.preferredLocale
              ? input.preferredLocale.trim()
              : null,
          }
        : {}),
      updatedAt: now,
    })
    .where(eq(householdMembers.id, target.id))
    .returning();

  await writeAudit({
    actorType: "user",
    actorId: input.membership.userId,
    action: "household.member.managed_updated",
    resourceType: "household_member",
    resourceId: target.id,
    metaJson: {
      displayName: input.displayName,
      preferredLocale: input.preferredLocale,
      householdId: input.membership.householdId,
    },
    ip: input.ip,
  });

  return {
    ok: true,
    member: publicMember({
      id: updated.id,
      householdId: updated.householdId,
      userId: updated.userId,
      role: updated.role,
      status: updated.status,
      joinedAt: updated.joinedAt,
      displayName: updated.displayName,
      preferredLocale: updated.preferredLocale,
      createdByMemberId: updated.createdByMemberId,
      linkedAccount: false,
    }),
  };
}

/** Whether an actor may manage enrollments for a target member. */
export function canManageEnrollmentsForTarget(
  actorRole: MemberRole,
  targetRole: MemberRole,
): boolean {
  if (actorRole === "owner") return true;
  if (actorRole === "adult" && isMinorRole(targetRole)) {
    return can(actorRole, "enrollments.manage");
  }
  return false;
}

export async function loadMemberInHousehold(
  householdId: string,
  memberId: string,
) {
  const rows = await db
    .select({
      id: householdMembers.id,
      householdId: householdMembers.householdId,
      userId: householdMembers.userId,
      role: householdMembers.role,
      status: householdMembers.status,
      displayName: householdMembers.displayName,
      preferredLocale: householdMembers.preferredLocale,
      createdByMemberId: householdMembers.createdByMemberId,
      joinedAt: householdMembers.joinedAt,
      email: userAccounts.email,
      accountDisplayName: userAccounts.displayName,
    })
    .from(householdMembers)
    .leftJoin(userAccounts, eq(householdMembers.userId, userAccounts.id))
    .where(
      and(
        eq(householdMembers.id, memberId),
        eq(householdMembers.householdId, householdId),
        eq(householdMembers.status, "active"),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}
