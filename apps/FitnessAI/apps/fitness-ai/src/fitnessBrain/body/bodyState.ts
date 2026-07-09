/**
 * Body state types — unified physiological context for Fitness Brain engines.
 */

export type BodyLoadLevel = "low" | "moderate" | "high";

export type BodyEnergyBalance = "deficit" | "maintenance" | "surplus" | "unknown";

export type BodyHydrationStatus = "low" | "moderate" | "adequate" | "unknown";

export type BodyAgeBand = "young" | "adult" | "mature";

export type BodyState = {
  /** Aggregated readiness 0–100 from recovery signals. */
  readinessScore: number;
  energyBalance: BodyEnergyBalance;
  hydrationStatus: BodyHydrationStatus;
  trainingLoad: BodyLoadLevel;
  recoveryCapacity: BodyLoadLevel;
  stressLoad: BodyLoadLevel;
  ageBand: BodyAgeBand;
  sexCategory: "male" | "female" | "other";
  supportingRuleIds: string[];
};

export type BodySignalInput = {
  age: number;
  gender: "male" | "female" | "other";
  caloriesEaten?: number;
  calorieTarget?: number;
  waterConsumed?: number;
  waterGoal?: number;
  activityMinutesToday?: number;
  lastActivityIntensity?: string;
  recoveryScore?: number;
  recoveryLevel?: string;
  dailyStressEstimate?: number;
};
