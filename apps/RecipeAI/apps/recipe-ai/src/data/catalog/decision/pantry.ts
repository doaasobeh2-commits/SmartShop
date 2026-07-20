import { listAllDishes } from "../dishes";
import type {
  DishCatalogEntry,
  IngredientRole,
  PantryIngredient,
} from "../types";
import { applyHardSafety } from "./safety";
import type { DecisionContext } from "./types";

/** Coverage at/above this threshold may claim GOOD_PANTRY_MATCH. */
export const STRONG_PANTRY_COVERAGE = 0.55;
/** Query-ingredient coverage at/above this may claim USES_AVAILABLE_INGREDIENTS. */
export const QUERY_COVERAGE_FOR_USES = 0.5;

const STOP = new Set([
  "and",
  "or",
  "with",
  "the",
  "a",
  "an",
  "some",
  "fresh",
  "of",
  "for",
  "to",
  "in",
  "we",
  "are",
  "persons",
  "people",
  "person",
  "servings",
  "serving",
  "und",
  "oder",
  "mit",
  "ein",
  "eine",
  "personen",
  "wır",
  "biz",
  "kişi",
  "kişiyiz",
  "و",
  "من",
  "على",
  "في",
  "أشخاص",
  "شخص",
]);

/**
 * Small canonical alias layer for major starter ingredients / UI languages.
 * Not a full multilingual ontology.
 */
const TOKEN_ALIASES: Record<string, string> = {
  chicken: "chicken",
  huhn: "chicken",
  hähnchen: "chicken",
  huhnchen: "chicken",
  دجاج: "chicken",
  tavuk: "chicken",
  potato: "potato",
  potatoes: "potato",
  kartoffel: "potato",
  kartoffeln: "potato",
  بطاطا: "potato",
  بطاطس: "potato",
  patates: "potato",
  rice: "rice",
  reis: "rice",
  basmati: "rice",
  "basmati rice": "rice",
  أرز: "rice",
  pirinç: "rice",
  pirinc: "rice",
  beef: "beef",
  rind: "beef",
  rindfleisch: "beef",
  لحم: "beef",
  et: "beef",
  lamb: "lamb",
  lamm: "lamb",
  خروف: "lamb",
  kuzu: "lamb",
  yogurt: "yogurt",
  yoghurt: "yogurt",
  joghurt: "yogurt",
  لبن: "yogurt",
  yoğurt: "yogurt",
  yoghurt_: "yogurt",
  egg: "egg",
  eggs: "egg",
  ei: "egg",
  eier: "egg",
  بيض: "egg",
  yumurta: "egg",
  tomato: "tomato",
  tomatoes: "tomato",
  tomate: "tomato",
  tomaten: "tomato",
  طماطم: "tomato",
  domates: "tomato",
  garlic: "garlic",
  knoblauch: "garlic",
  ثوم: "garlic",
  sarımsak: "garlic",
  sarimsak: "garlic",
  lentils: "lentils",
  linse: "lentils",
  linsen: "lentils",
  عدس: "lentils",
  mercimek: "lentils",
  pasta: "pasta",
  nudeln: "pasta",
  معكرونة: "pasta",
  makarna: "pasta",
};

const ROLE_WEIGHT: Record<IngredientRole, number> = {
  critical: 4,
  supporting: 2,
  optional: 1,
  garnish: 0.25,
};

export function canonicalizeToken(raw: string): string {
  const key = raw.toLowerCase().trim();
  return TOKEN_ALIASES[key] ?? key;
}

export function parseIngredientQuery(query: string): string[] {
  // Prefer quantity-aware parse so "500g chicken" → chicken (not "500g").
  // Lazy import avoided: duplicate light strip for presence tokens.
  const fromQty = query
    .toLowerCase()
    .replace(/(\d+(?:\.\d+)?)\s*(g|kg|ml|l|grams?|kilos?|pcs?|pieces?|cloves?)\b/gi, " ")
    .replace(/[^\p{L}\p{N}\s,-]/gu, " ")
    .split(/[\s,]+/)
    .map((t) => canonicalizeToken(t.trim()))
    .filter((t) => t.length >= 2 && !STOP.has(t) && !/^\d+$/.test(t));
  return [...new Set(fromQty)];
}

