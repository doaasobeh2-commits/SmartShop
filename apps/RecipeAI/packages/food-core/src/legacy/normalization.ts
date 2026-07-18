/**
 * Legacy normalization mapping — historical reference input only.
 * worldKitchens.ts is NOT authoritative final product truth.
 */
import type { CuisineFamilyId, CuisineSubregionId, MealStyleId } from "../taxonomy/ids";

export type LegacySource = "cuisines.ts" | "recipes.ts" | "worldKitchens.ts";

export type LegacyNormalizationStatus =
  | "mapped"
  | "deferred_family"
  | "meal_style_only"
  | "historical_reference";

export type LegacyCuisinesTsMapping = {
  legacyId: string;
  cuisineFamilyId: CuisineFamilyId;
  suggestedSubregionId?: CuisineSubregionId;
  status: LegacyNormalizationStatus;
  notes: string;
};

export type LegacyRecipesTsMapping = {
  legacyRecipeId: string;
  legacyCuisineId: string;
  cuisineFamilyId: CuisineFamilyId;
  suggestedSubregionId?: CuisineSubregionId;
  suggestedCanonicalSlug: string;
  status: "seed_candidate";
};

export type LegacyWorldKitchensMapping = {
  legacyKitchenId: string;
  cuisineFamilyId?: CuisineFamilyId;
  mealStyleId?: MealStyleId;
  catalogPhase: "active" | "deferred" | "not_a_cuisine_family";
  status: LegacyNormalizationStatus;
  recognitionIcon?: string;
  historicalDishSlugs: readonly string[];
  notes: string;
};

export const LEGACY_CUISINES_TS_MAP: readonly LegacyCuisinesTsMapping[] = [
  {
    legacyId: "arabic",
    cuisineFamilyId: "arab",
    suggestedSubregionId: "levantine",
    status: "mapped",
    notes: "Split internally by subregion at recipe level; family remains arab.",
  },
  {
    legacyId: "italian",
    cuisineFamilyId: "italian",
    status: "mapped",
    notes: "Direct map to italian family.",
  },
  {
    legacyId: "turkish",
    cuisineFamilyId: "turkish",
    status: "mapped",
    notes: "Direct map to turkish family.",
  },
  {
    legacyId: "austrian",
    cuisineFamilyId: "central_european",
    suggestedSubregionId: "austrian",
    status: "mapped",
    notes: "Austrian is a subregion under central_european.",
  },
] as const;

export const LEGACY_RECIPES_TS_MAP: readonly LegacyRecipesTsMapping[] = [
  {
    legacyRecipeId: "tabbouleh",
    legacyCuisineId: "arabic",
    cuisineFamilyId: "arab",
    suggestedSubregionId: "levantine",
    suggestedCanonicalSlug: "tabbouleh_levantine",
    status: "seed_candidate",
  },
  {
    legacyRecipeId: "sarma",
    legacyCuisineId: "turkish",
    cuisineFamilyId: "turkish",
    suggestedCanonicalSlug: "sarma_turkish",
    status: "seed_candidate",
  },
  {
    legacyRecipeId: "schnitzel",
    legacyCuisineId: "austrian",
    cuisineFamilyId: "central_european",
    suggestedSubregionId: "austrian",
    suggestedCanonicalSlug: "wiener_schnitzel_austrian",
    status: "seed_candidate",
  },
  {
    legacyRecipeId: "pomodoro",
    legacyCuisineId: "italian",
    cuisineFamilyId: "italian",
    suggestedCanonicalSlug: "pasta_pomodoro_italian",
    status: "seed_candidate",
  },
] as const;

export const LEGACY_WORLD_KITCHENS_MAP: readonly LegacyWorldKitchensMapping[] = [
  {
    legacyKitchenId: "arabic",
    cuisineFamilyId: "arab",
    catalogPhase: "active",
    status: "mapped",
    recognitionIcon: "🫓",
    historicalDishSlugs: ["kabsa", "tabbouleh", "baba-ghanoush"],
    notes: "Historical reference; prefer canonical taxonomy over flat arabic id.",
  },
  {
    legacyKitchenId: "austrian",
    cuisineFamilyId: "central_european",
    catalogPhase: "active",
    status: "mapped",
    recognitionIcon: "🇦🇹",
    historicalDishSlugs: ["spinatknoedel"],
    notes: "Maps to central_european / austrian subregion.",
  },
  {
    legacyKitchenId: "turkish",
    cuisineFamilyId: "turkish",
    catalogPhase: "active",
    status: "mapped",
    recognitionIcon: "🧿",
    historicalDishSlugs: ["iskender-kebab"],
    notes: "Direct family map.",
  },
  {
    legacyKitchenId: "italian",
    cuisineFamilyId: "italian",
    catalogPhase: "active",
    status: "mapped",
    recognitionIcon: "🍝",
    historicalDishSlugs: ["pasta-carbonara"],
    notes: "Direct family map.",
  },
  {
    legacyKitchenId: "mexican",
    cuisineFamilyId: "mexican",
    catalogPhase: "active",
    status: "mapped",
    recognitionIcon: "🌮",
    historicalDishSlugs: ["tacos"],
    notes: "Active family; deferred from Batch 1 except future tranches.",
  },
  {
    legacyKitchenId: "healthy",
    mealStyleId: "protein_bowl",
    catalogPhase: "not_a_cuisine_family",
    status: "meal_style_only",
    recognitionIcon: "🥗",
    historicalDishSlugs: ["protein-bowl"],
    notes: "Healthy is meal_style taxonomy, not a nationality.",
  },
  {
    legacyKitchenId: "romanian",
    cuisineFamilyId: "romanian",
    catalogPhase: "deferred",
    status: "deferred_family",
    recognitionIcon: "🥘",
    historicalDishSlugs: ["sarmale"],
    notes: "Registered taxonomy family; deferred from first major tranche.",
  },
  {
    legacyKitchenId: "japanese",
    cuisineFamilyId: "japanese",
    catalogPhase: "deferred",
    status: "deferred_family",
    recognitionIcon: "🍣",
    historicalDishSlugs: ["sushi"],
    notes: "Registered taxonomy family; deferred from first major tranche.",
  },
] as const;

export function mapLegacyCuisinesId(legacyId: string): LegacyCuisinesTsMapping | undefined {
  return LEGACY_CUISINES_TS_MAP.find((entry) => entry.legacyId === legacyId);
}

export function mapLegacyWorldKitchenId(
  legacyKitchenId: string,
): LegacyWorldKitchensMapping | undefined {
  return LEGACY_WORLD_KITCHENS_MAP.find((entry) => entry.legacyKitchenId === legacyKitchenId);
}

export function mapLegacyRecipeId(legacyRecipeId: string): LegacyRecipesTsMapping | undefined {
  return LEGACY_RECIPES_TS_MAP.find((entry) => entry.legacyRecipeId === legacyRecipeId);
}
