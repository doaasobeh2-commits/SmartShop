import { env } from "../config.js";
import type { MemberRole } from "../db/schema/index.js";

export type HouseholdPermission =
  | "household.view"
  | "household.manage"
  | "members.view"
  | "members.invite"
  | "members.change_role"
  | "members.remove"
  | "invitations.view"
  | "invitations.revoke";

const OWNER_PERMISSIONS: readonly HouseholdPermission[] = [
  "household.view",
  "household.manage",
  "members.view",
  "members.invite",
  "members.change_role",
  "members.remove",
  "invitations.view",
  "invitations.revoke",
] as const;

const READ_PERMISSIONS: readonly HouseholdPermission[] = [
  "household.view",
  "members.view",
  "invitations.view",
] as const;

/**
 * Extensible role → permission map.
 * Adult invite is gated by ADULT_CAN_INVITE policy (env for Phase 2).
 */
export function permissionsForRole(role: MemberRole): ReadonlySet<HouseholdPermission> {
  switch (role) {
    case "owner":
      return new Set(OWNER_PERMISSIONS);
    case "adult": {
      const set = new Set<HouseholdPermission>(READ_PERMISSIONS);
      if (env.ADULT_CAN_INVITE) {
        set.add("members.invite");
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
