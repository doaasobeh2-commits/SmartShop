import { apiRequest } from "./client";

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  status: string;
  dateOfBirth?: string | null;
};

export type EnrollmentSummary = {
  applicationKey: string;
  status: string;
};

export type MeResponse = {
  user: AuthUser;
  householdId: string | null;
  memberId: string | null;
  memberRole: string | null;
  enrollments: EnrollmentSummary[];
};

export type AddressInput = {
  countryCode: string;
  postalCode: string;
  city: string;
  street: string;
  houseNumber: string;
  unit?: string;
};

export type AddressDiscoverResponse = {
  possibleMatch: boolean;
  matchCountBand: "none" | "one" | "multiple";
};

export type JoinRequest = {
  id: string;
  requesterUserId: string;
  targetHouseholdId: string;
  requestedRole: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  resolvedAt: string | null;
  resolvedByMemberId: string | null;
};

export type PublicHousehold = {
  id: string;
  publicAlias: string;
  name: string;
  preferredLocale: string;
  ownerUserId: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function registerUser(input: {
  email: string;
  password: string;
  displayName: string;
  dateOfBirth?: string;
}): Promise<{ user: AuthUser; householdId: string | null }> {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<{ user: AuthUser }> {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function logoutUser(): Promise<void> {
  await apiRequest("/auth/logout", { method: "POST" });
}

export async function fetchMe(): Promise<MeResponse> {
  return apiRequest("/auth/me");
}

export async function createHousehold(body: {
  name: string;
  preferredLocale?: string;
  address: AddressInput;
}): Promise<{ household: PublicHousehold; memberId: string }> {
  return apiRequest("/households", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function discoverAddress(
  address: AddressInput,
): Promise<AddressDiscoverResponse> {
  return apiRequest("/onboarding/address/discover", {
    method: "POST",
    body: JSON.stringify(address),
  });
}

export async function createJoinRequest(
  address: AddressInput & { requestedRole?: string },
): Promise<{ joinRequest: JoinRequest }> {
  return apiRequest("/onboarding/join-requests", {
    method: "POST",
    body: JSON.stringify(address),
  });
}

export async function listMyJoinRequests(): Promise<{
  joinRequests: JoinRequest[];
}> {
  return apiRequest("/onboarding/join-requests/mine");
}

export async function enrollMember(
  memberId: string,
  body: { applicationKey: string; status?: string },
): Promise<{ enrollment: EnrollmentSummary & { id?: string } }> {
  return apiRequest(`/households/current/members/${memberId}/enrollments`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function hasActiveAppEnrollment(
  enrollments: EnrollmentSummary[],
  applicationKey: string,
): boolean {
  return enrollments.some(
    (e) => e.applicationKey === applicationKey && e.status === "active",
  );
}

export function hasPendingJoinRequest(requests: JoinRequest[]): boolean {
  return requests.some((r) => r.status === "pending");
}

/** Post-auth gate for RecipeAI Phase 4b household onboarding. */
export type RecipeAccessGate =
  | "needs-household"
  | "join-pending"
  | "recipe-not-enabled"
  | "ready";

export function resolveRecipeAccessGate(input: {
  householdId: string | null;
  memberId: string | null;
  recipeEnabled: boolean;
  pendingJoin: boolean;
}): RecipeAccessGate {
  if (!input.householdId || !input.memberId) {
    return input.pendingJoin ? "join-pending" : "needs-household";
  }
  if (!input.recipeEnabled) return "recipe-not-enabled";
  return "ready";
}
