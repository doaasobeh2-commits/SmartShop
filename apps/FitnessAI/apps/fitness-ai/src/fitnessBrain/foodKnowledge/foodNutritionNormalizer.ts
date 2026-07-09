/**
 * Normalizes heterogeneous food sources into canonical FoodKnowledgeItem records.
 */

import { computeFoodConfidence, countPresentMacroFields } from "./foodConfidence";
import type {
  EstimatedFoodInput,
  FoodKnowledgeItem,
  ManualFoodEntryInput,
  NormalizedNutritionPer100,
  ScaledFoodPortion,
  ScalePortionInput,
  UserCustomFoodInput,
} from "./foodTypes";
import type { FoodSourceCategory } from "./foodTypes";

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function round0(n: number): number {
  return Math.round(n);
}

function buildItemId(source: FoodSourceCategory, sourceFoodId: string): string {
  return `${source}:${sourceFoodId}`;
}

function per100ToServing(
  per100: NormalizedNutritionPer100,
  servingGrams: number,
): NormalizedNutritionPer100 {
  const factor = servingGrams / 100;
  return {
    calories: round0(per100.calories * factor),
    protein: round1(per100.protein * factor),
    carbs: round1(per100.carbs * factor),
    fat: round1(per100.fat * factor),
    fiber: per100.fiber !== undefined ? round1(per100.fiber * factor) : undefined,
    sugar: per100.sugar !== undefined ? round1(per100.sugar * factor) : undefined,
    salt: per100.salt !== undefined ? round1(per100.salt * factor) : undefined,
  };
}

function servingToPer100(
  serving: NormalizedNutritionPer100,
  servingGrams: number,
): NormalizedNutritionPer100 {
  if (servingGrams <= 0) return serving;
  const factor = 100 / servingGrams;
  return {
    calories: round0(serving.calories * factor),
    protein: round1(serving.protein * factor),
    carbs: round1(serving.carbs * factor),
    fat: round1(serving.fat * factor),
    fiber: serving.fiber !== undefined ? round1(serving.fiber * factor) : undefined,
    sugar: serving.sugar !== undefined ? round1(serving.sugar * factor) : undefined,
    salt: serving.salt !== undefined ? round1(serving.salt * factor) : undefined,
  };
}

export type OpenFoodFactsMockRecord = {
  code: string;
  product_name?: string;
  brands?: string;
  nutriments?: {
    "energy-kcal_100g"?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    fiber_100g?: number;
    sugars_100g?: number;
    salt_100g?: number;
  };
  serving_size?: string;
  last_modified_t?: number;
};

export type UsdaFoodDataMockRecord = {
  fdcId: number;
  description: string;
  brandOwner?: string;
  foodNutrients: Array<{ nutrientName: string; value: number; unitName: string }>;
  servingSize?: number;
  servingSizeUnit?: string;
  publicationDate?: string;
};

/** Mock Open Food Facts shape → canonical item (no network). */
export function normalizeFromOpenFoodFacts(raw: OpenFoodFactsMockRecord): FoodKnowledgeItem | null {
  const per100: NormalizedNutritionPer100 = {
    calories: raw.nutriments?.["energy-kcal_100g"] ?? 0,
    protein: raw.nutriments?.proteins_100g ?? 0,
    carbs: raw.nutriments?.carbohydrates_100g ?? 0,
    fat: raw.nutriments?.fat_100g ?? 0,
    fiber: raw.nutriments?.fiber_100g,
    sugar: raw.nutriments?.sugars_100g,
    salt: raw.nutriments?.salt_100g,
  };

  if (per100.calories === 0 && per100.protein === 0 && per100.carbs === 0 && per100.fat === 0) {
    return null;
  }

  const servingGrams = 100;
  const serving = per100ToServing(per100, servingGrams);
  const lastUpdated = raw.last_modified_t
    ? new Date(raw.last_modified_t * 1000).toISOString()
    : new Date().toISOString();

  const item: FoodKnowledgeItem = {
    id: buildItemId("open_food_database", raw.code),
    name: raw.product_name ?? "Unbekanntes Produkt",
    brand: raw.brands,
    source: "open_food_database",
    sourceFoodId: raw.code,
    servingSize: servingGrams,
    servingUnit: "g",
    ...serving,
    confidence: "medium",
    lastUpdated,
    sourceAttribution: "Open Food Facts (mock adapter — keine Live-API)",
  };

  item.confidence = computeFoodConfidence({
    source: item.source,
    fieldsPresent: countPresentMacroFields(item),
    hasBrand: Boolean(item.brand),
    hasBarcode: true,
  });

  return item;
}

function usdaNutrient(nutrients: UsdaFoodDataMockRecord["foodNutrients"], name: string): number | undefined {
  const hit = nutrients.find((n) => n.nutrientName.toLowerCase().includes(name.toLowerCase()));
  return hit?.value;
}

