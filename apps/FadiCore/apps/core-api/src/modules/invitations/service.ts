import { and, eq, gt, isNull } from "drizzle-orm";
import { env, isDevTokenExposureEnabled } from "../../config.js";
import { db } from "../../db/client.js";
import {
  householdInvitations,
  householdMembers,
  households,
  userAccounts,
  type MemberRole,
} from "../../db/schema/index.js";
import { createInviteToken, writeAudit } from "../../lib/audit.js";
import { normalizeEmail } from "../../lib/email.js";
import { hashToken } from "../auth/crypto.js";
import type { HouseholdMembershipContext } from "../../middleware/requireHouseholdAccess.js";
import { ASSIGNABLE_MEMBER_ROLES } from "../../permissions/householdPermissions.js";

export function publicInvitation(row: {
  id: string;
  householdId: string;
  email: string;
  role: MemberRole;
  status: string;
  expiresAt: Date;
  acceptedAt: Date | null;
  createdAt: Date;
  invitedByUserId: string;
}) {
  return {
    id: row.id,
    householdId: row.householdId,
    email: row.email,
    role: row.role,
    status: row.status,
    expiresAt: row.expiresAt.toISOString(),
    acceptedAt: row.acceptedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    invitedByUserId: row.invitedByUserId,
  };
}

export async function createInvitation(input: {
  membership: HouseholdMembershipContext;
  email: string;
  role: MemberRole;
  ip?: string;
}): Promise<
  | {
      ok: true;
      invitation: ReturnType<typeof publicInvitation>;
      developmentOnlyToken?: string;
    }
  | {
      ok: false;
      reason:
        | "invalid_role"
        | "already_member"
        | "pending_invite_exists"
        | "household_not_found";
    }
> {
  if (!(ASSIGNABLE_MEMBER_ROLES as readonly string[]).includes(input.role)) {
    return { ok: false, reason: "invalid_role" };
  }

  const email = normalizeEmail(input.email);
  const householdRows = await db
    .select({ id: households.id })
    .from(households)
    .where(
      and(
        eq(households.id, input.membership.householdId),
        isNull(households.deletedAt),
      ),
    )
    .limit(1);
  if (!householdRows[0]) {
    return { ok: false, reason: "household_not_found" };
  }

  const existingUsers = await db
    .select({ id: userAccounts.id })
    .from(userAccounts)
    .where(eq(userAccounts.email, email))
    .limit(1);

  if (existingUsers[0]) {
    const activeMembership = await db
      .select({ id: householdMembers.id })
      .from(householdMembers)
      .where(
        and(
          eq(householdMembers.householdId, input.membership.householdId),
          eq(householdMembers.userId, existingUsers[0].id),
          eq(householdMembers.status, "active"),
        ),
      )
      .limit(1);
    if (activeMembership[0]) {
      return { ok: false, reason: "already_member" };
    }
  }

  const pending = await db
    .select({ id: householdInvitations.id })
    .from(householdInvitations)
    .where(
      and(
        eq(householdInvitations.householdId, input.membership.householdId),
        eq(householdInvitations.email, email),
        eq(householdInvitations.status, "pending"),
        gt(householdInvitations.expiresAt, new Date()),
      ),
    )
    .limit(1);
  if (pending[0]) {
    return { ok: false, reason: "pending_invite_exists" };
  }

  const plaintextToken = createInviteToken();
  const expiresAt = new Date(
    Date.now() + env.INVITE_TTL_HOURS * 60 * 60 * 1000,
  );

  const [invitation] = await db
    .insert(householdInvitations)
    .values({
      householdId: input.membership.householdId,
      email,
      invitedByUserId: input.membership.userId,
      role: input.role,
      tokenHash: hashToken(plaintextToken),
      status: "pending",
      expiresAt,
    })
    .returning();

  await writeAudit({
    actorType: "user",
    actorId: input.membership.userId,
    action: "household.invitation.created",
    resourceType: "household_invitation",
    resourceId: invitation.id,
    metaJson: { email, role: input.role },
    ip: input.ip,
  });

  return {
    ok: true,
    invitation: publicInvitation(invitation),
    ...(isDevTokenExposureEnabled()
      ? { developmentOnlyToken: plaintextToken }
      : {}),
  };
}

