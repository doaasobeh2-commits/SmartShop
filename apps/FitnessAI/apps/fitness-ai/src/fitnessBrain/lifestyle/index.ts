export type {
  LifestyleProfile,
  LifestyleProfileInput,
  LifePattern,
  LifePatternType,
  LifePatternConfidence,
  LifestyleIntelligence,
  BrainCompleteness,
  BrainCompletenessFactor,
  BrainCompletenessFactorId,
  OccupationType,
  WorkSchedule,
  PreferredTrainingTime,
  AlcoholFrequency,
  StressLevel,
} from "./lifestyleProfile";

export {
  DEFAULT_LIFESTYLE_PROFILE,
  LIFESTYLE_PROFILE_VERSION,
  LIFESTYLE_STORAGE_KEY,
  PATTERN_MIN_DAYS_EMERGING,
  PATTERN_MIN_DAYS_ESTABLISHED,
} from "./lifestyleDefaults";

export {
  ACTIVITY_LIBRARY,
  getActivityById,
  getActivitiesByIds,
  resolvePrimaryActivity,
  type ActivityDefinition,
  type ActivityCategory,
} from "./activityLibrary";

export { detectLifePatterns } from "./lifePatternEngine";
export { computeBrainCompleteness } from "./brainCompleteness";

export {
  buildLifestyleIntelligence,
  resolveEffectiveTrainingDays,
  resolveHydrationEmphasis,
  loadLifestyleProfile,
  saveLifestyleProfile,
  updateLifestyleProfile,
  mergeAppProfileIntoLifestyle,
  isLifestyleProfileCustomized,
  type BuildLifestyleOptions,
} from "./lifestyleEngine";

export {
  getLifestyleEducation,
  LIFESTYLE_EDUCATION,
  type LifestyleEducationCopy,
  type LifestyleEducationLocale,
} from "./i18n/educationStrings";

export {
  getLifestyleSetupStrings,
  LIFESTYLE_SETUP_STRINGS,
  ACTIVITY_LABELS_DE,
  activityLabelDe,
  type LifestyleSetupStrings,
  type LifestyleSetupLocale,
} from "./i18n/setupStrings";
