/**
 * Internal activity library — metadata for Fitness Brain only.
 * MET ranges derived from Compendium of Physical Activities (2011).
 * @see knowledge/activityMetSources — compendium codes per activity
 * @see knowledge/scientificSources — compendium-met-2011
 */

export type ActivityCategory =
  | "strength"
  | "cardio"
  | "sport"
  | "mind_body"
  | "combat"
  | "outdoor";

export type EnergySystem = "aerobic" | "anaerobic" | "mixed" | "flexibility";

export type RecoveryPriority = "low" | "moderate" | "high";

export type ImportanceLevel = "low" | "moderate" | "high";

export type ActivityDefinition = {
  id: string;
  name: string;
  category: ActivityCategory;
  primaryMuscles: string[];
  energySystem: EnergySystem;
  metMin: number;
  metMax: number;
  recoveryPriority: RecoveryPriority;
  hydrationImportance: ImportanceLevel;
  proteinImportance: ImportanceLevel;
  typicalDurationMin: number;
  suggestedRecoveryHours: number;
};

function act(
  id: string,
  name: string,
  category: ActivityCategory,
  primaryMuscles: string[],
  energySystem: EnergySystem,
  metMin: number,
  metMax: number,
  recoveryPriority: RecoveryPriority,
  hydrationImportance: ImportanceLevel,
  proteinImportance: ImportanceLevel,
  typicalDurationMin: number,
  suggestedRecoveryHours: number,
): ActivityDefinition {
  return {
    id,
    name,
    category,
    primaryMuscles,
    energySystem,
    metMin,
    metMax,
    recoveryPriority,
    hydrationImportance,
    proteinImportance,
    typicalDurationMin,
    suggestedRecoveryHours,
  };
}

export const ACTIVITY_LIBRARY: ActivityDefinition[] = [
  act("strength_training", "Strength Training", "strength", ["full_body"], "anaerobic", 3.5, 6.0, "high", "moderate", "high", 45, 48),
  act("bodybuilding", "Bodybuilding", "strength", ["full_body"], "anaerobic", 3.5, 6.0, "high", "moderate", "high", 50, 48),
  act("crossfit", "CrossFit", "strength", ["full_body"], "mixed", 5.0, 8.0, "high", "high", "high", 50, 36),
  act("martial_arts", "Martial Arts", "combat", ["full_body"], "mixed", 6.0, 10.0, "high", "high", "high", 50, 36),
  act("running", "Running", "cardio", ["legs", "core"], "aerobic", 7.0, 11.0, "moderate", "high", "moderate", 30, 24),
  act("walking", "Walking", "cardio", ["legs"], "aerobic", 2.5, 4.5, "low", "moderate", "low", 30, 6),
  act("swimming", "Swimming", "cardio", ["full_body"], "mixed", 5.0, 8.0, "moderate", "high", "moderate", 40, 24),
  act("cycling", "Cycling", "cardio", ["legs"], "aerobic", 4.0, 10.0, "moderate", "high", "moderate", 45, 18),
  act("rowing", "Rowing", "cardio", ["back", "legs", "core"], "mixed", 4.0, 9.0, "moderate", "high", "moderate", 30, 24),
  act("football", "Football", "sport", ["legs", "core"], "mixed", 7.0, 10.0, "high", "high", "moderate", 60, 36),
  act("basketball", "Basketball", "sport", ["legs", "core"], "mixed", 6.0, 9.0, "high", "high", "moderate", 50, 30),
  act("tennis", "Tennis", "sport", ["legs", "shoulders", "core"], "mixed", 5.0, 8.0, "moderate", "high", "moderate", 60, 24),
  act("badminton", "Badminton", "sport", ["legs", "shoulders"], "mixed", 4.5, 7.0, "moderate", "high", "moderate", 45, 18),
  act("volleyball", "Volleyball", "sport", ["legs", "shoulders"], "mixed", 3.0, 6.0, "moderate", "high", "moderate", 60, 18),
  act("yoga", "Yoga", "mind_body", ["full_body"], "flexibility", 2.0, 4.0, "low", "moderate", "low", 45, 6),
  act("pilates", "Pilates", "mind_body", ["core", "full_body"], "mixed", 3.0, 5.0, "low", "moderate", "moderate", 45, 12),
  act("stretching", "Stretching", "mind_body", ["full_body"], "flexibility", 2.0, 3.0, "low", "low", "low", 20, 4),
  act("boxing", "Boxing", "combat", ["shoulders", "core", "legs"], "mixed", 7.0, 12.0, "high", "high", "high", 45, 36),
  act("kickboxing", "Kickboxing", "combat", ["legs", "core"], "mixed", 7.0, 11.0, "high", "high", "high", 45, 36),
  act("mma", "MMA", "combat", ["full_body"], "mixed", 8.0, 12.0, "high", "high", "high", 60, 48),
  act("judo", "Judo", "combat", ["full_body"], "mixed", 10.0, 12.0, "high", "high", "high", 60, 48),
  act("hiking", "Hiking", "outdoor", ["legs", "core"], "aerobic", 4.0, 7.0, "moderate", "high", "moderate", 90, 24),
  act("climbing", "Climbing", "outdoor", ["upper_body", "core"], "mixed", 5.0, 8.0, "high", "high", "moderate", 90, 36),
  act("dance", "Dance", "cardio", ["legs", "core"], "aerobic", 3.5, 7.0, "moderate", "moderate", "moderate", 45, 12),
];

const BY_ID = new Map(ACTIVITY_LIBRARY.map((a) => [a.id, a]));

export function getActivityById(id: string): ActivityDefinition | undefined {
  return BY_ID.get(id);
}

export function getActivitiesByIds(ids: string[]): ActivityDefinition[] {
  return ids.map((id) => BY_ID.get(id)).filter((a): a is ActivityDefinition => a !== undefined);
}

export function resolvePrimaryActivity(profileSportIds: string[] | undefined): ActivityDefinition {
  const first = profileSportIds?.[0];
  return getActivityById(first ?? "strength_training") ?? ACTIVITY_LIBRARY[0];
}