export function parseHeadcount(query: string): number | undefined {
  const match = query.match(
    /(\d+)\s*(persons?|people|servings?|personen|kiş|أشخاص|شخص)/i,
  );
  if (match) return Number(match[1]);
  const bare = query.match(/\bwe are (\d+)\b/i);
  if (bare) return Number(bare[1]);
  return undefined;
}

function ingredientMatched(ing: PantryIngredient, tokens: string[]): boolean {
  const canonTokens = tokens.map(canonicalizeToken);
  return ing.tokens.some((t) => {
    const ct = canonicalizeToken(t);
    return canonTokens.some((tok) => ct.includes(tok) || tok.includes(ct));
  });
}

function dishMatchesQueryToken(
  dish: DishCatalogEntry,
  queryToken: string,
): boolean {
  const q = canonicalizeToken(queryToken);
  if (
    dish.ingredientTokens.some((t) => {
      const ct = canonicalizeToken(t);
      return ct === q || ct.includes(q) || q.includes(ct);
    })
  ) {
    return true;
  }
  return dish.pantryIngredients.some((ing) => ingredientMatched(ing, [q]));
}

export type PantryDishScore = {
  dish: DishCatalogEntry;
  coverage: number;
  /** Fraction of important query tokens consumed by the dish */
  queryCoverage: number;
  unmatchedQuery: string[];
  missingCritical: number;
  missingSupporting: number;
  missingOptional: number;
  missingTotal: number;
  /**
   * How hard the dish is to finish from the query pantry.
   * Garnish barely counts; supporting counts; critical dominates (and blocks).
   */
  completionBurden: number;
  /** Calm UI: missing critical + supporting (not garnish). */
  minimalExtraCount: number;
  matchedWeight: number;
  requiredWeight: number;
  headcountDelta: number;
  score: number;
};

/**
 * completionBurden = missingCritical*10 + missingSupporting*3 + missingOptional*0.5
 * Garnish omissions are ignored (not required).
 */
export function computeCompletionBurden(input: {
  missingCritical: number;
  missingSupporting: number;
  missingOptional: number;
}): number {
  return (
    input.missingCritical * 10 +
    input.missingSupporting * 3 +
    input.missingOptional * 0.5
  );
}

export function scorePantryDish(
  dish: DishCatalogEntry,
  tokens: string[],
  headcount?: number,
): PantryDishScore | null {
  const ingredients =
    dish.pantryIngredients.length > 0
      ? dish.pantryIngredients
      : dish.ingredientTokens.map((t, i) => ({
          canonicalId: t,
          role: (i === 0 ? "critical" : "supporting") as IngredientRole,
          tokens: [t],
        }));

  let matchedWeight = 0;
  let requiredWeight = 0;
  let missingCritical = 0;
  let missingSupporting = 0;
  let missingOptional = 0;
  let missingTotal = 0;

  for (const ing of ingredients) {
    const w = ROLE_WEIGHT[ing.role];
    // Garnish does not drive required weight / burden
    if (ing.role === "garnish") {
      if (!ingredientMatched(ing, tokens)) {
        /* ignored */
      }
      continue;
    }
    requiredWeight += w;
    if (ingredientMatched(ing, tokens)) {
      matchedWeight += w;
    } else {
      missingTotal += 1;
      if (ing.role === "critical") missingCritical += 1;
      else if (ing.role === "supporting") missingSupporting += 1;
      else missingOptional += 1;
    }
  }

  if (requiredWeight <= 0) return null;
  if (matchedWeight <= 0) return null;

  const coverage = matchedWeight / requiredWeight;
  // Exclude when any critical is missing (no validated substitutions in V1)
  if (missingCritical > 0) return null;

  // Query ingredient consumption — unmatched important tokens penalize heavily.
  const uniqueQuery = [...new Set(tokens)];
  const unmatchedQuery = uniqueQuery.filter(
    (tok) => !dishMatchesQueryToken(dish, tok),
  );
  const queryCoverage =
    uniqueQuery.length === 0
      ? 0
      : (uniqueQuery.length - unmatchedQuery.length) / uniqueQuery.length;

  const completionBurden = computeCompletionBurden({
    missingCritical,
    missingSupporting,
    missingOptional,
  });
  const minimalExtraCount = missingCritical + missingSupporting;

  let score = coverage * 40 + matchedWeight * 3;
  score += queryCoverage * 28;
  score -= unmatchedQuery.length * 14;
  // Prefer economical completion: fewer extras beat long shopping lists.
  score -= completionBurden * 2.5;
  if (dish.budgetTier === "low") score += 5;
  else if (dish.budgetTier === "premium") score -= 3;

  const headcountDelta =
    headcount && dish.servings ? Math.abs(dish.servings - headcount) : 0;
  score -= headcountDelta * 2;
  score -= dish.prepMinutes / 25;

  return {
    dish,
    coverage,
    queryCoverage,
    unmatchedQuery,
    missingCritical,
    missingSupporting,
    missingOptional,
    missingTotal,
    completionBurden,
    minimalExtraCount,
    matchedWeight,
    requiredWeight,
    headcountDelta,
    score,
  };
}

