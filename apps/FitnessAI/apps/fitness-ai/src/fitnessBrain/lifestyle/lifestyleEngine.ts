/**
 * Lifestyle Engine — builds long-term user intelligence for Fitness Brain.
 */

import type { UserProfile } from "../../domain/models";
import { computeActivityLearning } from "../activity/activityLearningEngine";
import type { ActivityLogEntry } from "../activity/types";
import type { DailyBehaviorLog } from "../storage/behaviorSignals";
import type { NormalizedUserProfile, UserDataInput } from "../types";
import { resolvePrimaryActivity } from "./activityLibrary";
import { computeBrainCompleteness } from "./brainCompleteness";
import { detectLifePatterns } from "./lifePatternEngine";
import type { LifestyleIntelligence, LifestyleProfileInput } from "./lifestyleProfile";
import {
  loadLifestyleProfile,
  mergeAppProfileIntoLifestyle,
  updateLifestyleProfile,
} from "./lifestyleStorage";

export type BuildLifestyleOptions = {
  appProfile?: UserProfile;
  behaviorLogs?: DailyBehaviorLog[];
  activityLogs?: ActivityLogEntry[];
  userProfile?: NormalizedUserProfile;
  userData?: UserDataInput;
  profilePatch?: LifestyleProfileInput;
};

export function buildLifestyleIntelligence(options: BuildLifestyleOptions = {}): LifestyleIntelligence {
  let profile = loadLifestyleProfile();

  if (options.appProfile) {
    profile = mergeAppProfileIntoLifestyle(options.appProfile);
  }

  if (options.profilePatch) {
    profile = updateLifestyleProfile(options.profilePatch);
  }

  const logs = options.behaviorLogs ?? [];
  const activityLogs = options.activityLogs ?? [];
  const patterns = detectLifePatterns(logs, profile, activityLogs);
  const activityLearning = computeActivityLearning(activityLogs);

  const completeness = computeBrainCompleteness(
    options.userProfile ?? {
      age: 30,
      gender: "other",
      heightCm: 175,
      weightKg: 75,
      goal: "maintenance",
      activityLevel: "moderate",
      experienceLevel: "unknown",
      foodPreferences: [],
      trainingDays: profile.training.usualTrainingDays ?? [1, 3, 5],
    },
    profile,
    patterns,
    options.userData ?? {},
    logs,
    activityLogs,
  );

  return { profile, patterns, completeness, activityLearning };
}

/** Resolves effective training days: learned pattern > lifestyle profile > Brain defaults. */
export function resolveEffectiveTrainingDays(
  intelligence: LifestyleIntelligence,
  fallback: number[] = [1, 3, 5],
): number[] {
  const learned = intelligence.patterns.find((p) => p.type === "usual_training_days");
  const fromPattern = learned?.payload.usualDays;
  if (Array.isArray(fromPattern) && fromPattern.length > 0) {
    return fromPattern as number[];
  }
  return intelligence.profile.training.usualTrainingDays ?? fallback;
}

/** Internal hydration emphasis from favourite activities — not shown to user. */
export function resolveHydrationEmphasis(intelligence: LifestyleIntelligence): "low" | "moderate" | "high" {
  const activity = resolvePrimaryActivity(intelligence.profile.training.favouriteSports);
  return activity.hydrationImportance;
}

export {
  loadLifestyleProfile,
  saveLifestyleProfile,
  updateLifestyleProfile,
  mergeAppProfileIntoLifestyle,
  isLifestyleProfileCustomized,
} from "./lifestyleStorage";
