export type EngineStatus = "ACTIVE" | "DEGRADED" | "WARNING";

export type EngineId =
  | "household"
  | "taste"
  | "shopping"
  | "recipe"
  | "nutrition"
  | "fitness";

export type IntelligenceEngine = {
  id: EngineId;
  name: string;
  description: string;
  status: EngineStatus;
  confidence: number;
  signalsProcessed: number;
  lastRun: string;
  details: {
    inputSources: string[];
    outputTargets: string[];
    decisionRules: string[];
    confidenceTrend: string;
    reinforcementStatus: string;
    lastUpdate: string;
    processingQueue: number;
    recentWarnings: string[];
  };
};

export const intelligenceEngines: IntelligenceEngine[] = [
  {
    id: "household",
    name: "Household Intelligence Engine",
    description:
      "Aggregates cross-app signals into unified household behavioral profiles.",
    status: "ACTIVE",
    confidence: 89,
    signalsProcessed: 284920,
    lastRun: "34s ago",
    details: {
      inputSources: [
        "SmartShop purchase signals",
        "Recipe meal completions",
        "Fitness activity sessions",
        "Household profile graph",
      ],
      outputTargets: [
        "Unified household profile",
        "Cross-app hypothesis graph",
        "Admin confidence rollup",
      ],
      decisionRules: [
        "Require ≥2 app sources before promoting a household hypothesis",
        "Decay unused affinities after 21 days of silence",
        "Never expose personal identifiers in admin surfaces",
      ],
      confidenceTrend: "+2.1% over 7 days",
      reinforcementStatus: "Stable — positive feedback from shopping completions",
      lastUpdate: "2026-07-17 16:48:12 UTC",
      processingQueue: 18,
      recentWarnings: [],
    },
  },
  {
    id: "taste",
    name: "Taste Intelligence Engine",
    description:
      "Infers dietary preferences, cultural affinities, and taste profiles.",
    status: "ACTIVE",
    confidence: 87,
    signalsProcessed: 198340,
    lastRun: "1m ago",
    details: {
      inputSources: [
        "Recipe ratings & skips",
        "Cuisine affinity signals",
        "Allergen confirmations",
        "Pantry correction events",
      ],
      outputTargets: [
        "Taste profile vectors",
        "Cuisine affinity scores",
        "Recipe ranking priors",
      ],
      decisionRules: [
        "Weight explicit allergen gates above inferred preferences",
        "Down-rank cuisines with repeated skip streaks",
        "Boost plant-based signals when reinforced ≥3 times/week",
      ],
      confidenceTrend: "+0.8% over 7 days",
      reinforcementStatus: "Learning — South Asian affinity rising",
      lastUpdate: "2026-07-17 16:47:41 UTC",
      processingQueue: 42,
      recentWarnings: [],
    },
  },
  {
    id: "shopping",
    name: "Shopping Intelligence Engine",
    description:
      "Analyzes purchase patterns, frequency, brand affinity, and budget signals.",
    status: "ACTIVE",
    confidence: 92,
    signalsProcessed: 412810,
    lastRun: "12s ago",
    details: {
      inputSources: [
        "Trip-complete baskets",
        "Offer redemption events",
        "Merchant distance policy",
        "Budget envelope signals",
      ],
      outputTargets: [
        "Purchase frequency hypotheses",
        "Brand affinity scores",
        "SmartShop decision cards",
      ],
      decisionRules: [
        "Prefer local merchants within household shopping radius",
        "Suppress out-of-budget promotions on free tier",
        "Reinforce staples after 2 consecutive repurchase cycles",
      ],
      confidenceTrend: "+1.4% over 7 days",
      reinforcementStatus: "Strong — high trip-complete reinforcement rate",
      lastUpdate: "2026-07-17 16:48:34 UTC",
      processingQueue: 7,
      recentWarnings: [],
    },
  },
  {
    id: "recipe",
    name: "Recipe Recommendation Engine",
    description:
      "Generates personalized recipe matches based on taste, nutrition, and locale signals.",
    status: "ACTIVE",
    confidence: 78,
    signalsProcessed: 134590,
    lastRun: "2m ago",
    details: {
      inputSources: [
        "Taste profile vectors",
        "Hidden inventory projections",
        "Nutrition targets",
        "Locale & cuisine priors",
      ],
      outputTargets: [
        "Tonight recommendation",
        "Cook-mode ingredient plan",
        "SmartShop handoff list",
      ],
      decisionRules: [
        "Fail closed on unresolved allergen conflicts",
        "Prefer recipes using ≥60% projected pantry coverage",
        "Limit exploration recipes to 1 per evening on free tier",
      ],
      confidenceTrend: "-1.2% over 7 days",
      reinforcementStatus: "Warming — waiting on more cook completions",
      lastUpdate: "2026-07-17 16:46:58 UTC",
      processingQueue: 63,
      recentWarnings: [
        "Locale coverage thin for Romanian cuisine cohort",
      ],
    },
  },
  {
    id: "nutrition",
    name: "Nutrition Engine",
    description:
      "Maps meal intake patterns to nutritional targets and dietary requirements.",
    status: "ACTIVE",
    confidence: 81,
    signalsProcessed: 89220,
    lastRun: "3m ago",
    details: {
      inputSources: [
        "Meal log events",
        "Recipe macro estimates",
        "Fitness energy expenditure",
        "Dietary requirement flags",
      ],
      outputTargets: [
        "Daily macro targets",
        "Nutrition confidence score",
        "Eat-screen focus metric",
      ],
      decisionRules: [
        "Prefer deterministic formulas on free tier",
        "Flag confidence below target when meal logs are sparse",
        "Never override medical dietary constraints",
      ],
      confidenceTrend: "Flat (±0.3%) over 7 days",
      reinforcementStatus: "Monitoring — sparse meal logs in 12% of households",
      lastUpdate: "2026-07-17 16:45:51 UTC",
      processingQueue: 29,
      recentWarnings: [
        "Nutrition engine confidence below target for cohort N-14",
      ],
    },
  },
  {
    id: "fitness",
    name: "Fitness Engine",
    description:
      "Tracks fitness activity signals and aligns with nutrition and meal planning.",
    status: "DEGRADED",
    confidence: 74,
    signalsProcessed: 67480,
    lastRun: "5m ago",
    details: {
      inputSources: [
        "Activity session logs",
        "Recovery signals",
        "Body metrics (local)",
        "Nutrition expenditure bridge",
      ],
      outputTargets: [
        "Today training focus",
        "Recovery recommendation",
        "Calorie adjustment projection",
      ],
      decisionRules: [
        "Prefer recovery when latency or fatigue signals elevate",
        "Align protein targets with training load bands",
        "Keep body metrics installation-scoped and local-first",
      ],
      confidenceTrend: "-2.8% over 7 days",
      reinforcementStatus: "Degraded — sync latency elevated (287ms)",
      lastUpdate: "2026-07-17 16:43:22 UTC",
      processingQueue: 114,
      recentWarnings: [
        "Fitness AI sync latency elevated (287ms)",
        "Activity batch backlog above soft threshold",
      ],
    },
  },
];

export function confidenceBarTone(confidence: number): "green" | "amber" | "red" {
  if (confidence >= 85) return "green";
  if (confidence >= 75) return "amber";
  return "red";
}

export function formatSignals(value: number): string {
  return value.toLocaleString("en-US");
}

export function statusToBadge(
  status: EngineStatus,
): "HEALTHY" | "DEGRADED" | "WARNING" {
  if (status === "ACTIVE") return "HEALTHY";
  if (status === "DEGRADED") return "DEGRADED";
  return "WARNING";
}
