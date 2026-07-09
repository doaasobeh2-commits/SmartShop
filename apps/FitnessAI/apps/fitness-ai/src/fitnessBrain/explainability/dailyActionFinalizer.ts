/**
 * Finalizes a daily action candidate with localization, confidence, and explanation.
 */

import { localizeDailyAction } from "../i18n/strings";
import type { DailyAction, DailyActionCandidate, DecisionContext } from "../types";
import { getEvidenceLevelForRules } from "./actionRuleMap";
import { computeActionConfidence } from "./confidenceEvaluator";
import { applySafetyFilterToCandidate, ensureSafetyRulesListed } from "./safetyFilter";
import { snapshotUserSignals } from "./userSignals";

export function finalizeDailyAction(
  candidate: DailyActionCandidate,
  ctx: DecisionContext,
): DailyAction {
  const localized = localizeDailyAction(candidate.id, candidate.params, "de");
  const safety = applySafetyFilterToCandidate(candidate, localized);

  const finalCandidate = safety.action;
  const finalLocalized =
    safety.wasAdjusted && finalCandidate.id !== candidate.id
      ? localizeDailyAction(finalCandidate.id, finalCandidate.params, "de")
      : localized;

  const snapshot = snapshotUserSignals(ctx.userData);
  const supportingRuleIds = ensureSafetyRulesListed(finalCandidate.supportingRuleIds);
  const confidence = computeActionConfidence(finalCandidate, snapshot);

  return {
    id: finalCandidate.id,
    title: finalLocalized.title,
    message: finalLocalized.message,
    reason: finalLocalized.reason,
    priority: finalCandidate.priority,
    nutritionFocus: finalCandidate.nutritionFocus,
    trainingFocus: finalCandidate.trainingFocus,
    confidence,
    params: finalCandidate.params,
    explanation: {
      selectedBecause: finalCandidate.selectedBecause,
      supportingRuleIds,
      blockedBySafetyRules: safety.blockedBySafetyRules,
      evidenceLevel: getEvidenceLevelForRules(supportingRuleIds),
      userSignalsUsed: finalCandidate.userSignalsUsed.filter((s) =>
        snapshot.presentSignals.includes(s) ||
        (s === "waterIntake" && snapshot.presentSignals.includes("waterLitersConsumed")) ||
        (s === "dailyAdherence" && snapshot.presentSignals.includes("adherenceScore")),
      ),
    },
  };
}
