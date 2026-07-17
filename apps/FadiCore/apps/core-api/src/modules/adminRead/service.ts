import { and, count, desc, eq, gte, isNull, lte, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import {
  auditLogs,
  householdAddresses,
  householdInvitations,
  householdJoinRequests,
  householdMembers,
  households,
  memberAccountClaims,
  memberAppEnrollments,
  parentalApprovals,
  platformApplications,
  userAccounts,
  userSessions,
} from "../../db/schema/index.js";
import { postalCodePrefix } from "../../lib/addressNormalize.js";
import { redactAuditMeta } from "../../lib/redact.js";
import { ageBandFromDob } from "../../policy/productAccessPolicy.js";
import { publicClaim } from "../family/claimsService.js";
import { publicEnrollment } from "../family/enrollmentsService.js";

function privacySafeAddress(row: {
  countryCode: string;
  postalCode: string;
  city: string;
}) {
  return {
    city: row.city,
    countryCode: row.countryCode,
    postalCodePrefix: postalCodePrefix(row.postalCode),
  };
}

export async function getAdminOverview() {
  const [
    totalUsers,
    activeUsers,
    totalHouseholds,
    activeMemberships,
    pendingInvitations,
    pendingJoinRequests,
    pendingParentalApprovals,
    activeSessions,
    usersWithoutHousehold,
    orphanHouseholds,
    recentRegistrations,
    recentLogins,
    recentAudit,
    applications,
  ] = await Promise.all([
    db.select({ c: count() }).from(userAccounts),
    db
      .select({ c: count() })
      .from(userAccounts)
      .where(eq(userAccounts.status, "active")),
    db
      .select({ c: count() })
      .from(households)
      .where(sql`${households.deletedAt} is null`),
    db
      .select({ c: count() })
      .from(householdMembers)
      .where(eq(householdMembers.status, "active")),
    db
      .select({ c: count() })
      .from(householdInvitations)
      .where(eq(householdInvitations.status, "pending")),
    db
      .select({ c: count() })
      .from(householdJoinRequests)
      .where(eq(householdJoinRequests.status, "pending")),
    db
      .select({ c: count() })
      .from(parentalApprovals)
      .where(eq(parentalApprovals.status, "pending")),
    db
      .select({ c: count() })
      .from(userSessions)
      .where(
        and(
          sql`${userSessions.revokedAt} is null`,
          sql`${userSessions.expiresAt} > now()`,
        ),
      ),
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(userAccounts)
      .where(
        sql`${userAccounts.id} not in (
          select distinct ${householdMembers.userId}
          from ${householdMembers}
          where ${householdMembers.status} = 'active'
            and ${householdMembers.userId} is not null
        )`,
      ),
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(households)
      .where(
        and(
          isNull(households.deletedAt),
          sql`(
            select count(*) from household_members hm
            where hm.household_id = ${households.id}
              and hm.status = 'active'
          ) = 0`,
        ),
      ),
    db
      .select({
        id: userAccounts.id,
        email: userAccounts.email,
        displayName: userAccounts.displayName,
        dateOfBirth: userAccounts.dateOfBirth,
        createdAt: userAccounts.createdAt,
      })
      .from(userAccounts)
      .orderBy(desc(userAccounts.createdAt))
      .limit(10),
    db
      .select({
        id: userAccounts.id,
        email: userAccounts.email,
        displayName: userAccounts.displayName,
        lastLoginAt: userAccounts.lastLoginAt,
      })
      .from(userAccounts)
      .where(sql`${userAccounts.lastLoginAt} is not null`)
      .orderBy(desc(userAccounts.lastLoginAt))
      .limit(10),
    db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        actorType: auditLogs.actorType,
        createdAt: auditLogs.createdAt,
      })
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(15),
    db
      .select({
        key: platformApplications.key,
        name: platformApplications.name,
        scope: platformApplications.scope,
        status: platformApplications.status,
      })
      .from(platformApplications)
      .orderBy(platformApplications.key),
  ]);

  return {
    metrics: {
      totalUsers: totalUsers[0]?.c ?? 0,
      activeUsers: activeUsers[0]?.c ?? 0,
      totalHouseholds: totalHouseholds[0]?.c ?? 0,
      activeMemberships: activeMemberships[0]?.c ?? 0,
      pendingInvitations: pendingInvitations[0]?.c ?? 0,
      pendingJoinRequests: pendingJoinRequests[0]?.c ?? 0,
      pendingParentalApprovals: pendingParentalApprovals[0]?.c ?? 0,
      usersWithoutHousehold: usersWithoutHousehold[0]?.c ?? 0,
      orphanHouseholds: orphanHouseholds[0]?.c ?? 0,
      activeUserSessions: activeSessions[0]?.c ?? 0,
    },
    applications: applications.map((a) => ({
      key: a.key,
      name: a.name,
      scope: a.scope,
      status: a.status,
    })),
    recentRegistrations: recentRegistrations.map((u) => ({
      id: u.id,
      email: u.email,
      displayName: u.displayName,
      ageBand: ageBandFromDob(u.dateOfBirth),
      createdAt: u.createdAt.toISOString(),
    })),
    recentLogins: recentLogins.map((u) => ({
      id: u.id,
      email: u.email,
      displayName: u.displayName,
      lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
    })),
    recentAuditEvents: recentAudit.map((a) => ({
      id: a.id,
      action: a.action,
      actorType: a.actorType,
      createdAt: a.createdAt.toISOString(),
    })),
  };
}

