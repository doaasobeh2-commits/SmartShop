/**
 * Persists lifestyle profile in localStorage.
 */

import type { UserProfile } from "../../domain/models";
import { grantConsent, sanitizeLifestylePatch } from "../privacy";
import {
  readInstallationScoped,
  writeInstallationScoped,
} from "../privacy/brainInstallationStorage";
import { DEFAULT_LIFESTYLE_PROFILE, LIFESTYLE_PROFILE_VERSION, LIFESTYLE_STORAGE_KEY } from "./lifestyleDefaults";
import type { LifestyleProfile, LifestyleProfileInput } from "./lifestyleProfile";

function nowIso(): string {
  return new Date().toISOString();
}

function deepMergeProfile(
  base: LifestyleProfile,
  patch: LifestyleProfileInput,
): LifestyleProfile {
  return {
    version: LIFESTYLE_PROFILE_VERSION,
    updatedAt: nowIso(),
    work: { ...base.work, ...patch.work },
    training: { ...base.training, ...patch.training },
    sleep: { ...base.sleep, ...patch.sleep },
    food: { ...base.food, ...patch.food },
    lifestyle: { ...base.lifestyle, ...patch.lifestyle },
    educationAcknowledged: patch.educationAcknowledged ?? base.educationAcknowledged,
  };
}

export function loadLifestyleProfile(): LifestyleProfile {
  const stored = readInstallationScoped<LifestyleProfile>(LIFESTYLE_STORAGE_KEY);
  if (!stored || stored.version !== LIFESTYLE_PROFILE_VERSION) {
    return { ...DEFAULT_LIFESTYLE_PROFILE, updatedAt: nowIso() };
  }
  return stored;
}

export function saveLifestyleProfile(profile: LifestyleProfile): LifestyleProfile {
  const next = { ...profile, updatedAt: nowIso() };
  writeInstallationScoped(LIFESTYLE_STORAGE_KEY, next);
  return next;
}

export function updateLifestyleProfile(patch: LifestyleProfileInput): LifestyleProfile {
  const sanitized = sanitizeLifestylePatch(patch);
  const current = loadLifestyleProfile();
  const merged = deepMergeProfile(current, sanitized);

  if (sanitized.work || sanitized.training || sanitized.sleep || sanitized.lifestyle) {
    grantConsent("lifestyle_setup");
  }
  if (sanitized.food) {
    grantConsent("food_preferences");
  }
  if (sanitized.sleep?.usualBedtime || sanitized.sleep?.usualWakeTime) {
    grantConsent("optional_sleep_logging");
  }

  return saveLifestyleProfile(merged);
}

/** Sync overlapping fields from app profile without overwriting richer lifestyle data. */
export function mergeAppProfileIntoLifestyle(appProfile: UserProfile): LifestyleProfile {
  const current = loadLifestyleProfile();
  const patch: LifestyleProfileInput = {};

  if (appProfile.trainingDays?.length && !current.training.usualTrainingDays?.length) {
    patch.training = { usualTrainingDays: appProfile.trainingDays };
  } else if (appProfile.trainingDays?.length) {
    patch.training = { usualTrainingDays: appProfile.trainingDays };
  }

  if (appProfile.foodPreferences?.length) {
    patch.food = {
      dietaryPreferences: [
        ...new Set([
          ...(current.food.dietaryPreferences ?? []),
          ...appProfile.foodPreferences,
        ]),
      ],
    };
  }

  if (Object.keys(patch).length === 0) return current;
  return updateLifestyleProfile(patch);
}

export function isLifestyleProfileCustomized(profile: LifestyleProfile): boolean {
  const d = DEFAULT_LIFESTYLE_PROFILE;
  return (
    profile.updatedAt !== "" &&
    JSON.stringify({
      work: profile.work,
      training: profile.training,
      sleep: profile.sleep,
      food: profile.food,
      lifestyle: profile.lifestyle,
    }) !==
      JSON.stringify({
        work: d.work,
        training: d.training,
        sleep: d.sleep,
        food: d.food,
        lifestyle: d.lifestyle,
      })
  );
}
