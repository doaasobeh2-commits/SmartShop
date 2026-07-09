/**
 * Daily Decision Engine — one clear daily action via priority rules.
 * Thresholds from knowledge/; bodyState adjusts sort scores before final selection.
 */

import {
  DECISION_VALUES,
  getDecisionSortScore,
  NUTRITION_VALUES,
} from "./knowledge";
import {
  caloriesEatenValue,
  hydrationValue,
  isHydrationKnown,
  isNutritionKnown,
  isRecoveryEvidencePresent,
  isSleepKnown,
  proteinEatenValue,
} from "./explainability/evidenceSignals";
import { enrichCandidateMeta } from "./explainability/actionRuleMap";
import { finalizeDailyAction } from "./explainability/dailyActionFinalizer";
import { isExperienceKnown, isPrimarySportKnown } from "./profileSignals";
import type { DailyAction, DailyActionCandidate, DecisionContext } from "./types";

const T = NUTRITION_VALUES;
const D = DECISION_VALUES;

function resolveHour(ctx: DecisionContext): number {
  return ctx.clock?.hour ?? new Date().getHours();
}

function resolveDayOfWeek(ctx: DecisionContext): number {
  return ctx.clock?.dayOfWeek ?? new Date().getDay();
}

function hydrationThresholds(ctx: DecisionContext): {
  criticalPct: number;
  lowPct: number;
} {
  const day = resolveDayOfWeek(ctx);
  const isWeekday = day >= 1 && day <= 5;
  const weekdayLowHydration = ctx.lifestyle.patterns.some(
    (p) => p.type === "weekday_low_hydration",
  );

  if (isWeekday && weekdayLowHydration) {
    return {
      criticalPct: T.hydrationCriticalPct + D.weekdayHydrationPatternBump,
      lowPct: T.hydrationLowPct + D.weekdayHydrationPatternBump,
    };
  }
  return { criticalPct: T.hydrationCriticalPct, lowPct: T.hydrationLowPct };
}

function makeCandidate(
  core: Omit<DailyActionCandidate, "selectedBecause" | "supportingRuleIds" | "userSignalsUsed">,
  ctx: DecisionContext,
  extra?: Partial<Pick<DailyActionCandidate, "selectedBecause" | "supportingRuleIds" | "userSignalsUsed">>,
): DailyActionCandidate {
  const meta = enrichCandidateMeta(core, ctx, extra);
  return { ...core, ...meta };
}

/** Applies body-state boosts/penalties to sortScore — wired from existing bodyEngine output. */
function applyBodyStateAdjustments(
  candidate: DailyActionCandidate,
  ctx: DecisionContext,
): DailyActionCandidate {
  const body = ctx.bodyState;
  const b = D.bodyBoosts;
  let delta = 0;

  if (body.hydrationStatus === "low" && candidate.nutritionFocus === "hydration") {
    delta += b.hydrationLowForHydrationAction;
  }
  if (
    body.recoveryCapacity === "low" &&
    (candidate.trainingFocus === "rest" || candidate.id === "recovery_rest")
  ) {
    delta += b.recoveryLowForRestAction;
  }
  if (body.trainingLoad === "high" && candidate.id === "complete_workout") {
    delta -= b.trainingLoadHighWorkoutPenalty;
  }
  if (body.energyBalance === "deficit" && candidate.nutritionFocus === "calorie_awareness") {
    delta += b.energyDeficitCalorieAwarenessBoost;
  }
  if (body.stressLoad === "high" && candidate.trainingFocus === "rest") {
    delta += b.stressHighRestBoost;
  }

  if (delta === 0) return candidate;
  return { ...candidate, sortScore: candidate.sortScore + delta };
}