export async function listAdminUsers() {
  const users = await db
    .select({
      id: userAccounts.id,
      email: userAccounts.email,
      displayName: userAccounts.displayName,
      status: userAccounts.status,
      dateOfBirth: userAccounts.dateOfBirth,
      createdAt: userAccounts.createdAt,
      updatedAt: userAccounts.updatedAt,
      lastLoginAt: userAccounts.lastLoginAt,
    })
    .from(userAccounts)
    .orderBy(desc(userAccounts.createdAt));

  const memberships = await db
    .select({
      userId: householdMembers.userId,
      memberId: householdMembers.id,
      householdId: householdMembers.householdId,
      role: householdMembers.role,
      status: householdMembers.status,
      householdName: households.name,
    })
    .from(householdMembers)
    .innerJoin(households, eq(householdMembers.householdId, households.id));

  const sessionCounts = await db
    .select({
      userId: userSessions.userId,
      c: count(),
    })
    .from(userSessions)
    .where(
      and(
        sql`${userSessions.revokedAt} is null`,
        sql`${userSessions.expiresAt} > now()`,
      ),
    )
    .groupBy(userSessions.userId);

  const sessionsByUser = new Map(
    sessionCounts.map((r) => [r.userId, r.c] as const),
  );
  const membersByUser = new Map<string, typeof memberships>();
  for (const m of memberships) {
    if (!m.userId) continue;
    const list = membersByUser.get(m.userId) ?? [];
    list.push(m);
    membersByUser.set(m.userId, list);
  }

  return users.map((u) => {
    const userMemberships = membersByUser.get(u.id) ?? [];
    return {
      id: u.id,
      email: u.email,
      displayName: u.displayName,
      status: u.status,
      ageBand: ageBandFromDob(u.dateOfBirth),
      hasHousehold: userMemberships.some((m) => m.status === "active"),
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
      lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
      sessionCount: sessionsByUser.get(u.id) ?? 0,
      memberships: userMemberships.map((m) => ({
        memberId: m.memberId,
        householdId: m.householdId,
        householdName: m.householdName,
        role: m.role,
        status: m.status,
      })),
    };
  });
}

export async function getAdminUser(userId: string) {
  const list = await listAdminUsers();
  const base = list.find((u) => u.id === userId);
  if (!base) return null;

  const rows = await db
    .select({ dateOfBirth: userAccounts.dateOfBirth })
    .from(userAccounts)
    .where(eq(userAccounts.id, userId))
    .limit(1);

  return {
    ...base,
    dateOfBirth: rows[0]?.dateOfBirth ?? null,
  };
}

