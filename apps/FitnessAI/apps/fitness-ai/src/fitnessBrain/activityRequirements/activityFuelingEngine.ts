/**
 * Fueling need engine — post-activity nutrition guidance from activity context.
 * Thresholds from knowledge/activityRequirementValues.
 */

import type { ActivityDefinition } from "../lifestyle/activityLibrary";
import { ACTIVITY_REQUIREMENT_VALUES } from "../knowledge";
import type {
  ActivityRequirementInput,
  EnergyDemandLevel,
  FuelingNeed,
  PriorityLevel,
} from "./activityRequirementTypes";

export type FuelingAssessment = {
  fuelingNeed: FuelingNeed;
  proteinPriority: PriorityLevel;
  hydrationPriority: PriorityLevel;
  ruleIds: string[];
  reasonParts: string[];
};

const V = ACTIVITY_REQUIREMENT_VALUES;
const HYDRATION_HEAVY_IDS = new Set<string>(V.hydrationHeavyActivityIds);

function mapImportance(level: "low" | "moderate" | "high"): PriorityLevel {
  if (level === "high") return "high";
  if (level === "moderate") return "medium";
  return "low";
}

function bumpPriority(level: PriorityLevel): PriorityLevel {
  if (level === "low") return "medium";
  return "high";
}

export function computeFuelingAssessment(
  activity: ActivityDefinition,
  input: ActivityRequirementInput,
  energyDemand: EnergyDemandLevel,
): FuelingAssessment {
  const ruleIds: string[] = [];
  const reasonParts: string[] = [];
  const { durationMinutes, intensity, goal } = input;
  const isHard = intensity === "hard";
  const isLong = durationMinutes >= V.durationLongMin;
  const isVeryLong = durationMinutes >= V.durationVeryLongMin;

  let fuelingNeed: FuelingNeed = "none";

  if (
    durationMinutes < V.durationModerateMin &&
    intensity === "light" &&
    energyDemand === "low"
  ) {
    fuelingNeed = "none";
    ruleIds.push("light-session-minimal-fuel");
    reasonParts.push("Kurze, leichte Einheit");
  } else if (activity.category === "strength" || activity.category === "combat") {
    fuelingNeed = isLong || isHard ? "balanced_meal" : "light_snack";
    ruleIds.push("balanced-meal-strength-goal", "protein-strength-priority");
    reasonParts.push("Kraft- oder Kampfsport");
  } else if (
    isVeryLong ||
    (isLong && isHard) ||
    energyDemand === "very_high" ||
    (activity.category === "cardio" && isLong)
  ) {
    fuelingNeed = "carb_focused";
    ruleIds.push("carb-focused-endurance", "energy-demand-met-duration");
    reasonParts.push("Längere oder intensive Ausdauerbelastung");
  } else if (durationMinutes >= V.durationModerateMin || isHard) {
    fuelingNeed = "light_snack";
    ruleIds.push("energy-demand-met-duration");
    reasonParts.push("Moderate Session");
  }

  let proteinPriority = mapImportance(activity.proteinImportance);
  if (activity.category === "strength" || activity.category === "combat") {
    proteinPriority = "high";
    if (!ruleIds.includes("protein-strength-priority")) {
      ruleIds.push("protein-strength-priority");
    }
  }
  if (isHard && isLong) proteinPriority = "high";
  if (goal === "muscle_gain" && proteinPriority !== "high") {
    proteinPriority = bumpPriority(proteinPriority);
  }

  let hydrationPriority = mapImportance(activity.hydrationImportance);
  if (HYDRATION_HEAVY_IDS.has(activity.id)) {
    hydrationPriority = bumpPriority(hydrationPriority);
    ruleIds.push("hydration-endurance-sports");
    reasonParts.push("Schweißintensive Aktivität");
  }
  if (isLong) hydrationPriority = bumpPriority(hydrationPriority);
  if (isHard) hydrationPriority = bumpPriority(hydrationPriority);
  if (hydrationPriority === "high" && !ruleIds.includes("hydration-endurance-sports")) {
    ruleIds.push("hydration-endurance-sports");
  }

  return { fuelingNeed, proteinPriority, hydrationPriority, ruleIds, reasonParts };
}
