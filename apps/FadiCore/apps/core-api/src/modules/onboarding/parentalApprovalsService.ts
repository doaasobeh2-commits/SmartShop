import { and, eq, ne } from "drizzle-orm";
import { env } from "../../config.js";
import { db } from "../../db/client.js";
import {
  householdMembers,
  memberAppEnrollments,
  parentalApprovals,
  userAccounts,
} from "../../db/schema/index.js";
import { writeAudit } from "../../lib/audit.js";
import { normalizeEmail } from "../../lib/email.js";
import type { HouseholdMembershipContext } from "../../middleware/requireHouseholdAccess.js";
import { loadActiveMembershipForUser } from "../../middleware/requireHouseholdAccess.js";
import { can } from "../../permissions/householdPermissions.js";
import {
  ageFromDob,
  canAccessFitnessIndependent,
  requiresParentalApprovalForFitness,
} from "../../policy/productAccessPolicy.js";

export function publicParentalApproval(row: {
  id: string;
  householdMemberId: string;
  applicationKey: string;
  status: string;
  approvedByMemberId: string | null;
  requesterUserId: string | null;
  parentEmailNormalized?: string | null;
  approvedAt: Date | null;
  revokedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  requesterEmail?: string | null;
  requesterDisplayName?: string | null;
  memberDisplayName?: string | null;
}) {
  return {
    id: row.id,
    householdMemberId: row.householdMemberId,
    applicationKey: row.applicationKey,
    status: row.status,
    approvedByMemberId: row.approvedByMemberId,
    requesterUserId: row.requesterUserId,
    approvedAt: row.approvedAt?.toISOString() ?? null,
    revokedAt: row.revokedAt?.toISOString() ?? null,
    expiresAt: row.expiresAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    ...(row.requesterEmail !== undefined
      ? {
          requesterEmail: row.requesterEmail ?? null,
          requesterDisplayName: row.requesterDisplayName ?? null,
          memberDisplayName: row.memberDisplayName ?? null,
        }
      : {}),
  };
}

/**
 * Teen (14–17) requests parental approval for Fitness.
 * Always returns a generic pending response when age-eligible,
 * even if the parent email is unknown (anti-enumeration).
 */
export async function requestFitnessParentalApproval(input: {
  userId: string;
  parentEmail: string;
  ip?: string;
}): Promise<
  | { ok: true; status: "pending_or_queued" }
  | { ok: false; reason: "age_policy_blocked" | "missing_date_of_birth" }
> {
  const users = await db
    .select({
      id: userAccounts.id,
      displayName: userAccounts.displayName,
      dateOfBirth: userAccounts.dateOfBirth,
    })
    .from(userAccounts)
    .where(eq(userAccounts.id, input.userId))
    .limit(1);

  const user = users[0];
  if (!user?.dateOfBirth) {
    return { ok: false, reason: "missing_date_of_birth" };
  }

  const age = ageFromDob(user.dateOfBirth);
  if (age < 14 || canAccessFitnessIndependent(age)) {
    return { ok: false, reason: "age_policy_blocked" };
  }
  if (!requiresParentalApprovalForFitness(age)) {
    return { ok: false, reason: "age_policy_blocked" };
  }

  const parentEmail = normalizeEmail(input.parentEmail);
  const parents = await db
    .select({ id: userAccounts.id, displayName: userAccounts.displayName })
    .from(userAccounts)
    .where(eq(userAccounts.email, parentEmail))
    .limit(1);

  const parent = parents[0];
  if (parent) {
    const parentMembership = await loadActiveMembershipForUser(parent.id);
    if (parentMembership && can(parentMembership.role, "members.create_managed")) {
      const teenMembership = await loadActiveMembershipForUser(input.userId);
      if (!teenMembership) {
        const now = new Date();
        const expiresAt = new Date(
          now.getTime() + env.JOIN_TTL_HOURS * 60 * 60 * 1000,
        );

        await db.transaction(async (tx) => {
          const existingApproval = await tx
            .select({ id: parentalApprovals.id })
            .from(parentalApprovals)
            .innerJoin(
              householdMembers,
              eq(parentalApprovals.householdMemberId, householdMembers.id),
            )
            .where(
              and(
                eq(parentalApprovals.requesterUserId, input.userId),
                eq(parentalApprovals.applicationKey, "fitness"),
                eq(householdMembers.householdId, parentMembership.householdId),
                eq(parentalApprovals.status, "pending"),
              ),
            )
            .limit(1);

          if (existingApproval[0]) return;

          const [member] = await tx
            .insert(householdMembers)
            .values({
              householdId: parentMembership.householdId,
              userId: null,
              displayName: user.displayName,
              role: "teen",
              status: "active",
              createdByMemberId: parentMembership.memberId,
              joinedAt: null,
              updatedAt: now,
            })
            .returning({ id: householdMembers.id });

          await tx.insert(parentalApprovals).values({
            householdMemberId: member.id,
            applicationKey: "fitness",
            status: "pending",
            requesterUserId: input.userId,
            parentEmailNormalized: parentEmail,
            expiresAt,
            createdAt: now,
            updatedAt: now,
          });
        });

        await writeAudit({
          actorType: "user",
          actorId: input.userId,
          action: "parental_approval.requested",
          resourceType: "parental_approval",
          resourceId: parentMembership.householdId,
          metaJson: { applicationKey: "fitness" },
          ip: input.ip,
        });
      }
    }
  }

  return { ok: true, status: "pending_or_queued" };
}

