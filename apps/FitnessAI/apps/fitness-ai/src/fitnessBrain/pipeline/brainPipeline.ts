/**
 * Official Fitness Brain execution pipeline.
 * Single canonical order — all engines run through this module.
 */

import { buildActivityRequirementContext } from "../activityRequirements";
import { collectBodySignals, computeBodyState } from "../body";
import type { BodyState } from "../body";
import { generateDailyAction } from "../dailyDecisionEngine";
import { getRecentActivityLogs } from "../activity/activityLogStorage";
import { buildLifestyleIntelligence, resolveEffectiveTrainingDays } from "../lifestyle";
import { calculateMetabolism } from "../metabolismEngine";
import { calculateNutrition } from "../nutritionEngine";
import { assessRecovery } from "../recoveryEngine";
import { getBehaviorLogs } from "../storage/behaviorSignals";
import { generateTraining } from "../trainingEngine";
import type {
  FitnessBrainState,
  GenerateFitnessBrainOptions,
  UserDataInput,
} from "../types";
import { buildUserProfile } from "../userProfileEngine";
import { resolvePrimarySportId } from "../profileSignals";
import { validateBrainState } from "../validation/engineValidators";

/** Documented pipeline stages — order is contractual for all future modules. */
export const BRAIN_PIPELINE_STAGES = [
  "profile",
  "lifestyle",
  "metabolism",
  "nutrition",
  "activity_requirements",
  "recovery",
  "training",
  "behavior_learning",
  "body_engine",
  "knowledge_validation",
  "decision_engine",
  "explainability",
] as const;

export type BrainPipelineStage = (typeof BRAIN_PIPELINE_STAGES)[number];

export type BrainPipelineResult = {
  state: FitnessBrainState;
  bodyState: BodyState;
  stagesExecuted: BrainPipelineStage[];
  /** Output of knowledge_validation stage — all rules linked to scientific sources. */
  validation: ReturnType<typeof validateBrainState>;
};

/**
 * Runs the canonical Fitness Brain pipeline.
 * This is the ONLY supported execution path for full Brain state.
 */
export function runBrainPipeline(
  userData: UserDataInput = {},
  options: GenerateFitnessBrainOptions = {},
): BrainPipelineResult {
  const stagesExecuted: BrainPipelineStage[] = [];
  const behaviorLogs = options.behaviorLogs ?? getBehaviorLogs();
  const activityLogs = options.activityLogs ?? getRecentActivityLogs();

  // 1. Lifestyle (preliminary — informs profile training days)
  stagesExecuted.push("lifestyle");
  const preliminaryLifestyle = buildLifestyleIntelligence({
    appProfile: options.appProfile,
    behaviorLogs,
    activityLogs,
    userData,
  });

  // 2. Profile
  stagesExecuted.push("profile");
  const effectiveTrainingDays =
    userData.lifestyleTrainingDays ??
    userData.trainingDays ??
    resolveEffectiveTrainingDays(preliminaryLifestyle);

  const userProfile = buildUserProfile({
    ...userData,
    trainingDays: effectiveTrainingDays,
    foodPreferences:
      userData.foodPreferences ?? preliminaryLifestyle.profile.food.dietaryPreferences ?? [],
  });

  // Lifestyle (full — with normalized profile)
  const lifestyle = buildLifestyleIntelligence({
    appProfile: options.appProfile,
    behaviorLogs,
    activityLogs,
    userProfile,
    userData,
  });

  // Preliminary recovery for activity requirement context
  const preliminaryRecovery = assessRecovery(userData);

  // 5. Activity requirements (before final recovery/training)
  stagesExecuted.push("activity_requirements");
  const activityRequirements = buildActivityRequirementContext(
    activityLogs,
    userProfile,
    userData,
    preliminaryRecovery.score,
  );

  // 3. Metabolism
  stagesExecuted.push("metabolism");
  const metabolism = calculateMetabolism(userProfile);

  // 4. Nutrition
  stagesExecuted.push("nutrition");
  const nutrition = calculateNutrition(userProfile, metabolism);

  // 6. Recovery (informed by activity requirements)
  stagesExecuted.push("recovery");
  const recovery = assessRecovery(userData, {
    todayActivityRequirement: activityRequirements.todayPrimary,
  });

  // 7. Training (informed by yesterday activity requirements + sport knowledge)
  stagesExecuted.push("training");
  const lifestyleTraining = lifestyle.profile.training;
  const primarySportId = resolvePrimarySportId(lifestyleTraining, userData);

  const training = generateTraining(
    {
      ...userProfile,
      ...(primarySportId ? { primarySportId } : {}),
      availableTrainingMinutes:
        lifestyleTraining.availableTrainingMinutes ?? userData.availableTrainingMinutes,
      preferredExerciseCount:
        lifestyleTraining.preferredExerciseCount ?? userData.preferredExerciseCount,
    },
    {
      yesterdayNextDay: activityRequirements.yesterdayNextDay,
      yesterdayMuscleGroups: activityRequirements.yesterdayPrimary?.muscleGroupLoad,
      clock: options.clock,
      primarySportId,
      recoveryLevel: recovery.level,
      recoveryScore: recovery.score,
      availableTrainingMinutes: lifestyleTraining.availableTrainingMinutes,
      preferredExerciseCount: lifestyleTraining.preferredExerciseCount,
    },
  );

  // 8. Behavior learning (embedded in lifestyle.activityLearning)
  stagesExecuted.push("behavior_learning");

  // Body Engine — aggregates cross-domain signals
  stagesExecuted.push("body_engine");
  const bodySignals = collectBodySignals(
    userProfile,
    userData,
    recovery,
    nutrition,
    metabolism,
    lifestyle,
    activityRequirements,
  );
  const bodyState = computeBodyState(bodySignals);

  // Decision Engine
  stagesExecuted.push("decision_engine");
  const dailyAction = generateDailyAction({
    userProfile,
    metabolism,
    nutrition,
    training,
    recovery,
    userData,
    lifestyle,
    activityRequirements,
    bodyState,
    clock: options.clock,
  });

  // Explainability (applied inside generateDailyAction → finalizeDailyAction)
  stagesExecuted.push("explainability");

  const state: FitnessBrainState = {
    userProfile,
    metabolism,
    nutrition,
    training,
    recovery,
    dailyAction,
    lifestyle,
    brainCompleteness: lifestyle.completeness.score,
    activityRequirements,
    bodyState,
  };

  stagesExecuted.push("knowledge_validation");
  const validation = validateBrainState(state);

  return { state, bodyState, stagesExecuted, validation };
}

/** @deprecated Use runBrainPipeline — alias for backward compatibility. */
export function generateFitnessBrainState(
  userData: UserDataInput = {},
  options: GenerateFitnessBrainOptions = {},
): FitnessBrainState {
  return runBrainPipeline(userData, options).state;
}
