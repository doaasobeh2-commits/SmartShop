/**
 * Activity requirement thresholds — owned by Knowledge layer.
 * Energy load bands use Compendium MET × duration × intensity weight.
 * @see scientificSources — compendium-met-2011, acsm-endurance-fueling
 */
export const ACTIVITY_REQUIREMENT_VALUES = {
  /** Duration thresholds (minutes). */
  durationShortMax: 30,
  durationModerateMin: 30,
  durationLongMin: 45,
  durationVeryLongMin: 60,
  durationStrengthHardMin: 40,
  customDurationMin: 5,
  customDurationMax: 300,

  /** Energy demand load score bands (MET × minutes × intensity factor). */
  energyLoadModerateMin: 120,
  energyLoadHighMin: 280,
  energyLoadVeryHighMin: 450,

  /** Intensity multipliers for load scoring. */
  intensityWeight: {
    light: 0.85,
    moderate: 1.0,
    hard: 1.25,
  },

  /** Recovery readiness — aligned with RECOVERY_VALUES (low ≤ 44, normal ≥ 45). */
  recoveryScoreLowMax: 44,
  recoveryScoreModerateMax: 65,

  /** Consecutive training days before load bump. */
  consecutiveTrainingDaysCaution: 3,

  /** Activity IDs with elevated hydration emphasis. */
  hydrationHeavyActivityIds: [
    "running",
    "swimming",
    "cycling",
    "football",
    "basketball",
    "tennis",
    "badminton",
    "volleyball",
    "rowing",
    "hiking",
  ] as const,

  lowerBodyMuscleGroups: ["legs", "full_body"] as const,
} as const;
