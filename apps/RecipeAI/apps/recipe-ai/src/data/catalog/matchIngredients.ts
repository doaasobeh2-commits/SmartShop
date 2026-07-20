import type { AppLocale } from "../../i18n/types";
import { matchPantryDishes, parseIngredientQuery } from "./decision";
import type { CuisineFamilyId } from "@recipe-ai/core/types";

export { parseIngredientQuery } from "./decision";

export type PantryMatchResult = {
  recipeIds: string[];
  noStrongMatch: boolean;
  missingTotalById: Record<string, number>;
  coverageById: Record<string, number>;
  queryCoverageById: Record<string, number>;
  minimalExtraById: Record<string, number>;
  completionBurdenById: Record<string, number>;
};

/**
 * Local deterministic pantry matcher (alpha/demo — not live inventory).
 * Uses critical-ingredient coverage from Decision Engine V1.
 */
export function matchDishesByIngredients(
  query: string,
  allergies: string[] = [],
  locale: AppLocale = "en",
  limit = 3,
  hostCuisineIds: CuisineFamilyId[] = [],
  dietType?: string,
): PantryMatchResult {
  const result = matchPantryDishes(
    {
      locale,
      tonight: { occasion: "household", guestPreferredCuisineIds: [] },
      hostCuisineIds,
      allergies,
      dietType,
      weeklyPlanningEnabled: false,
      weeklyPlan: [],
      mode: "pantry",
      pantryQuery: query,
    },
    limit,
  );
  return {
    recipeIds: result.recipeIds,
    noStrongMatch: result.noStrongMatch,
    missingTotalById: result.missingTotalById,
    coverageById: result.coverageById,
    queryCoverageById: result.queryCoverageById,
    minimalExtraById: result.minimalExtraById,
    completionBurdenById: result.completionBurdenById,
  };
}
