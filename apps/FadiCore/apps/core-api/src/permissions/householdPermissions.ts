import { env } from "../config.js";
import type { MemberRole } from "../db/schema/index.js";

export type HouseholdPermission =
  | "household.view"
  | "household.manage"
  | "members.view"
  | "members.invite"
  | "members.create_managed"
  | "members.change_role"
  | "members.remove"
  | "members.manage_claims"
  | "invitations.view"
  | "invitations.revoke"
  | "enrollments.view"
  | "enrollments.manage";

const OWNER_PERMISSIONS: readonly HouseholdPermission[] = [
  "household.view",
  "household.manage",
  "members.view",
  "members.invite",
  "members.create_managed",
  "members.change_role",
  "members.remove",
  "members.manage_claims",
  "invitations.view",
  "invitations.revoke",
  "enrollments.view",
  "enrollments.manage",
] as const;

const READ_PERMISSIONS: readonly HouseholdPermission[] = [
  "household.view",
  "members.view",
  "invitations.view",
  "enrollments.view",
] as const;

/**
 * Extensible role → permission map.
 * Adult invite / managed minors gated by ADULT_CAN_INVITE policy.
 */
export function permissionsForRole(role: MemberRole): ReadonlySet<HouseholdPermission> {
  switch (role) {
    case "owner":
      return new Set(OWNER_PERMISSIONS);
    case "adult": {
      const set = new Set<HouseholdPermission>(READ_PERMISSIONS);
      if (env.ADULT_CAN_INVITE) {
        set.add("members.invite");
        set.add("members.create_managed");
        set.add("members.manage_claims");
        set.add("enrollments.manage");
      }
      return set;
    }
    case "teen":
    case "child":
    case "caregiver":
      return new Set(READ_PERMISSIONS);
    default:
      return new Set();
  }
}

export function can(
  role: MemberRole,
  permission: HouseholdPermission,
): boolean {
  return permissionsForRole(role).has(permission);
}

/** Roles that may be assigned via invitation or role change (not owner). */
export const ASSIGNABLE_MEMBER_ROLES = [
  "adult",
  "teen",
  "child",
  "caregiver",
] as const satisfies readonly MemberRole[];

/** Roles allowed for managed (no-login) profiles. */
export const MANAGED_MEMBER_ROLES = [
  "teen",
  "child",
  "caregiver",
] as const satisfies readonly MemberRole[];

export function isMinorRole(role: MemberRole): boolean {
  return role === "child" || role === "teen";
}
