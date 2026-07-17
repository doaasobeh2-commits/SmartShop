export type AdminUser = {
  id: string;
  email: string;
  displayName: string;
  role: string;
};

export type OverviewResponse = {
  metrics: {
    totalUsers: number;
    activeUsers: number;
    totalHouseholds: number;
    activeMemberships: number;
    pendingInvitations: number;
    activeUserSessions: number;
  };
  recentRegistrations: Array<{
    id: string;
    email: string;
    displayName: string;
    createdAt: string;
  }>;
  recentLogins: Array<{
    id: string;
    email: string;
    displayName: string;
    lastLoginAt: string | null;
  }>;
  recentAuditEvents: Array<{
    id: string;
    action: string;
    actorType: string;
    createdAt: string;
  }>;
};

export type PlatformUser = {
  id: string;
  email: string;
  displayName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  sessionCount: number;
  memberships: Array<{
    memberId: string;
    householdId: string;
    householdName: string;
    role: string;
    status: string;
  }>;
};

export type PlatformHousehold = {
  id: string;
  publicAlias: string;
  name: string;
  preferredLocale: string;
  ownerUserId: string | null;
  ownerEmail: string | null;
  ownerDisplayName: string | null;
  createdAt: string;
  updatedAt: string;
  activeMemberCount: number;
  pendingInvitationCount: number;
};

export type InvitationRow = {
  id: string;
  householdId: string;
  householdName: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
  invitedByUserId: string;
};

export type SessionRow = {
  id: string;
  userId: string;
  email: string;
  displayName: string;
  createdAt: string;
  expiresAt: string;
  revokedAt: string | null;
  ip: string | null;
  userAgent: string | null;
  active: boolean;
};

export type AuditPage = {
  page: number;
  pageSize: number;
  total: number;
  items: Array<{
    id: string;
    actorType: string;
    actorId: string | null;
    action: string;
    resourceType: string | null;
    resourceId: string | null;
    meta: Record<string, unknown>;
    ip: string | null;
    createdAt: string;
  }>;
};
