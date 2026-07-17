import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Moon,
  PiggyBank,
  ShoppingCart,
  Sparkles,
  Users,
  UtensilsCrossed,
} from "lucide-react";

export type ModuleStatus = "LIVE" | "BETA" | "PLANNED";

export type FeatureItem = {
  label: string;
  tone: "ok" | "warn";
};

export type ActiveModule = {
  id: string;
  name: string;
  status: "LIVE" | "BETA";
  version: string;
  plannedVersion: string;
  description: string;
  features: FeatureItem[];
  launchLabel: string;
  launchQuarter: string;
  tone: "blue" | "green" | "purple";
  icon: LucideIcon;
  details: {
    dependencies: string[];
    connectedEngines: string[];
    deploymentHistory: string[];
    releaseNotes: string[];
  };
};

export type FutureModule = {
  id: string;
  name: string;
  description: string;
  eta: string;
  icon: LucideIcon;
  details: {
    plannedVersion: string;
    dependencies: string[];
    connectedEngines: string[];
    notes: string[];
  };
};

export type MilestoneStatus = "complete" | "in-progress" | "planned";

export type Milestone = {
  id: string;
  date: string;
  title: string;
  description: string;
  status: MilestoneStatus;
};

export const activeModules: ActiveModule[] = [
  {
    id: "smartshop",
    name: "SmartShop AI",
    status: "LIVE",
    version: "v2.3.1",
    plannedVersion: "v2.4.0",
    description:
      "Purchase intelligence, shopping behavior analysis, and product recommendations.",
    features: [
      { label: "Purchase signal ingestion", tone: "ok" },
      { label: "Basket pattern analysis", tone: "ok" },
      { label: "Budget intelligence", tone: "ok" },
      { label: "Allergen flag propagation", tone: "ok" },
      { label: "Core → Shop projections", tone: "ok" },
    ],
    launchLabel: "Launched",
    launchQuarter: "Q1 2025",
    tone: "blue",
    icon: ShoppingCart,
    details: {
      dependencies: ["Household graph", "Hidden inventory", "HIE runtime"],
      connectedEngines: ["shopping-intel", "household-intel"],
      deploymentHistory: [
        "Q1 2025 v1.0.0 — signal pipeline launch",
        "Q3 2025 v2.0.0 — budget intelligence",
        "Q1 2026 v2.3.1 — allergen propagation hardening",
      ],
      releaseNotes: [
        "Stabilized trip-complete reinforcement loop",
        "Improved local merchant radius filtering",
        "Reduced false-positive budget alerts",
      ],
    },
  },
  {
    id: "recipe",
    name: "Recipe AI",
    status: "LIVE",
    version: "v1.8.4",
    plannedVersion: "v1.9.0",
    description:
      "Personalized recipe recommendations from taste, locale, nutrition, and dietary signals.",
    features: [
      { label: "Recipe acceptance/rejection signals", tone: "ok" },
      { label: "Locale cuisine matching", tone: "ok" },
      { label: "Nutrition integration", tone: "ok" },
      { label: "Meal completion logging", tone: "ok" },
      { label: "Core → Recipe projections", tone: "ok" },
    ],
    launchLabel: "Launched",
    launchQuarter: "Q3 2025",
    tone: "green",
    icon: UtensilsCrossed,
    details: {
      dependencies: ["Taste vectors", "Allergen gate", "Pantry projections"],
      connectedEngines: ["recipe-rec", "taste-intel", "nutrition"],
      deploymentHistory: [
        "Q3 2025 v1.0.0 — Tonight + Cook surfaces",
        "Q4 2025 v1.5.0 — locale cuisine matching",
        "Q2 2026 v1.8.4 — nutrition bridge polish",
      ],
      releaseNotes: [
        "Fail-closed allergen confirmation path",
        "Improved pantry coverage scoring",
        "Cook-mode completion reinforcement",
      ],
    },
  },
  {
    id: "fitness",
    name: "Fitness AI",
    status: "BETA",
    version: "v0.9.2-beta",
    plannedVersion: "v1.0.0",
    description:
      "Activity tracking, fitness goal alignment, and integration with nutrition intelligence.",
    features: [
      { label: "Activity signal ingestion", tone: "ok" },
      { label: "Fitness goal tracking", tone: "ok" },
      { label: "Nutrition ↔ Fitness sync", tone: "ok" },
      { label: "Core → Fitness projections", tone: "ok" },
      { label: "Limited household coverage", tone: "warn" },
    ],
    launchLabel: "Launched",
    launchQuarter: "Beta: Q1 2026",
    tone: "purple",
    icon: Activity,
    details: {
      dependencies: [
        "Local installation privacy scope",
        "Nutrition expenditure bridge",
        "Activity MET catalog",
      ],
      connectedEngines: ["fitness", "nutrition", "household-intel"],
      deploymentHistory: [
        "Q1 2026 v0.8.0 — closed beta",
        "Q1 2026 v0.9.2-beta — sync latency monitoring",
      ],
      releaseNotes: [
        "Partial household coverage in pilot regions",
        "Recovery recommendations when latency elevates",
        "Full launch targeted for Q3 2026",
      ],
    },
  },
];

