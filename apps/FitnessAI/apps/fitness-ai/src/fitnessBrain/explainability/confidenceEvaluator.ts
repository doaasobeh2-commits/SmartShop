/**
 * Confidence scoring for daily actions based on available user signals.
 * Thresholds from knowledge/safetyRules EXPLAINABILITY_VALUES.
 */

import { EXPLAINABILITY_VALUES } from "../knowledge";
import { countMatchingSignals, type UserSignalSnapshot } from "./userSignals";
import type { DailyActionCandidate } from "../types";

export function computeActionConfidence(
  candidate: DailyActionCandidate,
  snapshot: UserSignalSnapshot,
): "high" | "medium" | "low" {
  const matched = countMatchingSignals(snapshot.presentSignals, candidate.userSignalsUsed);
  const v = EXPLAINABILITY_VALUES;

  if (candidate.id === "steady_progress" && snapshot.defaultsHeavy) {
    return "low";
  }

  if (matched >= v.confidenceHighMinSignals) return "high";
  if (matched >= v.confidenceMediumMinSignals || !snapshot.defaultsHeavy) return "medium";
  return "low";
}
