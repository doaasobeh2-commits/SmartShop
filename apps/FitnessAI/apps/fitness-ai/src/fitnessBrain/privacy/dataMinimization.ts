/**
 * Data minimization helpers — gate storage, explain purpose, export/delete/reset.
 */

import { LIFESTYLE_STORAGE_KEY } from "../lifestyle/lifestyleDefaults";
import { ACTIVITY_LOGS_STORAGE_KEY } from "../activity/activityLogStorage";
import { USER_CUSTOM_FOODS_STORAGE_KEY } from "../foodKnowledge/foodSources";
import { BEHAVIOR_LOGS_STORAGE_KEY } from "../storage/behaviorSignals";
import {
  NUTRITION_MEALS_STORAGE_KEY,
  NUTRITION_WATER_STORAGE_KEY,
} from "../storage/nutritionLogStorage";
import { TRAINING_SESSION_STORAGE_KEY } from "../storage/trainingSessionStorage";
import { USER_PROFILE_STORAGE_KEY } from "../storage/userProfileStorage";
import type { LifestyleProfileInput } from "../lifestyle/lifestyleProfile";
import {
  readInstallationScoped,
  readInstallationScopedRaw,
  removeInstallationScoped,
  writeInstallationScoped,
} from "./brainInstallationStorage";
import type { ResetLocalBrainOptions } from "./installationScopedTypes";
import {
  clearLocalInstallationId,
  getLocalInstallationId,
  LOCAL_INSTALLATION_ID_KEY,
} from "./localInstallationId";
import {
  CONSENT_STORAGE_KEY,
  CURRENT_POLICY_VERSION,
  DEFAULT_CONSENT_STATE,
  type ConsentRecord,
  type ConsentScope,
  type DataDeletionScope,
  type DataExportBundle,
  type PrivacyLocale,
} from "./consentTypes";
import {
  ALLOWED_HEALTH_SIGNALS,
  ALLOWED_LIFESTYLE_FIELDS,
  ALLOWED_PROFILE_FIELDS,
  fieldNameIsProhibited,
} from "./privacyRules";

type DataPurposeEntry = {
  purposeDe: string;
  purposeEn: string;
};

const DATA_PURPOSES: Record<string, DataPurposeEntry> = {
  "work.occupationType": {
    purposeDe: "Alltagsaktivität für Trainings- und Erholungsempfehlungen.",
    purposeEn: "Daily activity context for training and recovery guidance.",
  },
  "work.schedule": {
    purposeDe: "Tagesrhythmus für Schlaf- und Trainingsplanung.",
    purposeEn: "Daily rhythm for sleep and training planning.",
  },
  "work.averageWorkingHours": {
    purposeDe: "Belastungsschätzung — keine medizische Bewertung.",
    purposeEn: "Load estimate — not a medical assessment.",
  },
  "training.favouriteSports": {
    purposeDe: "Bevorzugte Aktivitäten für passende Trainingsempfehlungen.",
    purposeEn: "Preferred activities for relevant training suggestions.",
  },
  "training.primarySport": {
    purposeDe: "Hauptsport für sport-spezifische Trainingsentscheidungen.",
    purposeEn: "Primary sport for sport-specific training decisions.",
  },
  "training.usualTrainingDays": {
    purposeDe: "Gewohnte Trainingstage für Wochenplanung.",
    purposeEn: "Usual training days for weekly planning.",
  },
  "training.preferredTrainingTime": {
    purposeDe: "Bevorzugte Tageszeit für Erinnerungen und Fokus.",
    purposeEn: "Preferred time of day for focus and planning.",
  },
  "training.gymMember": {
    purposeDe: "Optional — Kontext für Trainingsvorschläge.",
    purposeEn: "Optional — context for workout suggestions.",
  },
  "training.availableTrainingMinutes": {
    purposeDe: "Bevorzugte Trainingsdauer — Fitness Brain passt die Session an.",
    purposeEn: "Preferred session length — Fitness Brain adapts the session.",
  },
  "training.preferredExerciseCount": {
    purposeDe: "Bevorzugte Übungsanzahl pro Session.",
    purposeEn: "Preferred number of exercises per session.",
  },
  "sleep.usualBedtime": {
    purposeDe: "Schlafenszeit-Routine — kein medizinisches Schlafgutachten.",
    purposeEn: "Bedtime routine — not a clinical sleep assessment.",
  },
  "sleep.usualWakeTime": {
    purposeDe: "Aufstehzeit-Routine für Tagesplanung.",
    purposeEn: "Wake time routine for daily planning.",
  },
  "food.dietaryPreferences": {
    purposeDe: "Ernährungspräferenzen für allgemeine Mahlzeitentipps.",
    purposeEn: "Diet preferences for general meal guidance.",
  },
  "food.allergies": {
    purposeDe: "Lebensmittelvermeidung bei Tipps — kein klinisches Allergieprotokoll.",
    purposeEn: "Food avoidance in tips — not a clinical allergy record.",
  },
  "food.dislikedFoods": {
    purposeDe: "Geschmackspräferenzen für einfachere Empfehlungen.",
    purposeEn: "Taste preferences for simpler suggestions.",
  },
  "lifestyle.smoker": {
    purposeDe: "Optional — allgemeiner Wellness-Kontext.",
    purposeEn: "Optional — general wellness context.",
  },
  "lifestyle.alcohol": {
    purposeDe: "Optional — allgemeiner Wellness-Kontext, keine Beurteilung.",
    purposeEn: "Optional — general wellness context, not judgment.",
  },
  "lifestyle.dailyStressEstimate": {
    purposeDe: "Subjektive Belastung — keine psychologische Diagnose.",
    purposeEn: "Subjective load — not a psychological diagnosis.",
  },
  educationAcknowledged: {
    purposeDe: "Bestätigung der einmaligen Lifestyle-Erklärung.",
    purposeEn: "Acknowledgement of one-time lifestyle explanation.",
  },
  age: {
    purposeDe: "Kalorien- und Trainings-Schätzungen (Formeln).",
    purposeEn: "Calorie and training estimates (formulas).",
  },
  gender: {
    purposeDe: "Stoffwechsel-Schätzung (Mifflin–St Jeor).",
    purposeEn: "Metabolism estimate (Mifflin–St Jeor).",
  },
  heightCm: {
    purposeDe: "Stoffwechsel- und Ernährungsziele.",
    purposeEn: "Metabolism and nutrition targets.",
  },
  weightKg: {
    purposeDe: "Makro- und Hydrationsziele.",
    purposeEn: "Macro and hydration targets.",
  },
  goal: {
    purposeDe: "Personalisierte Fitness-Zielausrichtung.",
    purposeEn: "Personalised fitness goal alignment.",
  },
  activityLevel: {
    purposeDe: "TDEE-Schätzung für Tagesziele.",
    purposeEn: "TDEE estimate for daily targets.",
  },
  sleepHours: {
    purposeDe: "Tägliches Erholungssignal — kein medizinisches Monitoring.",
    purposeEn: "Daily recovery signal — not medical monitoring.",
  },
  waterLiters: {
    purposeDe: "Hydrationsfortschritt für Tagesfokus.",
    purposeEn: "Hydration progress for daily focus.",
  },
  caloriesEaten: {
    purposeDe: "Kalorienfortschritt für Tagesplanung.",
    purposeEn: "Calorie progress for daily planning.",
  },
  proteinEatenG: {
    purposeDe: "Proteinfortschritt für Ernährungsfokus.",
    purposeEn: "Protein progress for nutrition focus.",
  },
  trained: {
    purposeDe: "Trainingsmuster über Zeit — keine Diagnose.",
    purposeEn: "Training patterns over time — not diagnosis.",
  },
  localInstallationId: {
    purposeDe:
      "Anonyme Kennung nur für diese App-Installation — keine Person, kein Name, keine E-Mail.",
    purposeEn:
      "Anonymous key for this app installation only — not a person, name, or email.",
  },
};

