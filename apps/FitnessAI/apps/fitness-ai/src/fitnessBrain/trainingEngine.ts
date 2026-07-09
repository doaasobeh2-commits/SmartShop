/**
 * Training Engine — today's movement recommendation from sport-specific knowledge.
 * Session logic from knowledge/sportKnowledge + sportSessionBuilder.
 */

import type { NextDayRecommendation } from "./activityRequirements/activityRequirementTypes";
import { getEngineDisclaimer } from "./knowledge";
import { buildSportTrainingSession } from "./knowledge/sportSessionBuilder";
import type { NormalizedUserProfile, RecoveryLevel, TrainingRecommendation } from "./types";

export type TrainingEngineOptions = {
  yesterdayNextDay?: NextDayRecommendation | null;
  yesterdayMuscleGroups?: string[];
  clock?: import("./types").BrainValidationClock;
  primarySportId?: string;
  recoveryLevel?: RecoveryLevel;
  recoveryScore?: number;
  availableTrainingMinutes?: number;
  preferredExerciseCount?: number;
};

export function generateTraining(
  profile: NormalizedUserProfile,
  options: TrainingEngineOptions = {},
): TrainingRecommendation {
  const dayIndex = options.clock?.dayOfWeek ?? new Date().getDay();
  const isTrainingDay = profile.trainingDays.includes(dayIndex);
  const disclaimer = getEngineDisclaimer("training");

  const session = buildSportTrainingSession({
    primarySportId: options.primarySportId ?? profile.primarySportId,
    profile,
    isTrainingDay,
    recoveryLevel: options.recoveryLevel ?? "neutral",
    recoveryScore: options.recoveryScore ?? 50,
    yesterdayNextDay: options.yesterdayNextDay,
    clock: options.clock,
    availableTrainingMinutes: options.availableTrainingMinutes ?? profile.availableTrainingMinutes,
    preferredExerciseCount: options.preferredExerciseCount ?? profile.preferredExerciseCount,
  });

  return {
    ...session,
    isTrainingDay,
    disclaimer,
  };
}
