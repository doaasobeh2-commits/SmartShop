/**
 * Builds rich activity log entries from minimal user input + Activity Library metadata.
 * Energy expenditure: kcal = MET × weight(kg) × duration(h) — Compendium standard formula.
 * @see knowledge/scientificSources — compendium-met-formula, compendium-met-2011
 */

import { getCatalogActivity } from "./activityCatalog";
import type { ActivityIntensity, ActivityLogEntry, SaveActivityLogInput } from "./types";
import { getLocalInstallationId } from "../privacy/localInstallationId";
import { fieldNameIsProhibited } from "../privacy/privacyRules";

const NOTE_MAX_LEN = 150;

const MEDICAL_NOTE_PATTERNS = [
  /schmerz/i,
  /pain/i,
  /verletz/i,
  /injur/i,
  /diagnos/i,
  /medik/i,
  /medication/i,
  /krankheit/i,
  /disease/i,
];

function nowParts(): { date: string; time: string; loggedAt: string } {
  const d = new Date();
  return {
    date: d.toISOString().slice(0, 10),
    time: d.toTimeString().slice(0, 5),
    loggedAt: d.toISOString(),
  };
}

function estimateMet(
  metMin: number,
  metMax: number,
  intensity: ActivityIntensity,
): number {
  // Interpolate within Compendium MET range by perceived intensity (light/moderate/hard).
  switch (intensity) {
    case "light":
      return metMin + (metMax - metMin) * 0.25;
    case "hard":
      return metMin + (metMax - metMin) * 0.85;
    default:
      return (metMin + metMax) / 2;
  }
}

/** @see FORMULA_REGISTRY activity-calories-met — EEE (kcal) = MET × kg × hours */
function estimateCalories(met: number, weightKg: number, durationMinutes: number): number {
  return Math.round(met * weightKg * (durationMinutes / 60));
}

/** Sanitizes optional note — blocks medical/injury content. */
export function sanitizeActivityNote(note?: string): string | undefined {
  if (!note) return undefined;
  const trimmed = note.trim().slice(0, NOTE_MAX_LEN);
  if (!trimmed) return undefined;

  if (fieldNameIsProhibited(trimmed)) return undefined;
  if (MEDICAL_NOTE_PATTERNS.some((p) => p.test(trimmed))) return undefined;

  return trimmed;
}

function newLogId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `act-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function buildActivityLogEntry(input: SaveActivityLogInput): ActivityLogEntry | null {
  const activity = getCatalogActivity(input.activityId);
  if (!activity) return null;

  const weightKg = input.weightKg ?? 75;
  const estimatedMET = Math.round(estimateMet(activity.metMin, activity.metMax, input.intensity) * 10) / 10;
  const estimatedCalories = estimateCalories(estimatedMET, weightKg, input.durationMinutes);
  const { date, time, loggedAt } = nowParts();

  return {
    id: newLogId(),
    activityId: activity.id,
    activityCategory: activity.uiCategory,
    durationMinutes: input.durationMinutes,
    intensity: input.intensity,
    estimatedMET,
    estimatedCalories,
    energySystem: activity.energySystem,
    recoveryPriority: activity.recoveryPriority,
    hydrationImportance: activity.hydrationImportance,
    proteinImportance: activity.proteinImportance,
    date,
    time,
    optionalNote: sanitizeActivityNote(input.optionalNote),
    localInstallationId: getLocalInstallationId(),
    loggedAt,
  };
}