export async function listInvitations(householdId: string) {
  const rows = await db
    .select()
    .from(householdInvitations)
    .where(eq(householdInvitations.householdId, householdId));
  return rows.map(publicInvitation);
}

export async function revokeInvitation(input: {
  membership: HouseholdMembershipContext;
  invitationId: string;
  ip?: string;
}): Promise<{ ok: true } | { ok: false; reason: "not_found" | "not_pending" }> {
  const rows = await db
    .select()
    .from(householdInvitations)
    .where(
      and(
        eq(householdInvitations.id, input.invitationId),
        eq(householdInvitations.householdId, input.membership.householdId),
      ),
    )
    .limit(1);

  const invitation = rows[0];
  if (!invitation) return { ok: false, reason: "not_found" };
  if (invitation.status !== "pending") {
    return { ok: false, reason: "not_pending" };
  }

  await db
    .update(householdInvitations)
    .set({ status: "revoked" })
    .where(eq(householdInvitations.id, invitation.id));

  await writeAudit({
    actorType: "user",
    actorId: input.membership.userId,
    action: "household.invitation.revoked",
    resourceType: "household_invitation",
    resourceId: invitation.id,
    metaJson: { email: invitation.email },
    ip: input.ip,
  });

  return { ok: true };
}

export async function acceptInvitation(input: {
  token: string;
  userId: string;
  userEmail: string;
  ip?: string;
}): Promise<
  | { ok: true; householdId: string; memberId: string; role: MemberRole }
  | {
      ok: false;
      reason:
        | "invalid_token"
        | "expired"
        | "revoked"
        | "already_accepted"
        | "email_mismatch"
        | "already_member";
    }
> {
  const tokenHash = hashToken(input.token);
  const rows = await db
    .select()
    .from(householdInvitations)
    .where(eq(householdInvitations.tokenHash, tokenHash))
    .limit(1);

  const invitation = rows[0];
  if (!invitation) return { ok: false, reason: "invalid_token" };

  if (invitation.status === "revoked") {
    return { ok: false, reason: "revoked" };
  }
  if (invitation.status === "accepted") {
    return { ok: false, reason: "already_accepted" };
  }
  if (invitation.status === "expired" || invitation.expiresAt <= new Date()) {
    if (invitation.status === "pending") {
      await db
        .update(householdInvitations)
        .set({ status: "expired" })
        .where(eq(householdInvitations.id, invitation.id));
    }
    return { ok: false, reason: "expired" };
  }

  if (normalizeEmail(invitation.email) !== normalizeEmail(input.userEmail)) {
    return { ok: false, reason: "email_mismatch" };
  }

  const existing = await db
    .select({ id: householdMembers.id })
    .from(householdMembers)
    .where(
      and(
        eq(householdMembers.householdId, invitation.householdId),
        eq(householdMembers.userId, input.userId),
        eq(householdMembers.status, "active"),
      ),
    )
    .limit(1);
  if (existing[0]) {
    return { ok: false, reason: "already_member" };
  }

  const now = new Date();
  const accounts = await db
    .select({ displayName: userAccounts.displayName })
    .from(userAccounts)
    .where(eq(userAccounts.id, input.userId))
    .limit(1);

  const memberId = await db.transaction(async (tx) => {
    const [member] = await tx
      .insert(householdMembers)
      .values({
        householdId: invitation.householdId,
        userId: input.userId,
        displayName: accounts[0]?.displayName?.trim() || "Member",
        role: invitation.role,
        status: "active",
        joinedAt: now,
        updatedAt: now,
      })
      .returning({ id: householdMembers.id });

    await tx
      .update(householdInvitations)
      .set({ status: "accepted", acceptedAt: now })
      .where(eq(householdInvitations.id, invitation.id));

    return member.id;
  });

  await writeAudit({
    actorType: "user",
    actorId: input.userId,
    action: "household.invitation.accepted",
    resourceType: "household_invitation",
    resourceId: invitation.id,
    metaJson: {
      householdId: invitation.householdId,
      role: invitation.role,
    },
    ip: input.ip,
  });

  return {
    ok: true,
    householdId: invitation.householdId,
    memberId,
    role: invitation.role,
  };
}