export async function listAdminHouseholds() {
  const rows = await db
    .select({
      id: households.id,
      publicAlias: households.publicAlias,
      name: households.name,
      preferredLocale: households.preferredLocale,
      ownerUserId: households.ownerUserId,
      createdAt: households.createdAt,
      updatedAt: households.updatedAt,
      ownerEmail: userAccounts.email,
      ownerDisplayName: userAccounts.displayName,
    })
    .from(households)
    .leftJoin(userAccounts, eq(households.ownerUserId, userAccounts.id))
    .where(sql`${households.deletedAt} is null`)
    .orderBy(desc(households.createdAt));

  const memberCounts = await db
    .select({
      householdId: householdMembers.householdId,
      c: count(),
    })
    .from(householdMembers)
    .where(eq(householdMembers.status, "active"))
    .groupBy(householdMembers.householdId);

  const pendingInvites = await db
    .select({
      householdId: householdInvitations.householdId,
      c: count(),
    })
    .from(householdInvitations)
    .where(eq(householdInvitations.status, "pending"))
    .groupBy(householdInvitations.householdId);

  const pendingJoins = await db
    .select({
      householdId: householdJoinRequests.targetHouseholdId,
      c: count(),
    })
    .from(householdJoinRequests)
    .where(eq(householdJoinRequests.status, "pending"))
    .groupBy(householdJoinRequests.targetHouseholdId);

  const addresses = await db
    .select({
      householdId: householdAddresses.householdId,
      countryCode: householdAddresses.countryCode,
      postalCode: householdAddresses.postalCode,
      city: householdAddresses.city,
      isPrimary: householdAddresses.isPrimary,
    })
    .from(householdAddresses)
    .where(eq(householdAddresses.isPrimary, true));

  const membersByHh = new Map(memberCounts.map((r) => [r.householdId, r.c]));
  const pendingByHh = new Map(pendingInvites.map((r) => [r.householdId, r.c]));
  const joinsByHh = new Map(pendingJoins.map((r) => [r.householdId, r.c]));
  const addressByHh = new Map(addresses.map((r) => [r.householdId, r]));

  return rows.map((h) => {
    const activeMemberCount = membersByHh.get(h.id) ?? 0;
    const addr = addressByHh.get(h.id);
    return {
      id: h.id,
      publicAlias: h.publicAlias,
      name: h.name,
      preferredLocale: h.preferredLocale,
      ownerUserId: h.ownerUserId,
      ownerEmail: h.ownerEmail,
      ownerDisplayName: h.ownerDisplayName,
      createdAt: h.createdAt.toISOString(),
      updatedAt: h.updatedAt.toISOString(),
      activeMemberCount,
      pendingInvitationCount: pendingByHh.get(h.id) ?? 0,
      pendingJoinRequestCount: joinsByHh.get(h.id) ?? 0,
      orphan: activeMemberCount === 0,
      address: addr ? privacySafeAddress(addr) : null,
    };
  });
}

