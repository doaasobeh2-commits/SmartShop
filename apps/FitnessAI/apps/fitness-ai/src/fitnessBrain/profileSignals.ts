/**
 * Profile identity signals — primary sport and experience must not be invented.
 */

import type { LifestyleProfile } from "./lifestyle/lifestyleProfile";
import type { NormalizedUserProfile, UserDataInput } from "./types";

export function resolvePrimarySportId(
  lifestyleTraining: LifestyleProfile["training"] | undefined,
  userData: UserDataInput = {},
): string | undefined {
  if (lifestyleTraining?.primarySport) return lifestyleTraining.primarySport;
  if (userData.primarySportId) return userData.primarySportId;
  return undefined;
}

export function isPrimarySportKnown(
  lifestyleTraining: LifestyleProfile["training"] | undefined,
  userData: UserDataInput = {},
): boolean {
  return resolvePrimarySportId(lifestyleTraining, userData) !== undefined;
}

export function isExperienceKnown(profile: NormalizedUserProfile): boolean {
  return profile.experienceLevel !== "unknown";
}
