import { apiRequest } from "./client";
import type {
  AdminUser,
  AuditPage,
  InvitationRow,
  OverviewResponse,
  PlatformHousehold,
  PlatformUser,
  SessionRow,
} from "./types";

export function adminLogin(email: string, password: string) {
  return apiRequest<{ user: AdminUser }>("/admin/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function adminLogout() {
  return apiRequest<{ ok: boolean }>("/admin/auth/logout", { method: "POST" });
}

export function adminMe() {
  return apiRequest<{ user: AdminUser }>("/admin/auth/me");
}

export function fetchOverview() {
  return apiRequest<OverviewResponse>("/admin/overview");
}

export function fetchUsers() {
  return apiRequest<{ users: PlatformUser[] }>("/admin/users");
}

export function fetchUser(userId: string) {
  return apiRequest<{ user: PlatformUser }>(`/admin/users/${userId}`);
}

export function fetchHouseholds() {
  return apiRequest<{ households: PlatformHousehold[] }>("/admin/households");
}

export function fetchHousehold(householdId: string) {
  return apiRequest<{
    household: PlatformHousehold;
    members: Array<{
      id: string;
      userId: string;
      role: string;
      status: string;
      joinedAt: string | null;
      email: string;
      displayName: string;
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
  }>(`/admin/households/${householdId}`);
}

export function fetchInvitations() {
  return apiRequest<{ invitations: InvitationRow[] }>("/admin/invitations");
}

export function fetchSessions() {
  return apiRequest<{ sessions: SessionRow[] }>("/admin/sessions");
}

export function fetchAuditLogs(params: {
  page?: number;
  pageSize?: number;
  actorType?: string;
  action?: string;
}) {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.pageSize) q.set("pageSize", String(params.pageSize));
  if (params.actorType) q.set("actorType", params.actorType);
  if (params.action) q.set("action", params.action);
  const qs = q.toString();
  return apiRequest<AuditPage>(`/admin/audit-logs${qs ? `?${qs}` : ""}`);
}
