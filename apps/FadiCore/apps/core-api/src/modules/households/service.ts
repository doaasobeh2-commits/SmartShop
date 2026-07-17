import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import {
  householdAddresses,
  householdMembers,
  households,
  userAccounts,
  type MemberRole,
} from "../../db/schema/index.js";
import { createPublicAlias, writeAudit } from "../../lib/audit.js";
import {
  normalizeAddress,
  type AddressInput,
} from "../../lib/addressNormalize.js";
import type { HouseholdMembershipContext } from "../../middleware/requireHouseholdAccess.js";
import { loadActiveMembershipForUser } from "../../middleware/requireHouseholdAccess.js";

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
  userId: string | null;
  role: MemberRole;
  status: string;
  joinedAt: Date | null;
  email?: string | null;
  displayName?: string | null;
  preferredLocale?: string | null;
  createdByMemberId?: string | null;
  linkedAccount?: boolean;
}) {
  const linkedAccount =
    row.linkedAccount ?? (row.userId !== null && row.userId !== undefined);
  return {
    id: row.id,
    householdId: row.householdId,
    userId: row.userId,
    role: row.role,
    status: row.status,
    joinedAt: row.joinedAt?.toISOString() ?? null,
    email: row.email ?? null,
    displayName: row.displayName ?? "Member",
    preferredLocale: row.preferredLocale ?? null,
    createdByMemberId: row.createdByMemberId ?? null,
    linkedAccount,
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
      displayName: sql<string>`coalesce(nullif(${householdMembers.displayName}, ''), ${userAccounts.displayName}, 'Member')`,
      preferredLocale: householdMembers.preferredLocale,
      createdByMemberId: householdMembers.createdByMemberId,
    })
    .from(householdMembers)
    .leftJoin(userAccounts, eq(householdMembers.userId, userAccounts.id))
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

    let email: string | null = null;
    let accountDisplayName: string | null = null;
    if (target.userId) {
      const accounts = await tx
        .select({
          email: userAccounts.email,
          displayName: userAccounts.displayName,
        })
        .from(userAccounts)
        .where(eq(userAccounts.id, target.userId))
        .limit(1);
      email = accounts[0]?.email ?? null;
      accountDisplayName = accounts[0]?.displayName ?? null;
    }

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
        email,
        displayName: target.displayName || accountDisplayName || "Member",
        preferredLocale: target.preferredLocale,
        createdByMemberId: target.createdByMemberId,
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

export async function createHouseholdWithAddress(input: {
  userId: string;
  displayName: string;
  name: string;
  preferredLocale?: string;
  address: AddressInput;
  ip?: string;
}): Promise<
  | {
      ok: true;
      household: ReturnType<typeof publicHousehold>;
      memberId: string;
    }
  | {
      ok: false;
      reason: "already_in_household" | "invalid_address";
    }
> {
  const existing = await loadActiveMembershipForUser(input.userId);
  if (existing) {
    return { ok: false, reason: "already_in_household" };
  }

  const country = input.address.countryCode?.trim() ?? "";
  if (country.length !== 2) {
    return { ok: false, reason: "invalid_address" };
  }

  const normalized = normalizeAddress(input.address);
  if (
    !normalized.postalCode ||
    !normalized.city ||
    !normalized.street ||
    !normalized.houseNumber
  ) {
    return { ok: false, reason: "invalid_address" };
  }

  const now = new Date();
  const locale = input.preferredLocale?.trim() || "en";

  const result = await db.transaction(async (tx) => {
    const [household] = await tx
      .insert(households)
      .values({
        publicAlias: createPublicAlias(),
        name: input.name.trim().slice(0, 120),
        ownerUserId: input.userId,
        preferredLocale: locale,
        updatedAt: now,
      })
      .returning();

    const [member] = await tx
      .insert(householdMembers)
      .values({
        householdId: household.id,
        userId: input.userId,
        displayName: input.displayName,
        preferredLocale: locale,
        role: "owner",
        status: "active",
        joinedAt: now,
        updatedAt: now,
      })
      .returning({ id: householdMembers.id });

    await tx.insert(householdAddresses).values({
      householdId: household.id,
      countryCode: normalized.countryCode,
      postalCode: normalized.postalCode,
      city: normalized.city,
      street: normalized.street,
      houseNumber: normalized.houseNumber,
      unit: normalized.unit,
      normalizedAddressHash: normalized.normalizedAddressHash,
      isPrimary: true,
      createdAt: now,
      updatedAt: now,
    });

    return { household, memberId: member.id };
  });

  await writeAudit({
    actorType: "user",
    actorId: input.userId,
    action: "household.created",
    resourceType: "household",
    resourceId: result.household.id,
    metaJson: {
      ownerUserId: input.userId,
      countryCode: normalized.countryCode,
      city: normalized.city,
    },
    ip: input.ip,
  });

  return {
    ok: true,
    household: publicHousehold(result.household),
    memberId: result.memberId,
  };
}
