/**
 * Food confidence rules — explainable trust levels, estimate disclaimers.
 * Never present estimated values as exact.
 */

import type { FoodConfidenceLevel, FoodKnowledgeItem, FoodSourceCategory } from "./foodTypes";

export type ConfidenceContext = {
  source: FoodSourceCategory;
  fieldsPresent: number;
  fieldsExpected?: number;
  dataAgeDays?: number;
  hasBrand?: boolean;
  hasBarcode?: boolean;
};

const SOURCE_BASE_CONFIDENCE: Record<FoodSourceCategory, FoodConfidenceLevel> = {
  verified_database: "high",
  open_food_database: "medium",
  user_custom_food: "medium",
  estimated_food: "low",
  manual_entry: "low",
};

const CONFIDENCE_LABELS_DE: Record<FoodConfidenceLevel, string> = {
  high: "Verifizierte Quelle",
  medium: "Datenbankwert",
  low: "Schätzung",
};

const CONFIDENCE_LABELS_EN: Record<FoodConfidenceLevel, string> = {
  high: "Verified source",
  medium: "Database value",
  low: "Estimate",
};

/** Computes confidence from source category and data completeness. */
export function computeFoodConfidence(ctx: ConfidenceContext): FoodConfidenceLevel {
  let level = SOURCE_BASE_CONFIDENCE[ctx.source];

  const expected = ctx.fieldsExpected ?? 4;
  const completeness = ctx.fieldsPresent / expected;

  if (ctx.source === "verified_database" && completeness >= 0.75) {
    level = "high";
  } else if (ctx.source === "open_food_database") {
    level = completeness >= 0.75 && ctx.hasBrand ? "medium" : "low";
  } else if (ctx.source === "user_custom_food") {
    level = completeness >= 0.5 ? "medium" : "low";
  } else {
    level = "low";
  }

  if (ctx.dataAgeDays !== undefined && ctx.dataAgeDays > 730 && level === "high") {
    level = "medium";
  }

  return level;
}

export function isEstimatedSource(source: FoodSourceCategory): boolean {
  return source === "estimated_food" || source === "manual_entry";
}

export function mustShowEstimateDisclaimer(item: FoodKnowledgeItem): boolean {
  return item.confidence === "low" || isEstimatedSource(item.source);
}

export function getConfidenceLabel(
  level: FoodConfidenceLevel,
  locale: "de" | "en" = "de",
): string {
  return locale === "de" ? CONFIDENCE_LABELS_DE[level] : CONFIDENCE_LABELS_EN[level];
}

/** Prefixes values when data is not exact — UI should use this later. */
export function formatNutritionValue(
  item: FoodKnowledgeItem,
  value: number,
  unit = "",
): string {
  const rounded = Math.round(value * 10) / 10;
  const suffix = unit ? ` ${unit}` : "";
  if (mustShowEstimateDisclaimer(item)) {
    return `~${rounded}${suffix}`;
  }
  return `${rounded}${suffix}`;
}

export function countPresentMacroFields(item: Pick<
  FoodKnowledgeItem,
  "calories" | "protein" | "carbs" | "fat" | "fiber" | "sugar" | "salt"
>): number {
  const fields = [item.calories, item.protein, item.carbs, item.fat, item.fiber, item.sugar, item.salt];
  return fields.filter((v) => v !== undefined && v !== null && !Number.isNaN(v)).length;
}

export function buildConfidenceContextFromItem(item: FoodKnowledgeItem): ConfidenceContext {
  return {
    source: item.source,
    fieldsPresent: countPresentMacroFields(item),
    fieldsExpected: 7,
    hasBrand: Boolean(item.brand),
  };
}

export function getNutritionDisclaimer(locale: "de" | "en" = "de"): string {
  return locale === "de"
    ? "Nährwerte dienen der allgemeinen Fitness-Orientierung — keine medizinische Beratung. Schätzungen sind als solche gekennzeichnet."
    : "Nutrition values support general fitness guidance — not medical advice. Estimates are clearly marked.";
}
