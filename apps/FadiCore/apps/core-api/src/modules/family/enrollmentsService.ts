import { and, eq, inArray } from "drizzle-orm";
import { db } from "../../db/client.js";
import {
  householdMembers,
  memberAppEnrollments,
  platformApplications,
  userAccounts,
  type EnrollmentStatus,
  type MemberRole,
  type PlatformApplicationKey,
} from "../../db/schema/index.js";
import { writeAudit } from "../../lib/audit.js";
import type { HouseholdMembershipContext } from "../../middleware/requireHouseholdAccess.js";
import { can } from "../../permissions/householdPermissions.js";
import {
  ageFromDob,
  evaluateAppEnrollment,
} from "../../policy/productAccessPolicy.js";
import {
  canManageEnrollmentsForTarget,
  loadMemberInHousehold,
} from "./membersService.js";
import { hasActiveParentalApproval } from "../onboarding/parentalApprovalsService.js";

export function publicEnrollment(row: {
  id: string;
  householdMemberId: string;
  applicationKey: PlatformApplicationKey | string;
  status: EnrollmentStatus | string;
  enrolledAt: Date;
  enrolledByMemberId: string | null;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    householdMemberId: row.householdMemberId,
    applicationKey: row.applicationKey,
    status: row.status,
    enrolledAt: row.enrolledAt.toISOString(),
    enrolledByMemberId: row.enrolledByMemberId,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listPlatformApplications() {
  const rows = await db
    .select({
      key: platformApplications.key,
      name: platformApplications.name,
      status: platformApplications.status,
      scope: platformApplications.scope,
      createdAt: platformApplications.createdAt,
    })
    .from(platformApplications)
    .orderBy(platformApplications.key);

  return rows.map((r) => ({
    key: r.key,
    name: r.name,
    status: r.status,
    scope: r.scope,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function listHouseholdEnrollments(householdId: string) {
  const rows = await db
    .select({
      id: memberAppEnrollments.id,
      householdMemberId: memberAppEnrollments.householdMemberId,
      applicationKey: memberAppEnrollments.applicationKey,
      status: memberAppEnrollments.status,
      enrolledAt: memberAppEnrollments.enrolledAt,
      enrolledByMemberId: memberAppEnrollments.enrolledByMemberId,
      updatedAt: memberAppEnrollments.updatedAt,
    })
    .from(memberAppEnrollments)
    .innerJoin(
      householdMembers,
      eq(memberAppEnrollments.householdMemberId, householdMembers.id),
    )
    .where(eq(householdMembers.householdId, householdId));

  return rows.map(publicEnrollment);
}

export async function listMemberEnrollments(input: {
  householdId: string;
  memberId: string;
}): Promise<
  | { ok: true; enrollments: ReturnType<typeof publicEnrollment>[] }
  | { ok: false; reason: "not_found" }
> {
  const member = await loadMemberInHousehold(input.householdId, input.memberId);
  if (!member) return { ok: false, reason: "not_found" };

  const rows = await db
    .select()
    .from(memberAppEnrollments)
    .where(eq(memberAppEnrollments.householdMemberId, input.memberId));

  return { ok: true, enrollments: rows.map(publicEnrollment) };
}

export async function listActiveEnrollmentsForMember(memberId: string) {
  const rows = await db
    .select({
      applicationKey: memberAppEnrollments.applicationKey,
      status: memberAppEnrollments.status,
    })
    .from(memberAppEnrollments)
    .where(
      and(
        eq(memberAppEnrollments.householdMemberId, memberId),
        eq(memberAppEnrollments.status, "active"),
      ),
    );

  return rows.map((r) => ({
    applicationKey: r.applicationKey,
    status: r.status,
  }));
}

function inferAgeForEnrollment(input: {
  dateOfBirth: string | null;
  role: MemberRole;
}): number | null {
  if (input.dateOfBirth) {
    return ageFromDob(input.dateOfBirth);
  }
  // Managed profiles without DOB: role heuristics for policy checks.
  if (input.role === "child") return 10;
  if (input.role === "teen") return 15;
  if (input.role === "owner" || input.role === "adult" || input.role === "caregiver") {
    return 30;
  }
  return null;
}

export async function createEnrollment(input: {
  membership: HouseholdMembershipContext;
  memberId: string;
  applicationKey: PlatformApplicationKey;
  status?: EnrollmentStatus;
  ip?: string;
}): Promise<
  | { ok: true; enrollment: ReturnType<typeof publicEnrollment> }
  | {
      ok: false;
      reason:
        | "not_found"
        | "forbidden"
        | "invalid_application"
        | "duplicate_enrollment"
        | "age_policy_blocked"
        | "parental_approval_required";
    }
> {
  if (!can(input.membership.role, "enrollments.manage")) {
    return { ok: false, reason: "forbidden" };
  }

  const target = await loadMemberInHousehold(
    input.membership.householdId,
    input.memberId,
  );
  if (!target) return { ok: false, reason: "not_found" };

  if (!canManageEnrollmentsForTarget(input.membership.role, target.role)) {
    return { ok: false, reason: "forbidden" };
  }

  const apps = await db
    .select({
      key: platformApplications.key,
      scope: platformApplications.scope,
    })
    .from(platformApplications)
    .where(eq(platformApplications.key, input.applicationKey))
    .limit(1);
  if (!apps[0]) {
    return { ok: false, reason: "invalid_application" };
  }

  let dateOfBirth: string | null = null;
  if (target.userId) {
    const accounts = await db
      .select({ dateOfBirth: userAccounts.dateOfBirth })
      .from(userAccounts)
      .where(eq(userAccounts.id, target.userId))
      .limit(1);
    dateOfBirth = accounts[0]?.dateOfBirth ?? null;
  }

  const appScope = apps[0].scope;

  if (appScope === "member" || input.applicationKey === "fitness") {
    const age = inferAgeForEnrollment({
      dateOfBirth,
      role: target.role,
    });
    if (age !== null) {
      const parentalApprovalActive = await hasActiveParentalApproval({
        memberId: input.memberId,
        applicationKey: input.applicationKey,
      });
      const decision = evaluateAppEnrollment({
        applicationKey: input.applicationKey,
        age,
        parentalApprovalActive,
      });
      if (!decision.allowed) {
        return { ok: false, reason: decision.reason };
      }
    }
  } else {
    // Household-scoped apps (recipe, smart_shop): gate the managing actor, not minors being enrolled.
    const actorAccounts = await db
      .select({ dateOfBirth: userAccounts.dateOfBirth })
      .from(userAccounts)
      .where(eq(userAccounts.id, input.membership.userId))
      .limit(1);
    const actorAge = actorAccounts[0]?.dateOfBirth
      ? ageFromDob(actorAccounts[0].dateOfBirth)
      : inferAgeForEnrollment({
          dateOfBirth: null,
          role: input.membership.role,
        });
    if (actorAge !== null) {
      const decision = evaluateAppEnrollment({
        applicationKey: input.applicationKey,
        age: actorAge,
        parentalApprovalActive: false,
      });
      if (!decision.allowed) {
        return { ok: false, reason: decision.reason };
      }
    }
  }

  const existing = await db
    .select({ id: memberAppEnrollments.id })
    .from(memberAppEnrollments)
    .where(
      and(
        eq(memberAppEnrollments.householdMemberId, input.memberId),
        eq(memberAppEnrollments.applicationKey, input.applicationKey),
      ),
    )
    .limit(1);
  if (existing[0]) {
    return { ok: false, reason: "duplicate_enrollment" };
  }

  const status = input.status ?? "active";
  const now = new Date();

  try {
    const [row] = await db
      .insert(memberAppEnrollments)
      .values({
        householdMemberId: input.memberId,
        applicationKey: input.applicationKey,
        status,
        enrolledAt: now,
        enrolledByMemberId: input.membership.memberId,
        updatedAt: now,
      })
      .returning();

    await writeAudit({
      actorType: "user",
      actorId: input.membership.userId,
      action: "household.enrollment.created",
      resourceType: "member_app_enrollment",
      resourceId: row.id,
      metaJson: {
        applicationKey: input.applicationKey,
        memberId: input.memberId,
        status,
        scope: apps[0].scope,
      },
      ip: input.ip,
    });

    return { ok: true, enrollment: publicEnrollment(row) };
  } catch (error) {
    const message = String((error as { message?: string })?.message ?? "");
    if (
      message.includes("member_app_enrollments_member_app_uidx") ||
      message.includes("unique")
    ) {
      return { ok: false, reason: "duplicate_enrollment" };
    }
    throw error;
  }
}

export async function updateEnrollmentStatus(input: {
  membership: HouseholdMembershipContext;
  enrollmentId: string;
  status: "active" | "suspended" | "removed";
  ip?: string;
}): Promise<
  | { ok: true; enrollment: ReturnType<typeof publicEnrollment> }
  | { ok: false; reason: "not_found" | "forbidden" }
> {
  if (!can(input.membership.role, "enrollments.manage")) {
    return { ok: false, reason: "forbidden" };
  }

  const rows = await db
    .select({
      id: memberAppEnrollments.id,
      householdMemberId: memberAppEnrollments.householdMemberId,
      applicationKey: memberAppEnrollments.applicationKey,
      status: memberAppEnrollments.status,
      enrolledAt: memberAppEnrollments.enrolledAt,
      enrolledByMemberId: memberAppEnrollments.enrolledByMemberId,
      updatedAt: memberAppEnrollments.updatedAt,
      memberRole: householdMembers.role,
      memberHouseholdId: householdMembers.householdId,
    })
    .from(memberAppEnrollments)
    .innerJoin(
      householdMembers,
      eq(memberAppEnrollments.householdMemberId, householdMembers.id),
    )
    .where(eq(memberAppEnrollments.id, input.enrollmentId))
    .limit(1);

  const row = rows[0];
  if (!row || row.memberHouseholdId !== input.membership.householdId) {
    return { ok: false, reason: "not_found" };
  }

  if (!canManageEnrollmentsForTarget(input.membership.role, row.memberRole)) {
    return { ok: false, reason: "forbidden" };
  }

  const now = new Date();
  const [updated] = await db
    .update(memberAppEnrollments)
    .set({ status: input.status, updatedAt: now })
    .where(eq(memberAppEnrollments.id, row.id))
    .returning();

  await writeAudit({
    actorType: "user",
    actorId: input.membership.userId,
    action: "household.enrollment.updated",
    resourceType: "member_app_enrollment",
    resourceId: row.id,
    metaJson: {
      from: row.status,
      to: input.status,
      applicationKey: row.applicationKey,
    },
    ip: input.ip,
  });

  return { ok: true, enrollment: publicEnrollment(updated) };
}

export async function listEnrollmentsForMemberIds(memberIds: string[]) {
  if (memberIds.length === 0) return [];
  return db
    .select({
      id: memberAppEnrollments.id,
      householdMemberId: memberAppEnrollments.householdMemberId,
      applicationKey: memberAppEnrollments.applicationKey,
      status: memberAppEnrollments.status,
      enrolledAt: memberAppEnrollments.enrolledAt,
      enrolledByMemberId: memberAppEnrollments.enrolledByMemberId,
      updatedAt: memberAppEnrollments.updatedAt,
    })
    .from(memberAppEnrollments)
    .where(inArray(memberAppEnrollments.householdMemberId, memberIds));
}