export function selectDailyActionCandidate(ctx: DecisionContext): DailyActionCandidate {
  const hour = resolveHour(ctx);
  const hydrationKnown = isHydrationKnown(ctx.userData);
  const nutritionKnown = isNutritionKnown(ctx.userData);
  const sleepKnown = isSleepKnown(ctx.userData);

  const proteinEaten = proteinEatenValue(ctx.userData);
  const proteinGoal = ctx.nutrition.proteinG;
  const proteinRemaining =
    proteinEaten !== undefined ? Math.max(proteinGoal - proteinEaten, 0) : proteinGoal;
  const proteinProgress =
    ctx.userData.proteinProgress ??
    (nutritionKnown && proteinGoal > 0 && proteinEaten !== undefined
      ? proteinEaten / proteinGoal
      : undefined);

  const caloriesEaten = caloriesEatenValue(ctx.userData);
  const calorieTarget = ctx.metabolism.dailyCalorieTarget;
  const caloriesRemaining =
    caloriesEaten !== undefined ? calorieTarget - caloriesEaten : calorieTarget;
  const calorieProgress =
    ctx.userData.calorieProgress ??
    (nutritionKnown && calorieTarget > 0 && caloriesEaten !== undefined
      ? caloriesEaten / calorieTarget
      : undefined);

  const waterConsumed = hydrationValue(ctx.userData);
  const waterGoal = ctx.nutrition.waterLiters;
  const waterPct =
    hydrationKnown && waterGoal > 0 && waterConsumed !== undefined
      ? waterConsumed / waterGoal
      : undefined;
  const hydration = hydrationThresholds(ctx);
  const todayActivity = ctx.activityRequirements.todayPrimary;

  const candidates: DailyActionCandidate[] = [];

  // Collect phase — evidence before recommendation (unknown ≠ zero).
  if (!nutritionKnown && hour >= T.hydrationLowAfterHour) {
    candidates.push(
      makeCandidate(
        {
          id: "collect_nutrition_evidence",
          priority: D.priorities.collect_nutrition_evidence,
          nutritionFocus: "consistency",
          trainingFocus: ctx.training.type,
          params: {},
          sortScore: getDecisionSortScore("collect_nutrition_evidence"),
        },
        ctx,
        {
          supportingRuleIds: ["evidence-before-decision", "unknown-not-zero"],
          selectedBecause: [
            "Today's nutrition cannot be evaluated — meal data is incomplete or not logged.",
          ],
          userSignalsUsed: ["caloriesEaten", "proteinEatenG"],
        },
      ),
    );
  }

  if (!hydrationKnown && hour >= T.hydrationCriticalAfterHour) {
    candidates.push(
      makeCandidate(
        {
          id: "collect_hydration_evidence",
          priority: D.priorities.collect_hydration_evidence,
          nutritionFocus: "consistency",
          trainingFocus: ctx.training.type,
          params: {},
          sortScore: getDecisionSortScore("collect_hydration_evidence"),
        },
        ctx,
        {
          supportingRuleIds: ["evidence-before-decision", "unknown-not-zero"],
          selectedBecause: [
            "Hydration status is unknown — missing logs are not treated as 0% intake.",
          ],
          userSignalsUsed: ["waterLitersConsumed", "waterIntake"],
        },
      ),
    );
  }

  if (!sleepKnown && isRecoveryEvidencePresent(ctx.userData) && hour >= 8) {
    candidates.push(
      makeCandidate(
        {
          id: "collect_sleep_evidence",
          priority: D.priorities.collect_sleep_evidence,
          nutritionFocus: "consistency",
          trainingFocus: ctx.training.type,
          params: {},
          sortScore: getDecisionSortScore("collect_sleep_evidence"),
        },
        ctx,
        {
          supportingRuleIds: ["evidence-before-decision", "unknown-not-zero"],
          selectedBecause: [
            "Recovery cannot be fully evaluated — sleep data has not been recorded.",
          ],
          userSignalsUsed: ["sleepHours", "consecutiveTrainingDays"],
        },
      ),
    );
  }

  const sportKnown = isPrimarySportKnown(ctx.lifestyle.profile.training, ctx.userData);
  const experienceKnown = isExperienceKnown(ctx.userProfile);

  if (!sportKnown && hour >= 10) {
    candidates.push(
      makeCandidate(
        {
          id: "collect_primary_sport_evidence",
          priority: D.priorities.collect_primary_sport_evidence,
          nutritionFocus: "consistency",
          trainingFocus: ctx.training.type,
          params: {},
          sortScore: getDecisionSortScore("collect_primary_sport_evidence"),
        },
        ctx,
        {
          supportingRuleIds: ["evidence-before-decision", "sport-knowledge-foundation"],
          selectedBecause: [
            "Primary sport is not set — Fitness Brain operates in lifestyle mode until you choose one.",
          ],
          userSignalsUsed: ["primarySportId"],
        },
      ),
    );
  }

  if (
    sportKnown &&
    !experienceKnown &&
    ctx.training.isTrainingDay &&
    hour >= 9
  ) {
    candidates.push(
      makeCandidate(
        {
          id: "collect_experience_evidence",
          priority: D.priorities.collect_experience_evidence,
          nutritionFocus: "consistency",
          trainingFocus: ctx.training.type,
          params: {},
          sortScore: getDecisionSortScore("collect_experience_evidence"),
        },
        ctx,
        {
          supportingRuleIds: ["evidence-before-decision", "training-recommendation"],
          selectedBecause: [
            "Training experience is unknown — sport-specific program rotation requires your selected level.",
          ],
          userSignalsUsed: ["experienceLevel"],
        },
      ),
    );
  }

  if (todayActivity?.hydrationPriority === "high" && hydrationKnown && waterPct !== undefined && waterPct < hydration.lowPct) {
    candidates.push(
      makeCandidate(
        {
          id: "post_activity_hydration",
          priority: D.priorities.post_activity_hydration,
          nutritionFocus: "hydration",
          trainingFocus: ctx.training.type,
          params: { waterPct: Math.round(waterPct * 100) },
          sortScore: getDecisionSortScore("post_activity_hydration"),
        },
        ctx,
        {
          supportingRuleIds: todayActivity.supportingRuleIds.filter((id) => id.includes("hydration")),
          selectedBecause: ["Logged activity increased hydration need today."],
          userSignalsUsed: ["activityMinutesToday", "lastActivityId"],
        },
      ),
    );
  }

  if (
    todayActivity?.proteinPriority === "high" &&
    nutritionKnown &&
    proteinProgress !== undefined &&
    proteinProgress < T.proteinLowProgressPct + D.postActivityProteinProgressBump
  ) {
    candidates.push(
      makeCandidate(
        {
          id: "post_activity_protein",
          priority: D.priorities.post_activity_protein,
          nutritionFocus: "protein",
          trainingFocus: ctx.training.type,
          params: { proteinRemainingG: Math.round(proteinRemaining) },
          sortScore: getDecisionSortScore("post_activity_protein"),
        },
        ctx,
        {
          supportingRuleIds: todayActivity.supportingRuleIds.filter((id) => id.includes("protein")),
          selectedBecause: ["Recent activity raised protein priority for recovery support."],
          userSignalsUsed: ["proteinEatenG", "lastActivityId", "activityMinutesToday"],
        },
      ),
    );
  }

  if (
    todayActivity &&
    (todayActivity.fuelingNeed === "carb_focused" || todayActivity.fuelingNeed === "balanced_meal") &&
    hour <= D.postActivityFuelMaxHour
  ) {
    candidates.push(
      makeCandidate(
        {
          id: "post_activity_fuel",
          priority: D.priorities.post_activity_fuel,
          nutritionFocus: todayActivity.fuelingNeed === "carb_focused" ? "fuel_training" : "balanced_meals",
          trainingFocus: ctx.training.type,
          params: { activityId: todayActivity.activityId },
          sortScore: getDecisionSortScore("post_activity_fuel"),
        },
        ctx,
        {
          supportingRuleIds: todayActivity.supportingRuleIds.filter(
            (id) => id.includes("carb") || id.includes("meal") || id.includes("fuel"),
          ),
          selectedBecause: [`Activity fueling need: ${todayActivity.fuelingNeed}.`],
          userSignalsUsed: ["lastActivityId", "activityMinutesToday"],
        },
      ),
    );
  }

  if (ctx.recovery.level === "overtraining_risk") {
    candidates.push(
      makeCandidate(
        {
          id: "overtraining_risk",
          priority: D.priorities.overtraining_risk,
          nutritionFocus: "balanced_meals",
          trainingFocus: "rest",
          params: {
            consecutiveDays: ctx.userData.consecutiveTrainingDays ?? 0,
            recoveryScore: ctx.recovery.score,
          },
          sortScore: getDecisionSortScore("overtraining_risk"),
        },
        ctx,
      ),
    );
  } else if (ctx.recovery.level === "low_recovery") {
    candidates.push(
      makeCandidate(
        {
          id: "recovery_rest",
          priority: D.priorities.recovery_rest,
          nutritionFocus: "balanced_meals",
          trainingFocus: "rest",
          params: { recoveryScore: ctx.recovery.score },
          sortScore: getDecisionSortScore("recovery_rest"),
        },
        ctx,
      ),
    );
  }

  if (
    hydrationKnown &&
    waterPct !== undefined &&
    waterPct < hydration.criticalPct &&
    hour >= T.hydrationCriticalAfterHour
  ) {
    candidates.push(
      makeCandidate(
        {
          id: "hydration_critical",
          priority: D.priorities.hydration_critical,
          nutritionFocus: "hydration",
          trainingFocus: ctx.training.type,
          params: { waterPct: Math.round(waterPct * 100) },
          sortScore: getDecisionSortScore("hydration_critical"),
        },
        ctx,
      ),
    );
  } else if (
    hydrationKnown &&
    waterPct !== undefined &&
    waterPct < hydration.lowPct &&
    hour >= T.hydrationLowAfterHour
  ) {
    candidates.push(
      makeCandidate(
        {
          id: "hydration_focus",
          priority: D.priorities.hydration_focus,
          nutritionFocus: "hydration",
          trainingFocus: ctx.training.type,
          params: {
            waterRemainingL: Math.round(Math.max(waterGoal - (waterConsumed ?? 0), 0) * 10) / 10,
          },
          sortScore: getDecisionSortScore("hydration_focus"),
        },
        ctx,
      ),
    );
  }

  if (
    nutritionKnown &&
    proteinProgress !== undefined &&
    proteinProgress < T.proteinLowProgressPct &&
    hour >= T.proteinLowAfterHour
  ) {
    candidates.push(
      makeCandidate(
        {
          id: "protein_low",
          priority: D.priorities.protein_low,
          nutritionFocus: "protein",
          trainingFocus: ctx.training.type,
          params: { proteinRemainingG: Math.round(proteinRemaining) },
          sortScore: getDecisionSortScore("protein_low"),
        },
        ctx,
      ),
    );
  } else if (
    nutritionKnown &&
    proteinProgress !== undefined &&
    proteinRemaining >= T.proteinFocusRemainingG &&
    hour >= T.proteinFocusAfterHour
  ) {
    candidates.push(
      makeCandidate(
        {
          id: "protein_focus",
          priority: D.priorities.protein_focus,
          nutritionFocus: "protein",
          trainingFocus: ctx.training.type,
          params: { proteinRemainingG: Math.round(proteinRemaining) },
          sortScore: getDecisionSortScore("protein_focus"),
        },
        ctx,
      ),
    );
  }

  if (ctx.userData.missedWorkoutYesterday || ctx.userData.missedWorkoutToday) {
    candidates.push(
      makeCandidate(
        {
          id: "missed_workout",
          priority: D.priorities.missed_workout,
          nutritionFocus: "steady_energy",
          trainingFocus: "workout",
          params: { workoutTitle: ctx.training.title },
          sortScore: getDecisionSortScore("missed_workout"),
        },
        ctx,
      ),
    );
  }

  const calorieOver =
    caloriesEaten !== undefined && calorieTarget > 0 ? caloriesEaten - calorieTarget : 0;
  if (
    nutritionKnown &&
    calorieProgress !== undefined &&
    caloriesEaten !== undefined &&
    (calorieOver > T.calorieOverTargetKcal ||
      (caloriesRemaining > T.calorieUnderTargetKcal && hour >= T.calorieCheckAfterHour))
  ) {
    candidates.push(
      makeCandidate(
        {
          id: "calorie_off_track",
          priority: D.priorities.calorie_off_track,
          nutritionFocus: "calorie_awareness",
          trainingFocus: ctx.training.type,
          params: {
            caloriesRemainingKcal: Math.round(caloriesRemaining),
            calorieProgressPct: Math.round(calorieProgress * 100),
          },
          sortScore: getDecisionSortScore("calorie_off_track"),
        },
        ctx,
      ),
    );
  } else if (
    nutritionKnown &&
    calorieProgress !== undefined &&
    caloriesRemaining <= T.calorieBalanceRemainingKcal &&
    caloriesRemaining > 0 &&
    hour >= T.calorieBalanceAfterHour
  ) {
    candidates.push(
      makeCandidate(
        {
          id: "calorie_balance",
          priority: D.priorities.calorie_balance,
          nutritionFocus: "calorie_awareness",
          trainingFocus: ctx.training.type,
          params: { caloriesRemainingKcal: Math.round(caloriesRemaining) },
          sortScore: getDecisionSortScore("calorie_balance"),
        },
        ctx,
      ),
    );
  }

  if (
    ctx.training.type === "workout" &&
    ctx.training.isTrainingDay &&
    sportKnown &&
    experienceKnown &&
    ctx.recovery.level !== "low_recovery" &&
    ctx.recovery.level !== "overtraining_risk"
  ) {
    candidates.push(
      makeCandidate(
        {
          id: "complete_workout",
          priority: D.priorities.complete_workout,
          nutritionFocus: "fuel_training",
          trainingFocus: "workout",
          params: { workoutTitle: ctx.training.title },
          sortScore: getDecisionSortScore("complete_workout"),
        },
        ctx,
      ),
    );
  }

  if (ctx.training.type === "walking" || ctx.training.type === "light_activity") {
    candidates.push(
      makeCandidate(
        {
          id: "movement_day",
          priority: D.priorities.movement_day,
          nutritionFocus: "steady_energy",
          trainingFocus: ctx.training.type,
          params: { activityTitle: ctx.training.title },
          sortScore: getDecisionSortScore("movement_day"),
        },
        ctx,
      ),
    );
  }

  candidates.push(
    makeCandidate(
      {
        id: "steady_progress",
        priority: D.priorities.steady_progress,
        nutritionFocus: "consistency",
        trainingFocus: ctx.training.type,
        params: { streakDays: ctx.userData.streakDays ?? 0 },
        sortScore: getDecisionSortScore("steady_progress"),
      },
      ctx,
    ),
  );

  const adjusted = candidates.map((c) => applyBodyStateAdjustments(c, ctx));
  adjusted.sort((a, b) => b.sortScore - a.sortScore);
  return adjusted[0];
}

export function generateDailyAction(ctx: DecisionContext): DailyAction {
  const candidate = selectDailyActionCandidate(ctx);
  return finalizeDailyAction(candidate, ctx);
}