export const futureModules: FutureModule[] = [
  {
    id: "sleep",
    name: "Sleep AI",
    description: "Sleep pattern intelligence",
    eta: "Q3 2026",
    icon: Moon,
    details: {
      plannedVersion: "v0.1.0",
      dependencies: ["Fitness recovery signals", "Local device privacy scope"],
      connectedEngines: ["fitness", "household-intel"],
      notes: [
        "Research phase in Q4 2026 milestone plan",
        "No consumer sleep dashboard in v1",
      ],
    },
  },
  {
    id: "wellness",
    name: "Wellness AI",
    description: "Holistic health tracking",
    eta: "Q4 2026",
    icon: Sparkles,
    details: {
      plannedVersion: "v0.1.0",
      dependencies: ["Fitness AI GA", "Nutrition confidence thresholds"],
      connectedEngines: ["fitness", "nutrition", "taste-intel"],
      notes: ["Placeholder module — product definition pending"],
    },
  },
  {
    id: "budget",
    name: "Budget AI",
    description: "Financial health integration",
    eta: "2027",
    icon: PiggyBank,
    details: {
      plannedVersion: "v0.1.0",
      dependencies: ["SmartShop budget envelope", "Household graph"],
      connectedEngines: ["shopping-intel", "household-intel"],
      notes: ["Extends shopping intelligence — no separate finance UI in pilot"],
    },
  },
  {
    id: "family",
    name: "Family AI",
    description: "Multi-member household logic",
    eta: "2027",
    icon: Users,
    details: {
      plannedVersion: "v0.1.0",
      dependencies: ["SmartShop household ownership", "Consent model"],
      connectedEngines: ["household-intel", "taste-intel"],
      notes: ["Builds on existing household graph — no duplicate profiles"],
    },
  },
];

export const milestones: Milestone[] = [
  {
    id: "m1",
    date: "Q1 2025",
    title: "SmartShop AI → Core signal pipeline launched",
    description: "First production signal bridge from shopping trips into Core.",
    status: "complete",
  },
  {
    id: "m2",
    date: "Q2 2025",
    title: "Household Intelligence Engine v1 deployed",
    description: "Cross-app household behavioral profiles became operational.",
    status: "complete",
  },
  {
    id: "m3",
    date: "Q3 2025",
    title: "Recipe AI integrated — taste + locale signals active",
    description: "Tonight recommendations wired to Core taste and locale priors.",
    status: "complete",
  },
  {
    id: "m4",
    date: "Q4 2025",
    title: "Taste Intelligence Engine confidence threshold reached (85%+)",
    description: "Taste engine crossed production confidence target.",
    status: "complete",
  },
  {
    id: "m5",
    date: "Q1 2026",
    title: "Fitness AI beta launched — partial household coverage",
    description: "Closed beta with limited pilot household activation.",
    status: "complete",
  },
  {
    id: "m6",
    date: "Q2 2026",
    title: "GDPR full compliance controls + audit logging",
    description: "Export/delete queue and permission matrix hardened.",
    status: "in-progress",
  },
  {
    id: "m7",
    date: "Q3 2026",
    title: "Fitness AI full launch — 100% household coverage",
    description: "Graduate Fitness from beta to general availability.",
    status: "planned",
  },
  {
    id: "m8",
    date: "Q4 2026",
    title: "Sleep AI integration research phase",
    description: "Evaluate sleep signals without expanding consumer admin burden.",
    status: "planned",
  },
];

export const moduleIconBg = {
  blue: "bg-navy text-white",
  green: "bg-success text-white",
  purple: "bg-accent-purple text-white",
} as const;
