import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../db/client.js";
import {
  householdMembers,
  households,
  userAccounts,
  type MemberRole,
} from "../../db/schema/index.js";
import { writeAudit } from "../../lib/audit.js";
import type { HouseholdMembershipContext } from "../../middleware/requireHouseholdAccess.js";

export function publicHousehold(row: {
  id: string;
  publicAlias: string;
  name: string;
  ownerUserId: string | null;
  preferredLocale: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    publicAlias: row.publicAlias,
    name: row.name,
    ownerUserId: row.ownerUserId,
    preferredLocale: row.preferredLocale,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function publicMember(row: {
  id: string;
  householdId: string;
  userId: string;
  role: MemberRole;
  status: string;
  joinedAt: Date | null;
  email?: string;
  displayName?: string;
}) {
  return {
    id: row.id,
    householdId: row.householdId,
    userId: row.userId,
    role: row.role,
    status: row.status,
    joinedAt: row.joinedAt?.toISOString() ?? null,
    email: row.email,
    displayName: row.displayName,
  };
}

export async function getCurrentHousehold(membership: HouseholdMembershipContext) {
  const rows = await db
    .select()
    .from(households)
    .where(
      and(
        eq(households.id, membership.householdId),
        isNull(households.deletedAt),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function updateCurrentHousehold(
  membership: HouseholdMembershipContext,
  input: { name?: string; preferredLocale?: string },
  ip?: string,
) {
  const now = new Date();
  const [updated] = await db
    .update(households)
    .set({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.preferredLocale !== undefined
        ? { preferredLocale: input.preferredLocale }
        : {}),
      updatedAt: now,
    })
    .where(eq(households.id, membership.householdId))
    .returning();

  await writeAudit({
    actorType: "user",
    actorId: membership.userId,
    action: "household.updated",
    resourceType: "household",
    resourceId: membership.householdId,
    metaJson: {
      name: input.name,
      preferredLocale: input.preferredLocale,
    },
    ip,
  });

  return updated;
}

export async function listCurrentMembers(householdId: string) {
  return db
    .select({
      id: householdMembers.id,
      householdId: householdMembers.householdId,
      userId: householdMembers.userId,
      role: householdMembers.role,
      status: householdMembers.status,
      joinedAt: householdMembers.joinedAt,
      email: userAccounts.email,
      displayName: userAccounts.displayName,
    })
    .from(householdMembers)
    .innerJoin(userAccounts, eq(householdMembers.userId, userAccounts.id))
    .where(
      and(
        eq(householdMembers.householdId, householdId),
        eq(householdMembers.status, "active"),
      ),
    );
}

export async function changeMemberRole(input: {
  membership: HouseholdMembershipContext;
  memberId: string;
  newRole: MemberRole;
  ip?: string;
}): Promise<
  | { ok: true; member: Awaited<ReturnType<typeof listCurrentMembers>>[number] }
  | {
      ok: false;
      reason:
        | "not_found"
        | "cannot_demote_owner"
        | "cannot_assign_owner"
        | "target_is_owner";
    }
> {
  if (input.newRole === "owner") {
    return { ok: false, reason: "cannot_assign_owner" };
  }

  return db.transaction(async (tx) => {
    const locked = await tx
      .select()
      .from(householdMembers)
      .where(
        and(
          eq(householdMembers.id, input.memberId),
          eq(householdMembers.householdId, input.membership.householdId),
          eq(householdMembers.status, "active"),
        ),
      )
      .for("update")
      .limit(1);

    const target = locked[0];
    if (!target) return { ok: false as const, reason: "not_found" as const };
    if (target.role === "owner") {
      return { ok: false as const, reason: "cannot_demote_owner" as const };
    }

    const accounts = await tx
      .select({
        email: userAccounts.email,
        displayName: userAccounts.displayName,
      })
      .from(userAccounts)
      .where(eq(userAccounts.id, target.userId))
      .limit(1);

    const now = new Date();
    await tx
      .update(householdMembers)
      .set({ role: input.newRole, updatedAt: now })
      .where(
        and(
          eq(householdMembers.id, target.id),
          eq(householdMembers.role, target.role),
        ),
      );

    await writeAudit(
      {
        actorType: "user",
        actorId: input.membership.userId,
        action: "household.member.role_changed",
        resourceType: "household_member",
        resourceId: target.id,
        metaJson: {
          from: target.role,
          to: input.newRole,
          householdId: input.membership.householdId,
        },
        ip: input.ip,
      },
      tx,
    );

    return {
      ok: true as const,
      member: {
        id: target.id,
        householdId: target.householdId,
        userId: target.userId,
        role: input.newRole,
        status: target.status,
        joinedAt: target.joinedAt,
        email: accounts[0]?.email,
        displayName: accounts[0]?.displayName,
      },
    };
  });
}
export async function removeMember(input: {
  membership: HouseholdMembershipContext;
  memberId: string;
  ip?: string;
}): Promise<
  | { ok: true }
  | { ok: false; reason: "not_found" | "cannot_remove_owner" }
> {
  return db.transaction(async (tx) => {
    const targets = await tx
      .select()
      .from(householdMembers)
      .where(
        and(
          eq(householdMembers.id, input.memberId),
          eq(householdMembers.householdId, input.membership.householdId),
          eq(householdMembers.status, "active"),
        ),
      )
      .for("update")
      .limit(1);

    const target = targets[0];
    if (!target) return { ok: false as const, reason: "not_found" as const };
    if (target.role === "owner") {
      return { ok: false as const, reason: "cannot_remove_owner" as const };
    }

    const now = new Date();
    await tx
      .update(householdMembers)
      .set({ status: "removed", updatedAt: now })
      .where(
        and(
          eq(householdMembers.id, target.id),
          eq(householdMembers.status, "active"),
        ),
      );

    await writeAudit(
      {
        actorType: "user",
        actorId: input.membership.userId,
        action: "household.member.removed",
        resourceType: "household_member",
        resourceId: target.id,
        metaJson: {
          removedUserId: target.userId,
          householdId: input.membership.householdId,
        },
        ip: input.ip,
      },
      tx,
    );

    return { ok: true as const };
  });
}
