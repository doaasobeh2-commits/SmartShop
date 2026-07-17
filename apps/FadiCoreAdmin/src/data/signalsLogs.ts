export type SignalType =
  | "PURCHASE"
  | "RECIPE"
  | "FITNESS"
  | "LOCALE"
  | "MEAL";

export type SignalCategoryFilter = "ALL" | SignalType;

export type SignalApp = "SmartShop" | "Recipe AI" | "Fitness AI" | "Core";

export type BehavioralSignal = {
  id: string;
  type: SignalType;
  householdId: string;
  description: string;
  confidence: number;
  app: SignalApp;
  time: string;
  details: {
    sourceEngine: string;
    processingHistory: string[];
    confidenceEvolution: string[];
    relatedInferenceIds: string[];
    metadata: Record<string, string>;
  };
};

export type LogSeverity = "INFO" | "WARN" | "ERROR";

export type InferenceLogEntry = {
  id: string;
  timestamp: string;
  engine: string;
  inferenceType: string;
  message: string;
  severity: LogSeverity;
};

export const signalCategories: SignalCategoryFilter[] = [
  "ALL",
  "PURCHASE",
  "RECIPE",
  "FITNESS",
  "LOCALE",
  "MEAL",
];

export const behavioralSignals: BehavioralSignal[] = [
  {
    id: "SIG-88291",
    type: "PURCHASE",
    householdId: "HH-7823",
    description: "Organic grocery basket detected",
    confidence: 94,
    app: "SmartShop",
    time: "2m ago",
    details: {
      sourceEngine: "shopping-intel",
      processingHistory: [
        "07:40:12 Ingested via /api/v1/signals/ingest",
        "07:40:13 Normalized merchant + category tokens",
        "07:40:14 Hypothesis HH-7823:organic-basket promoted",
      ],
      confidenceEvolution: ["88% → 91%", "91% → 94%"],
      relatedInferenceIds: ["INF-44102", "INF-44118"],
      metadata: {
        Merchant: "Local Bio Markt",
        Items: "12",
        Channel: "trip-complete",
      },
    },
  },
  {
    id: "SIG-88274",
    type: "RECIPE",
    householdId: "HH-4410",
    description: "Kabsa recipe completed — cook mode",
    confidence: 88,
    app: "Recipe AI",
    time: "5m ago",
    details: {
      sourceEngine: "recipe-rec",
      processingHistory: [
        "07:37:02 Cook mode session started",
        "07:37:48 Ingredient checklist completed",
        "07:39:55 Meal completion event emitted",
      ],
      confidenceEvolution: ["82% → 86%", "86% → 88%"],
      relatedInferenceIds: ["INF-44091", "INF-44105"],
      metadata: {
        Cuisine: "Arabic",
        Duration: "48m",
        PantryCoverage: "71%",
      },
    },
  },
  {
    id: "SIG-88251",
    type: "FITNESS",
    householdId: "HH-2198",
    description: "Evening run session — 6.2 km",
    confidence: 71,
    app: "Fitness AI",
    time: "12m ago",
    details: {
      sourceEngine: "fitness",
      processingHistory: [
        "07:30:11 Activity session ingested",
        "07:30:40 MET estimate computed",
        "07:31:02 Sync latency warning attached (287ms)",
      ],
      confidenceEvolution: ["79% → 74%", "74% → 71%"],
      relatedInferenceIds: ["INF-44070"],
      metadata: {
        Distance: "6.2 km",
        Duration: "34m",
        SyncLatency: "287ms",
      },
    },
  },
  {
    id: "SIG-88233",
    type: "LOCALE",
    householdId: "HH-9051",
    description: "Shopping radius preference updated",
    confidence: 97,
    app: "Core",
    time: "18m ago",
    details: {
      sourceEngine: "household-intel",
      processingHistory: [
        "07:24:08 Locale signal received",
        "07:24:09 Radius policy recalculated",
        "07:24:11 Merchant eligibility set refreshed",
      ],
      confidenceEvolution: ["95% → 97%"],
      relatedInferenceIds: ["INF-44055"],
      metadata: {
        City: "St. Pölten",
        RadiusKm: "8",
        Source: "profile-wizard",
      },
    },
  },
  {
    id: "SIG-88210",
    type: "MEAL",
    householdId: "HH-3304",
    description: "High-protein dinner pattern reinforced",
    confidence: 85,
    app: "Recipe AI",
    time: "24m ago",
    details: {
      sourceEngine: "nutrition",
      processingHistory: [
        "07:18:22 Meal signal correlated with taste vector",
        "07:18:30 Protein band reinforcement applied",
      ],
      confidenceEvolution: ["80% → 85%"],
      relatedInferenceIds: ["INF-44041", "INF-44048"],
      metadata: {
        MacroBand: "high-protein",
        MealSlot: "dinner",
        Reinforcement: "+1",
      },
    },
  },
  {
    id: "SIG-88196",
    type: "PURCHASE",
    householdId: "HH-1187",
    description: "Budget-conscious basket — staples only",
    confidence: 91,
    app: "SmartShop",
    time: "31m ago",
    details: {
      sourceEngine: "shopping-intel",
      processingHistory: [
        "07:11:04 Basket classified as staples-only",
        "07:11:06 Budget envelope signal reinforced",
      ],
      confidenceEvolution: ["87% → 91%"],
      relatedInferenceIds: ["INF-44022"],
      metadata: {
        BasketValue: "€34.20",
        Categories: "staples",
        OffersUsed: "2",
      },
    },
  },
  {
    id: "SIG-88172",
    type: "FITNESS",
    householdId: "HH-6620",
    description: "Recovery day inferred from low activity",
    confidence: 73,
    app: "Fitness AI",
    time: "41m ago",
    details: {
      sourceEngine: "fitness",
      processingHistory: [
        "07:01:18 Low activity window detected",
        "07:01:40 Recovery recommendation drafted",
      ],
      confidenceEvolution: ["76% → 73%"],
      relatedInferenceIds: ["INF-44001"],
      metadata: {
        ActivityLoad: "low",
        SleepProxy: "unknown",
        Recommendation: "recovery",
      },
    },
  },
  {
    id: "SIG-88150",
    type: "RECIPE",
    householdId: "HH-7823",
    description: "Taste profile delta — plant-based affinity",
    confidence: 79,
    app: "Recipe AI",
    time: "52m ago",
    details: {
      sourceEngine: "taste-intel",
      processingHistory: [
        "06:50:09 Skip streak on meat-heavy recipes",
        "06:50:33 Plant-based affinity updated",
      ],
      confidenceEvolution: ["74% → 79%"],
      relatedInferenceIds: ["INF-43988", "INF-44102"],
      metadata: {
        Affinity: "plant-based",
        Delta: "+3.2%",
        Evidence: "skip-streak",
      },
    },
  },
  {
    id: "SIG-88121",
    type: "LOCALE",
    householdId: "HH-5502",
    description: "Out-of-radius merchant suppressed",
    confidence: 62,
    app: "Core",
    time: "1h ago",
    details: {
      sourceEngine: "household-intel",
      processingHistory: [
        "06:42:11 Merchant outside radius flagged",
        "06:42:12 Offer suppressed from decision layer",
      ],
      confidenceEvolution: ["70% → 62%"],
      relatedInferenceIds: ["INF-43970"],
      metadata: {
        MerchantDistanceKm: "14.2",
        Policy: "in-city-only",
        Action: "suppress",
      },
    },
  },
  {
    id: "SIG-88098",
    type: "MEAL",
    householdId: "HH-4410",
    description: "Allergy-safe meal confirmation logged",
    confidence: 96,
    app: "Recipe AI",
    time: "1h ago",
    details: {
      sourceEngine: "recipe-rec",
      processingHistory: [
        "06:38:44 Allergen gate passed",
        "06:38:50 Safe meal confirmation stored",
      ],
      confidenceEvolution: ["94% → 96%"],
      relatedInferenceIds: ["INF-43961"],
      metadata: {
        AllergenGate: "pass",
        ConfirmedBy: "household-member",
        RecipeId: "RCP-2041",
      },
    },
  },
];