export async function getAdminHousehold(householdId: string) {
  const list = await listAdminHouseholds();
  const household = list.find((h) => h.id === householdId);
  if (!household) return null;

  const members = await db
    .select({
      id: householdMembers.id,
      userId: householdMembers.userId,
      role: householdMembers.role,
      status: householdMembers.status,
      joinedAt: householdMembers.joinedAt,
      displayName: sql<string>`coalesce(nullif(${householdMembers.displayName}, ''), ${userAccounts.displayName}, 'Member')`,
      preferredLocale: householdMembers.preferredLocale,
      createdByMemberId: householdMembers.createdByMemberId,
      email: userAccounts.email,
      dateOfBirth: userAccounts.dateOfBirth,
    })
    .from(householdMembers)
    .leftJoin(userAccounts, eq(householdMembers.userId, userAccounts.id))
    .where(eq(householdMembers.householdId, householdId))
    .orderBy(desc(householdMembers.createdAt));

  const memberIds = members.map((m) => m.id);

  const enrollments =
    memberIds.length === 0
      ? []
      : await db
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

  const claims = await db
    .select({
      id: memberAccountClaims.id,
      householdId: memberAccountClaims.householdId,
      householdMemberId: memberAccountClaims.householdMemberId,
      createdByMemberId: memberAccountClaims.createdByMemberId,
      status: memberAccountClaims.status,
      expiresAt: memberAccountClaims.expiresAt,
      acceptedAt: memberAccountClaims.acceptedAt,
      acceptedUserId: memberAccountClaims.acceptedUserId,
      createdAt: memberAccountClaims.createdAt,
    })
    .from(memberAccountClaims)
    .where(eq(memberAccountClaims.householdId, householdId))
    .orderBy(desc(memberAccountClaims.createdAt));

  const invitations = await db
    .select({
      id: householdInvitations.id,
      email: householdInvitations.email,
      role: householdInvitations.role,
      status: householdInvitations.status,
      expiresAt: householdInvitations.expiresAt,
      acceptedAt: householdInvitations.acceptedAt,
      createdAt: householdInvitations.createdAt,
      invitedByUserId: householdInvitations.invitedByUserId,
    })
    .from(householdInvitations)
    .where(eq(householdInvitations.householdId, householdId))
    .orderBy(desc(householdInvitations.createdAt));

  const joinRequests = await db
    .select({
      id: householdJoinRequests.id,
      requesterUserId: householdJoinRequests.requesterUserId,
      status: householdJoinRequests.status,
      requestedRole: householdJoinRequests.requestedRole,
      createdAt: householdJoinRequests.createdAt,
      expiresAt: householdJoinRequests.expiresAt,
      resolvedAt: householdJoinRequests.resolvedAt,
      requesterEmail: userAccounts.email,
    })
    .from(householdJoinRequests)
    .leftJoin(
      userAccounts,
      eq(householdJoinRequests.requesterUserId, userAccounts.id),
    )
    .where(eq(householdJoinRequests.targetHouseholdId, householdId))
    .orderBy(desc(householdJoinRequests.createdAt));

  const parental = await db
    .select({
      id: parentalApprovals.id,
      householdMemberId: parentalApprovals.householdMemberId,
      applicationKey: parentalApprovals.applicationKey,
      status: parentalApprovals.status,
      requesterUserId: parentalApprovals.requesterUserId,
      approvedAt: parentalApprovals.approvedAt,
      revokedAt: parentalApprovals.revokedAt,
      createdAt: parentalApprovals.createdAt,
    })
    .from(parentalApprovals)
    .innerJoin(
      householdMembers,
      eq(parentalApprovals.householdMemberId, householdMembers.id),
    )
    .where(eq(householdMembers.householdId, householdId))
    .orderBy(desc(parentalApprovals.createdAt));

  const addressRows = await db
    .select({
      countryCode: householdAddresses.countryCode,
      postalCode: householdAddresses.postalCode,
      city: householdAddresses.city,
      isPrimary: householdAddresses.isPrimary,
    })
    .from(householdAddresses)
    .where(eq(householdAddresses.householdId, householdId));

  const summary = {
    pending: invitations.filter((i) => i.status === "pending").length,
    accepted: invitations.filter((i) => i.status === "accepted").length,
    revoked: invitations.filter((i) => i.status === "revoked").length,
    expired: invitations.filter((i) => i.status === "expired").length,
  };

  return {
    household,
    addresses: addressRows.map((a) => ({
      ...privacySafeAddress(a),
      isPrimary: a.isPrimary,
    })),
    members: members.map((m) => ({
      id: m.id,
      userId: m.userId,
      role: m.role,
      status: m.status,
      joinedAt: m.joinedAt?.toISOString() ?? null,
      email: m.email ?? null,
      displayName: m.displayName,
      preferredLocale: m.preferredLocale,
      createdByMemberId: m.createdByMemberId,
      linkedAccount: m.userId !== null,
      managed: m.userId === null,
      ageBand: ageBandFromDob(m.dateOfBirth),
      dateOfBirth: m.dateOfBirth ?? null,
    })),
    enrollments: enrollments.map(publicEnrollment),
    claims: claims.map(publicClaim),
    invitationSummary: summary,
    invitations: invitations.map((i) => ({
      id: i.id,
      email: i.email,
      role: i.role,
      status: i.status,
      expiresAt: i.expiresAt.toISOString(),
      acceptedAt: i.acceptedAt?.toISOString() ?? null,
      createdAt: i.createdAt.toISOString(),
      invitedByUserId: i.invitedByUserId,
    })),
    joinRequests: joinRequests.map((j) => ({
      id: j.id,
      requesterUserId: j.requesterUserId,
      requesterEmail: j.requesterEmail ?? null,
      status: j.status,
      requestedRole: j.requestedRole,
      createdAt: j.createdAt.toISOString(),
      expiresAt: j.expiresAt.toISOString(),
      resolvedAt: j.resolvedAt?.toISOString() ?? null,
    })),
    parentalApprovals: parental.map((p) => ({
      id: p.id,
      householdMemberId: p.householdMemberId,
      applicationKey: p.applicationKey,
      status: p.status,
      requesterUserId: p.requesterUserId,
      approvedAt: p.approvedAt?.toISOString() ?? null,
      revokedAt: p.revokedAt?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
    })),
  };
}

