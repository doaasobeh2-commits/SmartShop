/**
 * Maps daily action IDs to knowledge rule IDs and human-readable selection reasons.
 */

import {
  EVIDENCE_LEVEL_ORDER,
  NUTRITION_RULES,
  RECOVERY_RULES,
  SAFETY_RULES,
  TRAINING_RULES,
  type EvidenceLevel,
} from "../knowledge";
import { BODY_KNOWLEDGE_RULES } from "../body/bodyKnowledge";
import { ACTIVITY_REQUIREMENT_RULES } from "../activityRequirements/activityRequirementRules";
import type { DecisionContext, DailyActionCandidate } from "../types";

const ALL_RULES = [
  ...NUTRITION_RULES,
  ...TRAINING_RULES,
  ...RECOVERY_RULES,
  ...SAFETY_RULES,
  ...ACTIVITY_REQUIREMENT_RULES,
  ...BODY_KNOWLEDGE_RULES,
];
const RULE_EVIDENCE = new Map(ALL_RULES.map((r) => [r.id, r.evidenceLevel]));

function proteinRuleForGoal(goal: DecisionContext["userProfile"]["goal"]): string {
  switch (goal) {
    case "fat_loss":
      return "protein-fat-loss";
    case "muscle_gain":
      return "protein-muscle-gain";
    default:
      return "protein-maintenance";
  }
}

function trainingFrequencyRule(experience: DecisionContext["userProfile"]["experienceLevel"]): string {
  if (experience === "beginner") return "beginner-frequency";
  if (experience === "unknown") return "general-fitness-guidance-only";
  return "intermediate-frequency";
}

type ActionMeta = {
  supportingRuleIds: string[];
  selectedBecause: string[];
  userSignalsUsed: string[];
};

export function enrichCandidateMeta(
  candidate: Pick<DailyActionCandidate, "id">,
  ctx: DecisionContext,
  extra?: Partial<ActionMeta>,
): ActionMeta {
  const base = getActionMeta(candidate.id, ctx);
  return {
    supportingRuleIds: [...base.supportingRuleIds, ...(extra?.supportingRuleIds ?? [])],
    selectedBecause: [...base.selectedBecause, ...(extra?.selectedBecause ?? [])],
    userSignalsUsed: [...new Set([...base.userSignalsUsed, ...(extra?.userSignalsUsed ?? [])])],
  };
}

