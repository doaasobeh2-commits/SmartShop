/**
 * Body Engine — aggregates cross-domain signals into unified BodyState.
 * Thresholds from body/bodyKnowledge (aligned with nutrition + recovery knowledge).
 */

import { BODY_VALUES } from "./bodyKnowledge";
import type { BodyAgeBand, BodyLoadLevel, BodySignalInput, BodyState } from "./bodyState";

function resolveAgeBand(age: number): BodyAgeBand {
  if (age <= BODY_VALUES.ageYoungMax) return "young";
  if (age >= BODY_VALUES.ageMatureMin) return "mature";
  return "adult";
}

function resolveEnergyBalance(
  eaten?: number,
  target?: number,
): BodyState["energyBalance"] {
  if (eaten === undefined || target === undefined || target <= 0) return "unknown";
  const ratio = eaten / target;
  if (ratio < BODY_VALUES.energyDeficitPct) return "deficit";
  if (ratio > BODY_VALUES.energySurplusPct) return "surplus";
  return "maintenance";
}

function resolveHydrationStatus(
  consumed?: number,
  goal?: number,
): BodyState["hydrationStatus"] {
  if (consumed === undefined || goal === undefined || goal <= 0) return "unknown";
  const pct = consumed / goal;
  if (pct < BODY_VALUES.hydrationLowPct) return "low";
  if (pct >= BODY_VALUES.hydrationAdequatePct) return "adequate";
  if (pct >= BODY_VALUES.hydrationModeratePct) return "moderate";
  return "low";
}

function resolveTrainingLoad(signals: BodySignalInput): BodyLoadLevel {
  const minutes = signals.activityMinutesToday ?? 0;
  const hard = signals.lastActivityIntensity === "hard";
  if (minutes >= BODY_VALUES.activityMinutesHighLoad || hard) return "high";
  if (minutes >= BODY_VALUES.activityMinutesModerateLoad) return "moderate";
  return "low";
}

function resolveRecoveryCapacity(signals: BodySignalInput): BodyLoadLevel {
  const score = signals.recoveryScore ?? 50;
  if (
    score <= BODY_VALUES.recoveryLowMax ||
    signals.recoveryLevel === "low_recovery" ||
    signals.recoveryLevel === "overtraining_risk"
  ) {
    return "low";
  }
  if (score >= BODY_VALUES.recoveryGoodMin) return "high";
  return "moderate";
}

function resolveStressLoad(stress?: number): BodyLoadLevel {
  if (stress === undefined) return "low";
  if (stress >= BODY_VALUES.stressHighThreshold) return "high";
  if (stress >= BODY_VALUES.stressModerateThreshold) return "moderate";
  return "low";
}

/** Computes unified body state from normalized signals. */
export function computeBodyState(signals: BodySignalInput): BodyState {
  const ruleIds = [
    "body-energy-deficit-band",
    "body-hydration-low-band",
    "body-hydration-moderate-band",
    "body-training-load-from-activity",
  ];

  return {
    readinessScore: signals.recoveryScore ?? 50,
    energyBalance: resolveEnergyBalance(signals.caloriesEaten, signals.calorieTarget),
    hydrationStatus: resolveHydrationStatus(signals.waterConsumed, signals.waterGoal),
    trainingLoad: resolveTrainingLoad(signals),
    recoveryCapacity: resolveRecoveryCapacity(signals),
    stressLoad: resolveStressLoad(signals.dailyStressEstimate),
    ageBand: resolveAgeBand(signals.age),
    sexCategory: signals.gender,
    supportingRuleIds: ruleIds,
  };
}
