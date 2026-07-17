import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import {
  auditLogs,
  householdInvitations,
  householdMembers,
  households,
  userAccounts,
  userSessions,
} from "../../db/schema/index.js";
import { redactAuditMeta } from "../../lib/redact.js";

export async function getAdminOverview() {
  const [
    totalUsers,
    activeUsers,
    totalHouseholds,
    activeMemberships,
    pendingInvitations,
    activeSessions,
    recentRegistrations,
    recentLogins,
    recentAudit,
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
      .from(userSessions)
      .where(
        and(
          sql`${userSessions.revokedAt} is null`,
          sql`${userSessions.expiresAt} > now()`,
        ),
      ),
    db
      .select({
        id: userAccounts.id,
        email: userAccounts.email,
        displayName: userAccounts.displayName,
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
  ]);

  return {
    metrics: {
      totalUsers: totalUsers[0]?.c ?? 0,
      activeUsers: activeUsers[0]?.c ?? 0,
      totalHouseholds: totalHouseholds[0]?.c ?? 0,
      activeMemberships: activeMemberships[0]?.c ?? 0,
      pendingInvitations: pendingInvitations[0]?.c ?? 0,
      activeUserSessions: activeSessions[0]?.c ?? 0,
    },
    recentRegistrations: recentRegistrations.map((u) => ({
      id: u.id,
      email: u.email,
      displayName: u.displayName,
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
    const list = membersByUser.get(m.userId) ?? [];
    list.push(m);
    membersByUser.set(m.userId, list);
  }

  return users.map((u) => ({
    id: u.id,
    email: u.email,
    displayName: u.displayName,
    status: u.status,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
    lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
    sessionCount: sessionsByUser.get(u.id) ?? 0,
    memberships: (membersByUser.get(u.id) ?? []).map((m) => ({
      memberId: m.memberId,
      householdId: m.householdId,
      householdName: m.householdName,
      role: m.role,
      status: m.status,
    })),
  }));
}

export async function getAdminUser(userId: string) {
  const users = await listAdminUsers();
  return users.find((u) => u.id === userId) ?? null;
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

  const membersByHh = new Map(memberCounts.map((r) => [r.householdId, r.c]));
  const pendingByHh = new Map(pendingInvites.map((r) => [r.householdId, r.c]));

  return rows.map((h) => ({
    id: h.id,
    publicAlias: h.publicAlias,
    name: h.name,
    preferredLocale: h.preferredLocale,
    ownerUserId: h.ownerUserId,
    ownerEmail: h.ownerEmail,
    ownerDisplayName: h.ownerDisplayName,
    createdAt: h.createdAt.toISOString(),
    updatedAt: h.updatedAt.toISOString(),
    activeMemberCount: membersByHh.get(h.id) ?? 0,
    pendingInvitationCount: pendingByHh.get(h.id) ?? 0,
  }));
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
      email: userAccounts.email,
      displayName: userAccounts.displayName,
    })
    .from(householdMembers)
    .innerJoin(userAccounts, eq(householdMembers.userId, userAccounts.id))
    .where(eq(householdMembers.householdId, householdId))
    .orderBy(desc(householdMembers.createdAt));

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

  const summary = {
    pending: invitations.filter((i) => i.status === "pending").length,
    accepted: invitations.filter((i) => i.status === "accepted").length,
    revoked: invitations.filter((i) => i.status === "revoked").length,
    expired: invitations.filter((i) => i.status === "expired").length,
  };

  return {
    household,
    members: members.map((m) => ({
      id: m.id,
      userId: m.userId,
      role: m.role,
      status: m.status,
      joinedAt: m.joinedAt?.toISOString() ?? null,
      email: m.email,
      displayName: m.displayName,
    })),
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
    active:
      !r.revokedAt && r.expiresAt.getTime() > now,
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