function getActionMeta(actionId: string, ctx: DecisionContext): ActionMeta {
  const { userProfile, recovery, training, userData } = ctx;

  switch (actionId) {
    case "overtraining_risk":
      return {
        supportingRuleIds: [
          "overtraining-risk-signals",
          "consecutive-training-caution",
          "general-fitness-guidance-only",
        ],
        selectedBecause: [
          "Recovery engine flagged possible overtraining risk from consecutive training load.",
        ],
        userSignalsUsed: ["consecutiveTrainingDays", "trainedYesterday", "sleepHours"],
      };

    case "recovery_rest":
      return {
        supportingRuleIds: ["recovery-score-bands", "poor-sleep-caution", "consecutive-training-caution"],
        selectedBecause: [`Recovery score ${recovery.score} indicates low readiness.`],
        userSignalsUsed: ["consecutiveTrainingDays", "sleepHours", "dailyAdherence"],
      };

    case "hydration_critical":
      return {
        supportingRuleIds: ["hydration-critical-threshold", "hydration-body-weight"],
        selectedBecause: ["Water intake is critically below today's hydration target after mid-morning."],
        userSignalsUsed: ["waterIntake", "waterLitersConsumed"],
      };

    case "hydration_focus":
      return {
        supportingRuleIds: ["hydration-body-weight"],
        selectedBecause: ["Water intake is below 50% of today's hydration target."],
        userSignalsUsed: ["waterIntake", "waterLitersConsumed"],
      };

    case "post_activity_hydration":
      return {
        supportingRuleIds: ["hydration-endurance-sports", "hydration-body-weight"],
        selectedBecause: [
          "A logged activity today increased hydration priority.",
          ctx.activityRequirements.todayPrimary?.reason ?? "",
        ],
        userSignalsUsed: ["waterIntake", "activityMinutesToday", "lastActivityId"],
      };

    case "post_activity_protein":
      return {
        supportingRuleIds: ["protein-strength-priority", proteinRuleForGoal(userProfile.goal)],
        selectedBecause: [
          "Recent activity raised protein priority for general recovery support.",
        ],
        userSignalsUsed: ["proteinEatenG", "lastActivityId", "activityMinutesToday"],
      };

    case "post_activity_fuel":
      return {
        supportingRuleIds: ["carb-focused-endurance", "balanced-meal-strength-goal"],
        selectedBecause: [
          `Post-activity fueling need: ${ctx.activityRequirements.todayPrimary?.fuelingNeed ?? "balanced"}.`,
        ],
        userSignalsUsed: ["lastActivityId", "activityMinutesToday"],
      };

    case "protein_low":
      return {
        supportingRuleIds: ["protein-low-threshold", proteinRuleForGoal(userProfile.goal)],
        selectedBecause: ["Protein progress is below 40% of daily target in the afternoon."],
        userSignalsUsed: ["proteinEatenG", "proteinProgress"],
      };

    case "protein_focus":
      return {
        supportingRuleIds: [proteinRuleForGoal(userProfile.goal), "meal-balance-macros"],
        selectedBecause: ["Meaningful protein gap remains before end of day."],
        userSignalsUsed: ["proteinEatenG", "proteinProgress"],
      };

    case "missed_workout":
      return {
        supportingRuleIds: [trainingFrequencyRule(userProfile.experienceLevel), "rest-day-logic"],
        selectedBecause: [
          userData.missedWorkoutYesterday
            ? "A planned training day was missed yesterday."
            : "Today's planned training window is passing without completion.",
        ],
        userSignalsUsed: ["missedWorkoutYesterday", "missedWorkoutToday", "exercisesCompletedToday"],
      };

    case "calorie_off_track":
      return {
        supportingRuleIds: ["calorie-off-track-threshold", "calorie-deficit-safe-range", "meal-balance-macros"],
        selectedBecause: ["Calorie intake is significantly above or below today's energy target."],
        userSignalsUsed: ["caloriesEaten", "calorieProgress"],
      };

    case "calorie_balance":
      return {
        supportingRuleIds: ["meal-balance-macros", "calorie-deficit-safe-range"],
        selectedBecause: ["Remaining calories are within a narrow band of the daily target."],
        userSignalsUsed: ["caloriesEaten", "calorieProgress"],
      };

    case "complete_workout":
      return {
        supportingRuleIds: [
          trainingFrequencyRule(userProfile.experienceLevel),
          "progressive-overload-basics",
          "good-sleep-support",
        ],
        selectedBecause: [
          "Today is a planned training day and recovery level allows training.",
          `Recommended session: ${training.title}.`,
        ],
        userSignalsUsed: ["exercisesCompletedToday", "consecutiveTrainingDays", "sleepHours"],
      };

    case "movement_day":
      return {
        supportingRuleIds: ["light-activity-recommendation", "rest-day-logic", "fat-loss-walking"],
        selectedBecause: ["Today is a rest or light-movement day in the training plan."],
        userSignalsUsed: ["trainingDays"],
      };

    case "collect_nutrition_evidence":
      return {
        supportingRuleIds: ["evidence-before-decision", "unknown-not-zero", "analysis-before-suggestion"],
        selectedBecause: [
          "Today's nutrition cannot be evaluated — meal data is incomplete or not logged.",
          "Collect phase: analysis and recommendations require logged intake.",
        ],
        userSignalsUsed: ["caloriesEaten", "proteinEatenG", "proteinProgress"],
      };

    case "collect_hydration_evidence":
      return {
        supportingRuleIds: ["evidence-before-decision", "unknown-not-zero"],
        selectedBecause: [
          "Hydration status is unknown — missing logs are not treated as 0% intake.",
          "Collect phase: hydration assessment requires a logged water entry.",
        ],
        userSignalsUsed: ["waterLitersConsumed", "waterIntake"],
      };

    case "collect_sleep_evidence":
      return {
        supportingRuleIds: ["evidence-before-decision", "unknown-not-zero", "poor-sleep-caution"],
        selectedBecause: [
          "Recovery cannot be fully evaluated — sleep data has not been recorded.",
          "Unknown sleep is not interpreted as poor sleep.",
        ],
        userSignalsUsed: ["sleepHours", "consecutiveTrainingDays", "trainedYesterday"],
      };

    case "collect_primary_sport_evidence":
      return {
        supportingRuleIds: ["evidence-before-decision", "sport-knowledge-foundation"],
        selectedBecause: [
          "Primary sport is not set — sport-specific training cannot be personalized yet.",
          "Collect phase: choose Healthy Lifestyle, Start Training, or Already Practice a Sport.",
        ],
        userSignalsUsed: ["primarySportId"],
      };

    case "collect_experience_evidence":
      return {
        supportingRuleIds: ["evidence-before-decision", "training-recommendation"],
        selectedBecause: [
          "Training experience is unknown — program rotation requires an explicit level.",
          "Experience is never defaulted to beginner or intermediate.",
        ],
        userSignalsUsed: ["experienceLevel"],
      };

    case "steady_progress":
    default:
      return {
        supportingRuleIds: ["high-adherence-support", "general-fitness-guidance-only"],
        selectedBecause: ["No higher-priority signal triggered — consistency is the focus."],
        userSignalsUsed: ["streakDays", "dailyAdherence"],
      };
  }
}

export function getEvidenceLevelForRules(ruleIds: string[]): EvidenceLevel {
  let bestIndex = EVIDENCE_LEVEL_ORDER.length - 1;
  for (const id of ruleIds) {
    const level = RULE_EVIDENCE.get(id);
    if (!level) continue;
    const idx = EVIDENCE_LEVEL_ORDER.indexOf(level);
    if (idx >= 0 && idx < bestIndex) bestIndex = idx;
  }
  return EVIDENCE_LEVEL_ORDER[bestIndex];
}
