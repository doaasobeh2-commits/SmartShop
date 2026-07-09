/**
 * Privacy rules — prohibited data and safety-only topics.
 * General fitness guidance only; not medical records.
 */

/** Topics that must NEVER be stored in Brain or lifestyle profiles. */
export const PROHIBITED_PROFILE_TOPICS = [
  "diagnosis",
  "diagnoses",
  "disease",
  "diseases",
  "disorder",
  "medication",
  "medications",
  "prescription",
  "pregnancy",
  "pregnant",
  "eating_disorder",
  "eatingDisorder",
  "anorexia",
  "bulimia",
  "chronic_condition",
  "chronicCondition",
  "medical_history",
  "medicalHistory",
  "icd",
  "treatment_plan",
  "clinical_record",
] as const;

/** Field name substrings that block storage regardless of context. */
export const PROHIBITED_FIELD_PATTERNS: RegExp[] = [
  /diagnos/i,
  /disease/i,
  /disorder/i,
  /medication/i,
  /medicine/i,
  /prescri/i,
  /pregnanc/i,
  /pregnant/i,
  /chronic/i,
  /clinical/i,
  /icd[-_]?\d/i,
  /eating.?disorder/i,
  /anorexia/i,
  /bulimia/i,
  /blood.?pressure/i,
  /heart.?rate.?variability/i,
  /glucose/i,
  /insulin/i,
  /cancer/i,
  /diabetes/i,
  /email/i,
  /e[-_]?mail/i,
  /phone/i,
  /telephone/i,
  /mobile/i,
  /address/i,
  /postcode/i,
  /postal/i,
  /zipcode/i,
  /\bip[-_]?address\b/i,
  /\bipv[46]\b/i,
  /latitude/i,
  /longitude/i,
  /geolocation/i,
  /full[-_]?name/i,
  /\buser[-_]?id\b/i,
];

/** Personal identifiers — never stored in Fitness Brain layers. */
export const FORBIDDEN_PII_FIELDS = new Set([
  "name",
  "fullName",
  "displayName",
  "email",
  "phone",
  "telephone",
  "mobile",
  "address",
  "street",
  "city",
  "postcode",
  "postalCode",
  "zipCode",
  "ipAddress",
  "ip",
  "latitude",
  "longitude",
  "exactLocation",
  "userId",
]);

/**
 * Topics that may appear in user input later — handled as safety warnings only,
 * never persisted to profile or Brain state.
 */
export const SAFETY_ONLY_TOPICS = [
  "pain",
  "dizziness",
  "fainting",
  "severe_fatigue",
  "injury",
  "chest_pain",
  "shortness_of_breath",
] as const;

/** Explicit allow-list for lifestyle profile field paths (dot notation). */
export const ALLOWED_LIFESTYLE_FIELDS = new Set([
  "work.occupationType",
  "work.schedule",
  "work.averageWorkingHours",
  "training.favouriteSports",
  "training.primarySport",
  "training.usualTrainingDays",
  "training.preferredTrainingTime",
  "training.gymMember",
  "training.availableTrainingMinutes",
  "training.preferredExerciseCount",
  "sleep.usualBedtime",
  "sleep.usualWakeTime",
  "food.dietaryPreferences",
  "food.allergies",
  "food.dislikedFoods",
  "lifestyle.smoker",
  "lifestyle.alcohol",
  "lifestyle.dailyStressEstimate",
  "educationAcknowledged",
]);

/** Behavior / health signals permitted for daily wellness tracking. */
export const ALLOWED_HEALTH_SIGNALS = new Set([
  "trained",
  "workoutCompleted",
  "waterLiters",
  "waterIntake",
  "proteinEatenG",
  "proteinProgress",
  "caloriesEaten",
  "calorieProgress",
  "sleepHours",
  "consecutiveTrainingDays",
  "trainedYesterday",
  "dailyAdherence",
  "adherenceScore",
  "exercisesCompletedToday",
  "exercisesTotalToday",
  "lastWorkoutDate",
  "missedWorkoutYesterday",
  "missedWorkoutToday",
  "streakDays",
]);

/** Onboarding fields usable by Brain engines — no personal identifiers. */
export const ALLOWED_PROFILE_FIELDS = new Set([
  "age",
  "gender",
  "heightCm",
  "weightKg",
  "goal",
  "activityLevel",
  "experienceLevel",
  "trainingDays",
  "foodPreferences",
  "lang",
  "streakDays",
  "memberSince",
]);

export function fieldNameIsProhibited(fieldName: string): boolean {
  const normalized = fieldName.trim();
  if (FORBIDDEN_PII_FIELDS.has(normalized)) return true;
  if (PROHIBITED_PROFILE_TOPICS.some((t) => normalized.toLowerCase().includes(t.toLowerCase()))) {
    return true;
  }
  return PROHIBITED_FIELD_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function isSafetyOnlyTopic(topic: string): boolean {
  return (SAFETY_ONLY_TOPICS as readonly string[]).includes(topic);
}