/** Mock USDA FoodData Central shape → canonical item (no network). */
export function normalizeFromUsda(raw: UsdaFoodDataMockRecord): FoodKnowledgeItem | null {
  const per100: NormalizedNutritionPer100 = {
    calories: usdaNutrient(raw.foodNutrients, "Energy") ?? 0,
    protein: usdaNutrient(raw.foodNutrients, "Protein") ?? 0,
    carbs: usdaNutrient(raw.foodNutrients, "Carbohydrate") ?? 0,
    fat: usdaNutrient(raw.foodNutrients, "Total lipid") ?? usdaNutrient(raw.foodNutrients, "Fat") ?? 0,
    fiber: usdaNutrient(raw.foodNutrients, "Fiber"),
    sugar: usdaNutrient(raw.foodNutrients, "Sugars"),
    salt: usdaNutrient(raw.foodNutrients, "Sodium"),
  };

  const servingGrams = raw.servingSize ?? 100;
  const serving = per100ToServing(per100, servingGrams);

  const item: FoodKnowledgeItem = {
    id: buildItemId("verified_database", String(raw.fdcId)),
    name: raw.description,
    brand: raw.brandOwner,
    source: "verified_database",
    sourceFoodId: String(raw.fdcId),
    servingSize: servingGrams,
    servingUnit: raw.servingSizeUnit ?? "g",
    ...serving,
    confidence: "high",
    lastUpdated: raw.publicationDate ?? new Date().toISOString(),
    sourceAttribution: "USDA FoodData Central (mock adapter — keine Live-API)",
  };

  item.confidence = computeFoodConfidence({
    source: item.source,
    fieldsPresent: countPresentMacroFields(item),
    hasBrand: Boolean(item.brand),
  });

  return item;
}

export function normalizeUserCustomFood(
  input: UserCustomFoodInput,
  sourceFoodId: string,
): FoodKnowledgeItem {
  const item: FoodKnowledgeItem = {
    id: buildItemId("user_custom_food", sourceFoodId),
    name: input.name.trim(),
    brand: input.brand?.trim(),
    source: "user_custom_food",
    sourceFoodId,
    servingSize: input.servingSize,
    servingUnit: input.servingUnit,
    calories: round0(input.calories),
    protein: round1(input.protein),
    carbs: round1(input.carbs),
    fat: round1(input.fat),
    fiber: input.fiber !== undefined ? round1(input.fiber) : undefined,
    sugar: input.sugar !== undefined ? round1(input.sugar) : undefined,
    salt: input.salt !== undefined ? round1(input.salt) : undefined,
    confidence: "medium",
    lastUpdated: new Date().toISOString(),
    sourceAttribution: "Benutzerdefiniert — von dir eingegeben",
  };

  item.confidence = computeFoodConfidence({
    source: item.source,
    fieldsPresent: countPresentMacroFields(item),
  });

  return item;
}

export function normalizeEstimatedFood(input: EstimatedFoodInput): FoodKnowledgeItem {
  const sourceFoodId = `est-${Date.now()}`;
  return {
    id: buildItemId("estimated_food", sourceFoodId),
    name: input.name.trim(),
    source: "estimated_food",
    sourceFoodId,
    servingSize: input.servingSize,
    servingUnit: input.servingUnit,
    calories: round0(input.calories),
    protein: round1(input.protein),
    carbs: round1(input.carbs),
    fat: round1(input.fat),
    fiber: input.fiber !== undefined ? round1(input.fiber) : undefined,
    sugar: input.sugar !== undefined ? round1(input.sugar) : undefined,
    salt: input.salt !== undefined ? round1(input.salt) : undefined,
    confidence: "low",
    lastUpdated: new Date().toISOString(),
    sourceAttribution: input.reason
      ? `Geschätzt — ${input.reason}`
      : "Geschätzt — keine verifizierte Quelle",
  };
}

export function normalizeManualEntry(input: ManualFoodEntryInput): FoodKnowledgeItem {
  const sourceFoodId = `manual-${Date.now()}`;
  return {
    id: buildItemId("manual_entry", sourceFoodId),
    name: input.name.trim(),
    source: "manual_entry",
    sourceFoodId,
    servingSize: input.servingSize,
    servingUnit: input.servingUnit,
    calories: round0(input.calories),
    protein: round1(input.protein),
    carbs: round1(input.carbs),
    fat: round1(input.fat),
    confidence: "low",
    lastUpdated: new Date().toISOString(),
    sourceAttribution: "Manuelle Eingabe — keine Datenbank",
  };
}

/** Scales a food item to a different serving size (same unit assumed as grams/ml). */
export function scaleFoodPortion({ item, servingSize }: ScalePortionInput): ScaledFoodPortion {
  const factor = item.servingSize > 0 ? servingSize / item.servingSize : 1;
  return {
    item,
    factor,
    calories: round0(item.calories * factor),
    protein: round1(item.protein * factor),
    carbs: round1(item.carbs * factor),
    fat: round1(item.fat * factor),
    fiber: item.fiber !== undefined ? round1(item.fiber * factor) : undefined,
    sugar: item.sugar !== undefined ? round1(item.sugar * factor) : undefined,
    salt: item.salt !== undefined ? round1(item.salt * factor) : undefined,
  };
}

/** Converts per-100 g reference to a canonical item for a default serving. */
export function buildFromPer100(params: {
  source: FoodSourceCategory;
  sourceFoodId: string;
  name: string;
  brand?: string;
  per100: NormalizedNutritionPer100;
  servingSize: number;
  servingUnit: string;
  sourceAttribution: string;
}): FoodKnowledgeItem {
  const serving = per100ToServing(params.per100, params.servingSize);
  const item: FoodKnowledgeItem = {
    id: buildItemId(params.source, params.sourceFoodId),
    name: params.name,
    brand: params.brand,
    source: params.source,
    sourceFoodId: params.sourceFoodId,
    servingSize: params.servingSize,
    servingUnit: params.servingUnit,
    ...serving,
    confidence: "medium",
    lastUpdated: new Date().toISOString(),
    sourceAttribution: params.sourceAttribution,
  };

  item.confidence = computeFoodConfidence({
    source: item.source,
    fieldsPresent: countPresentMacroFields(item),
    hasBrand: Boolean(item.brand),
  });

  return item;
}

export { servingToPer100, per100ToServing, buildItemId };
