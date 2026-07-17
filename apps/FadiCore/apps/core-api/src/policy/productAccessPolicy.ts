import type { PlatformApplicationKey } from "../db/schema/index.js";

export type AgeBand = "under_14" | "teen_14_17" | "adult_18_plus" | "unknown";

export function ageFromDob(
  dob: Date | string,
  asOf: Date = new Date(),
): number {
  const birth =
    typeof dob === "string" ? new Date(`${dob}T00:00:00.000Z`) : dob;
  let age = asOf.getUTCFullYear() - birth.getUTCFullYear();
  const monthDiff = asOf.getUTCMonth() - birth.getUTCMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && asOf.getUTCDate() < birth.getUTCDate())
  ) {
    age -= 1;
  }
  return age;
}

export function ageBandFromDob(
  dob: Date | string | null | undefined,
  asOf: Date = new Date(),
): AgeBand {
  if (!dob) return "unknown";
  const age = ageFromDob(dob, asOf);
  if (age < 14) return "under_14";
  if (age < 18) return "teen_14_17";
  return "adult_18_plus";
}

/** Smart Shop household shopping — adults only. */
export function canAccessSmartShop(age: number): boolean {
  return age >= 18;
}

/** Recipe household meal planning — adults only. */
export function canManageRecipeHouseholdPlanning(age: number): boolean {
  return age >= 18;
}

/** Independent Fitness access without parental approval. */
export function canAccessFitnessIndependent(age: number): boolean {
  return age >= 18;
}

/** Teens 14–17 need parental approval for Fitness. */
export function requiresParentalApprovalForFitness(age: number): boolean {
  return age >= 14 && age < 18;
}

export type AppEnrollmentDecision =
  | { allowed: true; reason: "ok" }
  | {
      allowed: false;
      reason: "age_policy_blocked" | "parental_approval_required";
    };

export function evaluateAppEnrollment(input: {
  applicationKey: PlatformApplicationKey | string;
  age: number;
  parentalApprovalActive: boolean;
}): AppEnrollmentDecision {
  const { applicationKey, age, parentalApprovalActive } = input;

  if (applicationKey === "smart_shop") {
    return canAccessSmartShop(age)
      ? { allowed: true, reason: "ok" }
      : { allowed: false, reason: "age_policy_blocked" };
  }

  if (applicationKey === "recipe") {
    return canManageRecipeHouseholdPlanning(age)
      ? { allowed: true, reason: "ok" }
      : { allowed: false, reason: "age_policy_blocked" };
  }

  if (applicationKey === "fitness") {
    if (age < 14) {
      return { allowed: false, reason: "age_policy_blocked" };
    }
    if (canAccessFitnessIndependent(age)) {
      return { allowed: true, reason: "ok" };
    }
    if (requiresParentalApprovalForFitness(age)) {
      return parentalApprovalActive
        ? { allowed: true, reason: "ok" }
        : { allowed: false, reason: "parental_approval_required" };
    }
    return { allowed: false, reason: "age_policy_blocked" };
  }

  return { allowed: false, reason: "age_policy_blocked" };
}
