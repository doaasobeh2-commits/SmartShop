/**
 * Food search engine — unified local search across registered source adapters.
 * No external API calls.
 */

import { scaleFoodPortion } from "./foodNutritionNormalizer";
import {
  FOOD_SOURCE_ADAPTERS,
  getAdaptersForCategories,
  getSeedCatalog,
  openFoodFactsMockAdapter,
  resolveFoodByCanonicalId,
  resolveLegacyFoodId,
} from "./foodSources";
import type {
  BarcodeLookupResult,
  FoodKnowledgeItem,
  FoodLogEntry,
  FoodSearchQuery,
  FoodSearchResult,
  ScaledFoodPortion,
} from "./foodTypes";
import { getLocalInstallationId } from "../privacy/localInstallationId";

function scoreMatch(name: string, query: string): number {
  const n = name.toLowerCase();
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  if (n === q) return 100;
  if (n.startsWith(q)) return 80;
  if (n.includes(q)) return 60;
  return 0;
}

function dedupeResults(results: FoodSearchResult[]): FoodSearchResult[] {
  const seen = new Set<string>();
  return results.filter((r) => {
    if (seen.has(r.item.id)) return false;
    seen.add(r.item.id);
    return true;
  });
}

/** Search all enabled adapters + seed catalog. */
export function searchFoods(query: FoodSearchQuery): FoodSearchResult[] {
  const limit = query.limit ?? 25;
  const q = query.query.trim();
  const adapters = getAdaptersForCategories(query.sources);
  const results: FoodSearchResult[] = [];

  for (const item of getSeedCatalog()) {
    const score = scoreMatch(item.name, q);
    if (score > 0 || !q) results.push({ item, matchScore: score || 10 });
  }

  for (const adapter of adapters) {
    const hits = adapter.search(q, limit);
    for (const item of hits) {
      results.push({ item, matchScore: scoreMatch(item.name, q) || 40 });
    }
  }

  return dedupeResults(results)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

export function getFoodById(id: string): FoodKnowledgeItem | undefined {
  return resolveFoodByCanonicalId(id) ?? resolveLegacyFoodId(id);
}

/** Barcode lookup — mock Open Food Facts only until live API is enabled. */
export function lookupBarcode(barcode: string): BarcodeLookupResult {
  const trimmed = barcode.trim();
  const item = openFoodFactsMockAdapter.lookupBarcode?.(trimmed) ?? null;
  return {
    barcode: trimmed,
    item,
    adapterReady: true,
  };
}

export function computePortionFromFoodId(params: {
  foodId: string;
  servingGrams: number;
}): ScaledFoodPortion | null {
  const item = getFoodById(params.foodId);
  if (!item) return null;
  return scaleFoodPortion({ item, servingSize: params.servingGrams });
}

/** Lists all mock-backed items for dev/diagnostics — not for production UI lists. */
export function listAllKnownFoods(): FoodKnowledgeItem[] {
  const items: FoodKnowledgeItem[] = [...getSeedCatalog()];
  for (const adapter of FOOD_SOURCE_ADAPTERS) {
    items.push(...adapter.search("", 100));
  }
  const seen = new Set<string>();
  return items.filter((f) => {
    if (seen.has(f.id)) return false;
    seen.add(f.id);
    return true;
  });
}

function newLogId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `foodlog-${Date.now()}`;
}

/** Builds a minimal food log entry — installation-scoped, fitness guidance only. */
export function buildFoodLogEntry(
  item: FoodKnowledgeItem,
  servingGrams?: number,
): FoodLogEntry {
  const now = new Date();
  const portion =
    servingGrams !== undefined && servingGrams !== item.servingSize
      ? scaleFoodPortion({ item, servingSize: servingGrams })
      : null;

  return {
    id: newLogId(),
    foodKnowledgeId: item.id,
    name: item.name,
    source: item.source,
    confidence: item.confidence,
    servingSize: servingGrams ?? item.servingSize,
    servingUnit: item.servingUnit,
    calories: portion?.calories ?? item.calories,
    protein: portion?.protein ?? item.protein,
    carbs: portion?.carbs ?? item.carbs,
    fat: portion?.fat ?? item.fat,
    date: now.toISOString().slice(0, 10),
    time: now.toTimeString().slice(0, 5),
    localInstallationId: getLocalInstallationId(),
    loggedAt: now.toISOString(),
  };
}

export const foodKnowledgeEngine = {
  searchFoods,
  getFoodById,
  lookupBarcode,
  computePortionFromFoodId,
  listAllKnownFoods,
  buildFoodLogEntry,
};

export type FoodKnowledgeEngine = typeof foodKnowledgeEngine;