export async function listHouseholdParentalApprovals(householdId: string) {
  const rows = await db
    .select({
      id: parentalApprovals.id,
      householdMemberId: parentalApprovals.householdMemberId,
      applicationKey: parentalApprovals.applicationKey,
      status: parentalApprovals.status,
      approvedByMemberId: parentalApprovals.approvedByMemberId,
      requesterUserId: parentalApprovals.requesterUserId,
      approvedAt: parentalApprovals.approvedAt,
      revokedAt: parentalApprovals.revokedAt,
      expiresAt: parentalApprovals.expiresAt,
      createdAt: parentalApprovals.createdAt,
      updatedAt: parentalApprovals.updatedAt,
      requesterEmail: userAccounts.email,
      requesterDisplayName: userAccounts.displayName,
      memberDisplayName: householdMembers.displayName,
    })
    .from(parentalApprovals)
    .innerJoin(
      householdMembers,
      eq(parentalApprovals.householdMemberId, householdMembers.id),
    )
    .leftJoin(
      userAccounts,
      eq(parentalApprovals.requesterUserId, userAccounts.id),
    )
    .where(eq(householdMembers.householdId, householdId));

  return rows.map(publicParentalApproval);
}

export async function approveParentalApproval(input: {
  membership: HouseholdMembershipContext;
  approvalId: string;
  ip?: string;
}): Promise<
  | { ok: true }
  | {
      ok: false;
      reason:
        | "not_found"
        | "forbidden"
        | "not_pending"
        | "self_approve_forbidden"
        | "requester_already_in_household";
    }
