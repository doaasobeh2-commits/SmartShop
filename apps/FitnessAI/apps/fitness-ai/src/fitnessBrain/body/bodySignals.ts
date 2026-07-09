/**
 * Body signals — normalizes user inputs into body-relevant signal bundle.
 */

import type { ActivityRequirementContext } from "../activityRequirements/activityRequirementTypes";
import type { LifestyleIntelligence, StressLevel } from "../lifestyle/lifestyleProfile";
import type { RecoveryAssessment, UserDataInput, NormalizedUserProfile } from "../types";
import { BODY_VALUES } from "./bodyKnowledge";
import type { BodySignalInput } from "./bodyState";

function mapStressLevel(stress?: StressLevel): number | undefined {
  if (!stress) return undefined;
  return BODY_VALUES.stressLevelNumeric[stress];
}

export function collectBodySignals(
  userProfile: NormalizedUserProfile,
  userData: UserDataInput,
  recovery: RecoveryAssessment,
  nutrition: { waterLiters: number },
  metabolism: { dailyCalorieTarget: number },
  lifestyle: LifestyleIntelligence,
  activityRequirements: ActivityRequirementContext,
): BodySignalInput {
  const todayReq = activityRequirements.todayPrimary;

  return {
    age: userProfile.age,
    gender: userProfile.gender,
    caloriesEaten: userData.caloriesEaten,
    calorieTarget: metabolism.dailyCalorieTarget,
    waterConsumed: userData.waterLitersConsumed ?? userData.waterIntake,
    waterGoal: nutrition.waterLiters,
    activityMinutesToday: userData.activityMinutesToday,
    lastActivityIntensity: userData.lastActivityIntensity ?? todayReq?.energyDemand,
    recoveryScore: recovery.score,
    recoveryLevel: recovery.level,
    dailyStressEstimate: mapStressLevel(lifestyle.profile.lifestyle?.dailyStressEstimate),
  };
}