export async function listAdminInvitations() {
  const rows = await db
    .select({
      id: householdInvitations.id,
      householdId: householdInvitations.householdId,
      householdName: households.name,
      email: householdInvitations.email,
      role: householdInvitations.role,
      status: householdInvitations.status,
      expiresAt: householdInvitations.expiresAt,
      acceptedAt: householdInvitations.acceptedAt,
      createdAt: householdInvitations.createdAt,
      invitedByUserId: householdInvitations.invitedByUserId,
    })
    .from(householdInvitations)
    .innerJoin(households, eq(householdInvitations.householdId, households.id))
    .orderBy(desc(householdInvitations.createdAt));

  return rows.map((r) => ({
    id: r.id,
    householdId: r.householdId,
    householdName: r.householdName,
    email: r.email,
    role: r.role,
    status: r.status,
    expiresAt: r.expiresAt.toISOString(),
    acceptedAt: r.acceptedAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
    invitedByUserId: r.invitedByUserId,
  }));
}

export async function listAdminSessions() {
  const rows = await db
    .select({
      id: userSessions.id,
      userId: userSessions.userId,
      email: userAccounts.email,
      displayName: userAccounts.displayName,
      createdAt: userSessions.createdAt,
      expiresAt: userSessions.expiresAt,
      revokedAt: userSessions.revokedAt,
      ip: userSessions.ip,
      userAgent: userSessions.userAgent,
    })
    .from(userSessions)
    .innerJoin(userAccounts, eq(userSessions.userId, userAccounts.id))
    .orderBy(desc(userSessions.createdAt))
    .limit(200);

  const now = Date.now();
  return rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    email: r.email,
    displayName: r.displayName,
    createdAt: r.createdAt.toISOString(),
    expiresAt: r.expiresAt.toISOString(),
    revokedAt: r.revokedAt?.toISOString() ?? null,
    ip: r.ip,
    userAgent: r.userAgent,
    active: !r.revokedAt && r.expiresAt.getTime() > now,
  }));
}

export async function listAdminAuditLogs(input: {
  page: number;
  pageSize: number;
  actorType?: string;
  action?: string;
  from?: Date;
  to?: Date;
}) {
  const conditions = [];
  if (input.actorType) {
    conditions.push(eq(auditLogs.actorType, input.actorType as never));
  }
  if (input.action) {
    conditions.push(eq(auditLogs.action, input.action));
  }
  if (input.from) {
    conditions.push(gte(auditLogs.createdAt, input.from));
  }
  if (input.to) {
    conditions.push(lte(auditLogs.createdAt, input.to));
  }

  const where = conditions.length ? and(...conditions) : undefined;
  const offset = (input.page - 1) * input.pageSize;

  const [totalRow] = await db
    .select({ c: count() })
    .from(auditLogs)
    .where(where);

  const rows = await db
    .select({
      id: auditLogs.id,
      actorType: auditLogs.actorType,
      actorId: auditLogs.actorId,
      action: auditLogs.action,
      resourceType: auditLogs.resourceType,
      resourceId: auditLogs.resourceId,
      metaJson: auditLogs.metaJson,
      ip: auditLogs.ip,
      createdAt: auditLogs.createdAt,
    })
    .from(auditLogs)
    .where(where)
    .orderBy(desc(auditLogs.createdAt))
    .limit(input.pageSize)
    .offset(offset);

  return {
    page: input.page,
    pageSize: input.pageSize,
    total: totalRow?.c ?? 0,
    items: rows.map((r) => ({
      id: r.id,
      actorType: r.actorType,
      actorId: r.actorId,
      action: r.action,
      resourceType: r.resourceType,
      resourceId: r.resourceId,
      meta: redactAuditMeta(r.metaJson ?? {}),
      ip: r.ip,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}