> {
  if (!can(input.membership.role, "members.create_managed")) {
    return { ok: false, reason: "forbidden" };
  }

  return db.transaction(async (tx) => {
    const approvalRows = await tx
      .select()
      .from(parentalApprovals)
      .where(eq(parentalApprovals.id, input.approvalId))
      .for("update")
      .limit(1);

    const approval = approvalRows[0];
    if (!approval) {
      return { ok: false as const, reason: "not_found" as const };
    }

    const memberRows = await tx
      .select()
      .from(householdMembers)
      .where(eq(householdMembers.id, approval.householdMemberId))
      .limit(1);
    const member = memberRows[0];
    if (!member || member.householdId !== input.membership.householdId) {
      return { ok: false as const, reason: "not_found" as const };
    }
    if (approval.status !== "pending") {
      return { ok: false as const, reason: "not_pending" as const };
    }
    if (
      approval.requesterUserId &&
      approval.requesterUserId === input.membership.userId
    ) {
      return { ok: false as const, reason: "self_approve_forbidden" as const };
    }

    const now = new Date();
    const requesterId = approval.requesterUserId;

    if (requesterId) {
      const other = await tx
        .select({ id: householdMembers.id })
        .from(householdMembers)
        .where(
          and(
            eq(householdMembers.userId, requesterId),
            eq(householdMembers.status, "active"),
            ne(householdMembers.id, member.id),
          ),
        )
        .limit(1);
      if (other[0]) {
        return {
          ok: false as const,
          reason: "requester_already_in_household" as const,
        };
      }

      if (member.userId === null) {
        await tx
          .update(householdMembers)
          .set({
            userId: requesterId,
            joinedAt: member.joinedAt ?? now,
            updatedAt: now,
          })
          .where(eq(householdMembers.id, member.id));
      }
    }

    await tx
      .update(parentalApprovals)
      .set({
        status: "approved",
        approvedByMemberId: input.membership.memberId,
        approvedAt: now,
        updatedAt: now,
      })
      .where(eq(parentalApprovals.id, approval.id));

    if (approval.applicationKey === "fitness") {
      const existing = await tx
        .select({ id: memberAppEnrollments.id })
        .from(memberAppEnrollments)
        .where(
          and(
            eq(memberAppEnrollments.householdMemberId, member.id),
            eq(memberAppEnrollments.applicationKey, "fitness"),
          ),
        )
        .limit(1);

      if (!existing[0]) {
        await tx.insert(memberAppEnrollments).values({
          householdMemberId: member.id,
          applicationKey: "fitness",
          status: "active",
          enrolledAt: now,
          enrolledByMemberId: input.membership.memberId,
          updatedAt: now,
        });
      } else {
        await tx
          .update(memberAppEnrollments)
          .set({ status: "active", updatedAt: now })
          .where(eq(memberAppEnrollments.id, existing[0].id));
      }
    }

    await writeAudit(
      {
        actorType: "user",
        actorId: input.membership.userId,
        action: "parental_approval.approved",
        resourceType: "parental_approval",
        resourceId: approval.id,
        metaJson: { applicationKey: approval.applicationKey },
        ip: input.ip,
      },
      tx,
    );

    return { ok: true as const };
  });
}

export async function revokeParentalApproval(input: {
  membership: HouseholdMembershipContext;
  approvalId: string;
  ip?: string;
}): Promise<
  | { ok: true }
  | { ok: false; reason: "not_found" | "forbidden" | "not_active" }
> {
  if (!can(input.membership.role, "members.create_managed")) {
    return { ok: false, reason: "forbidden" };
  }

  const rows = await db
    .select({
      approval: parentalApprovals,
      memberHouseholdId: householdMembers.householdId,
    })
    .from(parentalApprovals)
    .innerJoin(
      householdMembers,
      eq(parentalApprovals.householdMemberId, householdMembers.id),
    )
    .where(eq(parentalApprovals.id, input.approvalId))
    .limit(1);

  const row = rows[0];
  if (!row || row.memberHouseholdId !== input.membership.householdId) {
    return { ok: false, reason: "not_found" };
  }
  if (row.approval.status !== "pending" && row.approval.status !== "approved") {
    return { ok: false, reason: "not_active" };
  }

  const now = new Date();
  await db
    .update(parentalApprovals)
    .set({
      status: "revoked",
      revokedAt: now,
      updatedAt: now,
    })
    .where(eq(parentalApprovals.id, row.approval.id));

  if (row.approval.applicationKey === "fitness") {
    await db
      .update(memberAppEnrollments)
      .set({ status: "suspended", updatedAt: now })
      .where(
        and(
          eq(
            memberAppEnrollments.householdMemberId,
            row.approval.householdMemberId,
          ),
          eq(memberAppEnrollments.applicationKey, "fitness"),
        ),
      );
  }

  await writeAudit({
    actorType: "user",
    actorId: input.membership.userId,
    action: "parental_approval.revoked",
    resourceType: "parental_approval",
    resourceId: row.approval.id,
    metaJson: { applicationKey: row.approval.applicationKey },
    ip: input.ip,
  });

  return { ok: true };
}

export async function hasActiveParentalApproval(input: {
  memberId: string;
  applicationKey: string;
}): Promise<boolean> {
  const rows = await db
    .select({ id: parentalApprovals.id })
    .from(parentalApprovals)
    .where(
      and(
        eq(parentalApprovals.householdMemberId, input.memberId),
        eq(parentalApprovals.applicationKey, input.applicationKey as never),
        eq(parentalApprovals.status, "approved"),
      ),
    )
    .limit(1);
  return Boolean(rows[0]);
}