export const inferenceLogs: InferenceLogEntry[] = [
  {
    id: "log-1",
    timestamp: "07:42:18",
    engine: "household-intel",
    inferenceType: "profile-update",
    message: "HH-7823: Taste profile updated. Confidence delta +3.2%.",
    severity: "INFO",
  },
  {
    id: "log-2",
    timestamp: "07:41:55",
    engine: "shopping-intel",
    inferenceType: "basket-classify",
    message: "HH-7823: Organic grocery basket hypothesis promoted.",
    severity: "INFO",
  },
  {
    id: "log-3",
    timestamp: "07:40:12",
    engine: "fitness",
    inferenceType: "sync-health",
    message: "HH-2198: Sync latency elevated (287ms). Confidence soft-penalized.",
    severity: "WARN",
  },
  {
    id: "log-4",
    timestamp: "07:38:44",
    engine: "recipe-rec",
    inferenceType: "cook-complete",
    message: "HH-4410: Kabsa cook mode completed. Reinforcement applied.",
    severity: "INFO",
  },
  {
    id: "log-5",
    timestamp: "07:36:02",
    engine: "nutrition",
    inferenceType: "confidence-guard",
    message: "Cohort N-14: Nutrition confidence below target threshold.",
    severity: "WARN",
  },
  {
    id: "log-6",
    timestamp: "07:33:19",
    engine: "fitness",
    inferenceType: "batch-failure",
    message: "Activity batch backlog exceeded soft limit (114 queued jobs).",
    severity: "ERROR",
  },
  {
    id: "log-7",
    timestamp: "07:29:47",
    engine: "household-intel",
    inferenceType: "locale-policy",
    message: "HH-9051: Shopping radius preference synced to merchant filter.",
    severity: "INFO",
  },
  {
    id: "log-8",
    timestamp: "07:21:05",
    engine: "taste-intel",
    inferenceType: "affinity-shift",
    message: "HH-7823: Plant-based preference signals reinforced (67%).",
    severity: "INFO",
  },
];

export function confidenceBarTone(confidence: number): "green" | "amber" | "red" {
  if (confidence >= 85) return "green";
  if (confidence >= 75) return "amber";
  return "red";
}

export const signalTypeStyles: Record<SignalType, string> = {
  PURCHASE: "bg-[#E8EEF8] text-navy",
  RECIPE: "bg-accent-greenSoft text-success-text",
  FITNESS: "bg-accent-purpleSoft text-accent-purple",
  LOCALE: "bg-accent-yellowSoft text-[#A67C00]",
  MEAL: "bg-[#FFE8D9] text-[#C25B1A]",
};

export function signalsToCsv(rows: BehavioralSignal[]): string {
  const header = [
    "Signal ID",
    "Type",
    "Household",
    "Description",
    "Confidence",
    "App",
    "Time",
  ];
  const lines = rows.map((row) =>
    [
      row.id,
      row.type,
      row.householdId,
      `"${row.description.replace(/"/g, '""')}"`,
      `${row.confidence}%`,
      row.app,
      row.time,
    ].join(","),
  );
  return [header.join(","), ...lines].join("\n");
}