const PRIVACY_DISCLAIMERS: Record<PrivacyLocale, string> = {
  de: "FitnessAI speichert nur Daten, die für allgemeine Fitness- und Wellness-Empfehlungen nötig sind. Keine medizinische Beratung, Diagnose oder Behandlung. Sensible Gesundheitsdaten werden nicht im Fitness-Brain-Profil gespeichert.",
  en: "FitnessAI stores only data needed for general fitness and wellness guidance. Not medical advice, diagnosis, or treatment. Sensitive health data is not stored in the Fitness Brain profile.",
  ar: "",
  tr: "",
  uk: "",
  fa: "",
};

const BRAIN_STORAGE_KEYS = [
  LIFESTYLE_STORAGE_KEY,
  BEHAVIOR_LOGS_STORAGE_KEY,
  ACTIVITY_LOGS_STORAGE_KEY,
  USER_CUSTOM_FOODS_STORAGE_KEY,
  CONSENT_STORAGE_KEY,
  LOCAL_INSTALLATION_ID_KEY,
  USER_PROFILE_STORAGE_KEY,
  NUTRITION_MEALS_STORAGE_KEY,
  NUTRITION_WATER_STORAGE_KEY,
  TRAINING_SESSION_STORAGE_KEY,
] as const;

export function isAllowedLifestyleField(fieldName: string): boolean {
  if (fieldNameIsProhibited(fieldName)) return false;
  return ALLOWED_LIFESTYLE_FIELDS.has(fieldName);
}

export function isAllowedProfileField(fieldName: string): boolean {
  if (fieldNameIsProhibited(fieldName)) return false;
  return ALLOWED_PROFILE_FIELDS.has(fieldName);
}

export function shouldStoreHealthSignal(
  signalName: string,
  options?: { enforceOptionalConsent?: boolean },
): boolean {
  if (fieldNameIsProhibited(signalName)) return false;
  if (!ALLOWED_HEALTH_SIGNALS.has(signalName)) return false;

  if (options?.enforceOptionalConsent && signalName === "sleepHours") {
    return hasConsent("optional_sleep_logging");
  }

  return true;
}

