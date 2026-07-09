/** Shared types for the Fitness Brain rule-based decision system. */

export type EngineId =
  | "profile"
  | "goal"
  | "calories"
  | "nutrition"
  | "foodKnowledge"
  | "workout"
  | "habit"
  | "recommendation"
  | "sleep"
  | "recovery"
  | "stress"
  | "health"
  | "supplement";

export type ExplanationStep = {
  label: string;
  value: string;
  formula?: string;
};

/** Transparent reasoning attached to every Brain output. */
export type BrainExplanation = {
  id: string;
  engine: EngineId;
  title: string;
  summary: string;
  steps: ExplanationStep[];
  references: string[];
};

export type Explainable<T> = {
  value: T;
  explanation: BrainExplanation;
};

export type RecommendationCategory =
  | "calories"
  | "protein"
  | "hydration"
  | "workout"
  | "meal"
  | "recovery"
  | "habit";

export type RecommendationTone = "motivation" | "nutrition" | "recovery" | "workout";

/** Rule-based recommendation — never random, always traceable to an engine. */
export type BrainRecommendation = {
  id: string;
  category: RecommendationCategory;
  priority: number;
  title: string;
  body: string;
  tone: RecommendationTone;
  explanation: BrainExplanation;
  ruleId: string;
};

export type CalorieTargets = {
  bmrKcal: number;
  tdeeKcal: number;
  dailyTargetKcal: number;
  deficitOrSurplusKcal: number;
};

export type MacroTargets = {
  proteinGoalG: number;
  carbsGoalG: number;
  fatGoalG: number;
  fibreGoalG: number;
};

export type MacroTotals = {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fibreG: number;
};

export type HydrationTargets = {
  goalLiters: number;
  consumedLiters: number;
  remainingLiters: number;
};

export type DailyBrainSnapshot = {
  date: string;
  calorieTargets: Explainable<CalorieTargets>;
  macroTargets: Explainable<MacroTargets>;
  macroTotals: MacroTotals;
  hydration: Explainable<HydrationTargets>;
  recommendations: BrainRecommendation[];
};