export type PantryMatchResult = {
  recipeIds: string[];
  noStrongMatch: boolean;
  /** Alpha/demo: derived from catalog structure, not live inventory */
  missingTotalById: Record<string, number>;
  coverageById: Record<string, number>;
  queryCoverageById: Record<string, number>;
  minimalExtraById: Record<string, number>;
  completionBurdenById: Record<string, number>;
};

/**
 * Pantry mode: safety → parse → coverage → completion burden → budget → rank.
 * Household preference is applied lightly AFTER pantry fit.
 */
export function matchPantryDishes(
  ctx: DecisionContext,
  limit = 3,
): PantryMatchResult {
  const query = ctx.pantryQuery?.trim() ?? "";
  const tokens = parseIngredientQuery(query);
  const headcount = ctx.pantryHeadcount ?? parseHeadcount(query);

  if (tokens.length === 0) {
    return {
      recipeIds: [],
      noStrongMatch: true,
      missingTotalById: {},
      coverageById: {},
      queryCoverageById: {},
      minimalExtraById: {},
      completionBurdenById: {},
    };
  }

  const safe = applyHardSafety(listAllDishes(), ctx);
  const scored = safe
    .map((dish) => {
      const base = scorePantryDish(dish, tokens, headcount);
      if (!base) return null;
      const cuisineBoost = ctx.hostCuisineIds.includes(dish.cuisineFamilyId)
        ? 1.5
        : 0;
      return { ...base, score: base.score + cuisineBoost };
    })
    .filter((row): row is PantryDishScore => row !== null)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.completionBurden - b.completionBurden ||
        b.queryCoverage - a.queryCoverage ||
        b.coverage - a.coverage ||
        a.dish.id.localeCompare(b.dish.id),
    );

  const top = scored.slice(0, limit);
  const missingTotalById: Record<string, number> = {};
  const coverageById: Record<string, number> = {};
  const queryCoverageById: Record<string, number> = {};
  const minimalExtraById: Record<string, number> = {};
  const completionBurdenById: Record<string, number> = {};
  for (const row of top) {
    missingTotalById[row.dish.id] = row.minimalExtraCount;
    coverageById[row.dish.id] = Math.min(row.coverage, row.queryCoverage);
    queryCoverageById[row.dish.id] = row.queryCoverage;
    minimalExtraById[row.dish.id] = row.minimalExtraCount;
    completionBurdenById[row.dish.id] = row.completionBurden;
  }

  return {
    recipeIds: top.map((r) => r.dish.id),
    noStrongMatch: top.length === 0,
    missingTotalById,
    coverageById,
    queryCoverageById,
    minimalExtraById,
    completionBurdenById,
  };
}

export function pantryReasonCodes(
  coverage: number | undefined,
): import("@recipe-ai/core/types").RecommendationReasonCode[] {
  if (coverage == null) return [];
  if (coverage >= STRONG_PANTRY_COVERAGE) {
    return ["GOOD_PANTRY_MATCH", "USES_AVAILABLE_INGREDIENTS"];
  }
  if (coverage >= QUERY_COVERAGE_FOR_USES) {
    return ["USES_AVAILABLE_INGREDIENTS"];
  }
  return [];
}