export function getDataPurpose(fieldName: string, locale: PrivacyLocale = "de"): string {
  const entry = DATA_PURPOSES[fieldName];
  if (!entry) {
    return locale === "de"
      ? "Nur für allgemeine Fitness-Empfehlungen — keine medizinische Verwendung."
      : "General fitness guidance only — not for medical use.";
  }
  return locale === "de" ? entry.purposeDe : entry.purposeEn;
}

export function getPrivacyDisclaimer(locale: PrivacyLocale = "de"): string {
  const text = PRIVACY_DISCLAIMERS[locale];
  return text || PRIVACY_DISCLAIMERS.de;
}

/** Strips disallowed keys from a lifestyle patch before persistence. */
export function sanitizeLifestylePatch(patch: LifestyleProfileInput): LifestyleProfileInput {
  const clean: LifestyleProfileInput = {};

  if (patch.educationAcknowledged !== undefined && isAllowedLifestyleField("educationAcknowledged")) {
    clean.educationAcknowledged = patch.educationAcknowledged;
  }

  const sections = ["work", "training", "sleep", "food", "lifestyle"] as const;
  for (const section of sections) {
    const data = patch[section];
    if (!data || typeof data !== "object") continue;

    const sectionClean: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      const path = `${section}.${key}`;
      if (isAllowedLifestyleField(path) && value !== undefined) {
        sectionClean[key] = value;
      }
    }
    if (Object.keys(sectionClean).length > 0) {
      (clean as Record<string, unknown>)[section] = sectionClean;
    }
  }

  return clean;
}

export function loadConsentRecords(): ConsentRecord[] {
  return readInstallationScoped<ConsentRecord[]>(CONSENT_STORAGE_KEY) ?? [...DEFAULT_CONSENT_STATE];
}

export function saveConsentRecords(records: ConsentRecord[]): void {
  writeInstallationScoped(CONSENT_STORAGE_KEY, records);
}

export function grantConsent(scope: ConsentScope): ConsentRecord[] {
  const records = loadConsentRecords();
  const next = records.map((r) =>
    r.scope === scope
      ? { ...r, granted: true, grantedAt: new Date().toISOString(), policyVersion: CURRENT_POLICY_VERSION }
      : r,
  );
  saveConsentRecords(next);
  return next;
}

export function hasConsent(scope: ConsentScope): boolean {
  return loadConsentRecords().find((r) => r.scope === scope)?.granted ?? false;
}

/** Prepares a local JSON export of Brain-managed data. */
export function exportBrainData(): DataExportBundle {
  return {
    exportedAt: new Date().toISOString(),
    policyVersion: CURRENT_POLICY_VERSION,
    localInstallationId: getLocalInstallationId(),
    consent: loadConsentRecords(),
    lifestyle: readInstallationScopedRaw(LIFESTYLE_STORAGE_KEY),
    behaviorLogs: readInstallationScopedRaw(BEHAVIOR_LOGS_STORAGE_KEY),
    activityLogs: readInstallationScopedRaw(ACTIVITY_LOGS_STORAGE_KEY),
    userCustomFoods: readInstallationScopedRaw(USER_CUSTOM_FOODS_STORAGE_KEY),
    meta: {
      purpose: getDataPurpose("localInstallationId", "de"),
      note: getPrivacyDisclaimer("de"),
    },
  };
}

/** Deletes Brain-managed data by scope — local only. */
export function deleteBrainData(
  scope: DataDeletionScope,
  options: ResetLocalBrainOptions = {},
): void {
  switch (scope) {
    case "all_brain_data":
      removeInstallationScoped(LIFESTYLE_STORAGE_KEY);
      removeInstallationScoped(BEHAVIOR_LOGS_STORAGE_KEY);
      removeInstallationScoped(ACTIVITY_LOGS_STORAGE_KEY);
      removeInstallationScoped(USER_CUSTOM_FOODS_STORAGE_KEY);
      removeInstallationScoped(CONSENT_STORAGE_KEY);
      removeInstallationScoped(USER_PROFILE_STORAGE_KEY);
      removeInstallationScoped(NUTRITION_MEALS_STORAGE_KEY);
      removeInstallationScoped(NUTRITION_WATER_STORAGE_KEY);
      removeInstallationScoped(TRAINING_SESSION_STORAGE_KEY);
      if (options.resetInstallationId) {
        clearLocalInstallationId();
      }
      break;
    case "lifestyle_only":
      removeInstallationScoped(LIFESTYLE_STORAGE_KEY);
      break;
    case "behavior_logs_only":
      removeInstallationScoped(BEHAVIOR_LOGS_STORAGE_KEY);
      break;
    case "consent_only":
      removeInstallationScoped(CONSENT_STORAGE_KEY);
      break;
  }
}

/** Alias for full local Brain reset. Optionally regenerates localInstallationId. */
export function resetLocalBrainData(
  scope: DataDeletionScope = "all_brain_data",
  options: ResetLocalBrainOptions = {},
): void {
  deleteBrainData(scope, options);
}

export function listBrainStorageKeys(): readonly string[] {
  return BRAIN_STORAGE_KEYS;
}
