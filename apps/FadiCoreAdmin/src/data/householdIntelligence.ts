import {
  Database,
  Network,
  Users,
  Zap,
} from "lucide-react";
import type { KpiStat } from "./platformOverview";

export const householdKpiStats: KpiStat[] = [
  {
    id: "avg-confidence",
    value: "83.5%",
    label: "Avg Hypothesis Confidence",
    icon: Network,
    tone: "purple",
  },
  {
    id: "active-hypotheses",
    value: "14,823",
    label: "Active Hypotheses",
    icon: Database,
    tone: "blue",
  },
  {
    id: "signals-today",
    value: "487K",
    label: "Signals Ingested Today",
    icon: Zap,
    tone: "green",
  },
  {
    id: "full-profile",
    value: "1,914",
    label: "Households with Full Profile",
    icon: Users,
    tone: "yellow",
  },
];

export type IngestionPoint = {
  time: string;
  smartshop: number;
  recipe: number;
  fitness: number;
};

/** Signals per hour across a full day for connected apps. */
export const signalIngestionByApp: IngestionPoint[] = [
  { time: "00:00", smartshop: 420, recipe: 210, fitness: 160 },
  { time: "02:00", smartshop: 310, recipe: 150, fitness: 120 },
  { time: "04:00", smartshop: 280, recipe: 130, fitness: 95 },
  { time: "06:00", smartshop: 390, recipe: 220, fitness: 180 },
  { time: "08:00", smartshop: 620, recipe: 410, fitness: 340 },
  { time: "10:00", smartshop: 780, recipe: 520, fitness: 460 },
  { time: "12:00", smartshop: 910, recipe: 640, fitness: 580 },
  { time: "14:00", smartshop: 980, recipe: 710, fitness: 650 },
  { time: "16:00", smartshop: 1050, recipe: 760, fitness: 720 },
  { time: "18:00", smartshop: 1120, recipe: 820, fitness: 780 },
  { time: "20:00", smartshop: 940, recipe: 690, fitness: 640 },
  { time: "22:00", smartshop: 710, recipe: 480, fitness: 420 },
  { time: "23:59", smartshop: 540, recipe: 320, fitness: 280 },
];

export const ingestionLegend = [
  { id: "smartshop", label: "SmartShop", color: "#1B3F91" },
  { id: "recipe", label: "Recipe AI", color: "#1F9D63" },
  { id: "fitness", label: "Fitness AI", color: "#7B5EA7" },
] as const;

export type EngineConfidence = {
  engine: string;
  actual: number;
  target: number;
};

export const engineConfidenceScores: EngineConfidence[] = [
  { engine: "Taste", actual: 87, target: 90 },
  { engine: "Shopping", actual: 93, target: 90 },
  { engine: "Health", actual: 82, target: 90 },
  { engine: "Nutrition", actual: 81, target: 90 },
  { engine: "Fitness", actual: 74, target: 90 },
  { engine: "Household", actual: 89, target: 90 },
];

export type TasteTrend = {
  id: string;
  label: string;
  value: number;
};

export const tasteIntelligenceTrends: TasteTrend[] = [
  { id: "plant-based", label: "Plant-based preference signals", value: 67 },
  { id: "south-asian", label: "South Asian cuisine affinity", value: 43 },
  { id: "gluten-free", label: "Gluten-free household patterns", value: 28 },
  { id: "high-protein", label: "High-protein diet signals", value: 51 },
  { id: "budget", label: "Budget-conscious shopping patterns", value: 38 },
  { id: "mediterranean", label: "Mediterranean cuisine signals", value: 44 },
];
