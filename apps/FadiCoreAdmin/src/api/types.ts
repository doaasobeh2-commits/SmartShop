export type AdminUser = {
  id: string;
  email: string;
  displayName: string;
  role: string;
};

export type PrivacySafeAddress = {
  city: string;
  countryCode: string;
  postalCodePrefix: string;
  isPrimary?: boolean;
};

export type OverviewResponse = {
  metrics: {
    totalUsers: number;
    activeUsers: number;
    totalHouseholds: number;
    activeMemberships: number;
    pendingInvitations: number;
    pendingJoinRequests?: number;
    pendingParentalApprovals?: number;
    usersWithoutHousehold?: number;
    orphanHouseholds?: number;
    activeUserSessions: number;
  };
  applications?: Array<{
    key: string;
    name: string;
    scope: string;
    status: string;
  }>;
  recentRegistrations: Array<{
    id: string;
    email: string;
    displayName: string;
    ageBand?: string | null;
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
  ageBand?: string | null;
  hasHousehold?: boolean;
  dateOfBirth?: string | null;
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
  pendingJoinRequestCount?: number;
  orphan?: boolean;
  address?: PrivacySafeAddress | null;
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

export type HouseholdJoinRequestRow = {
  id: string;
  requesterUserId: string;
  requesterEmail: string | null;
  status: string;
  requestedRole: string;
  createdAt: string;
  expiresAt: string;
  resolvedAt: string | null;
};

export type ParentalApprovalRow = {
  id: string;
  householdMemberId: string;
  applicationKey: string;
  status: string;
  requesterUserId: string;
  approvedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

export type HouseholdDetailResponse = {
  household: PlatformHousehold;
  addresses: PrivacySafeAddress[];
  members: Array<{
    id: string;
    userId: string | null;
    role: string;
    status: string;
    joinedAt: string | null;
    email: string | null;
    displayName: string;
    preferredLocale: string | null;
    createdByMemberId: string | null;
    linkedAccount: boolean;
    managed: boolean;
    ageBand?: string | null;
    dateOfBirth?: string | null;
  }>;
  enrollments: Array<{
    id: string;
    householdMemberId: string;
    applicationKey: string;
    status: string;
    enrolledAt: string;
    enrolledByMemberId: string | null;
    updatedAt: string;
  }>;
  claims: Array<{
    id: string;
    householdId: string;
    householdMemberId: string;
    createdByMemberId: string;
    status: string;
    expiresAt: string;
    acceptedAt: string | null;
    acceptedUserId: string | null;
    createdAt: string;
  }>;
  invitationSummary: Record<string, number>;
  invitations: Array<{
    id: string;
    email: string;
    role: string;
    status: string;
    expiresAt: string;
    acceptedAt: string | null;
    createdAt: string;
    invitedByUserId: string;
  }>;
  joinRequests: HouseholdJoinRequestRow[];
  parentalApprovals: ParentalApprovalRow[];
};
