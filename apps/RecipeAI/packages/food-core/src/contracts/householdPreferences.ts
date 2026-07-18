import type { AllergenCode } from "../contracts/allergenCodes";
import type { HouseholdDietaryRequirements } from "../contracts/dietaryFacts";
import type {
  BudgetIntent,
  ExplicitCuisinePreferences,
  SpiceTolerance,
} from "../affinity/types";
import type { CuisineFamilyId, ShareYumLocale } from "../taxonomy/ids";
import { DEFAULT_EXPLORATION_WILLINGNESS } from "../taxonomy/constants";

/** Extended household food profile — A2.1 fields preserved; cuisine intelligence added in A2.2. */
export type HouseholdFoodProfileV2 = {
  householdId: string;
  allergenCodes: AllergenCode[];
  dietary: HouseholdDietaryRequirements;
  locale: ShareYumLocale;
  residenceCountry: string;
  residenceCity?: string;
  explicitCuisinePreferences: ExplicitCuisinePreferences;
  explorationWillingness: number;
  spiceTolerance: SpiceTolerance;
  timeBudgetDefaultMinutes?: number;
  budgetIntent?: BudgetIntent;
  householdSize?: number;
  updatedAt: string;
};

export type UpsertHouseholdFoodProfileV2Request = Omit<
  HouseholdFoodProfileV2,
  "householdId" | "updatedAt"
>;

export function createDefaultHouseholdFoodProfileV2(
  householdId: string,
  locale: ShareYumLocale = "en",
  residenceCountry = "AT",
): HouseholdFoodProfileV2 {
  return {
    householdId,
    allergenCodes: [],
    dietary: {
      requirePorkFree: false,
      requireAlcoholFree: false,
      requireVegetarian: false,
      requireVegan: false,
      applyConservativeHalalRules: false,
    },
    locale,
    residenceCountry,
    explicitCuisinePreferences: { liked: [], disliked: [] },
    explorationWillingness: DEFAULT_EXPLORATION_WILLINGNESS,
    spiceTolerance: "medium",
    updatedAt: new Date(0).toISOString(),
  };
}

/** Cook-start records meal history; Tonight display and swap do not. */
export type MealHistoryEventType = "cook_start";

export type MealHistoryEvent = {
  householdId: string;
  recipeId: string;
  eventType: MealHistoryEventType;
  source: "tonight" | "preview";
  occurredAt: string;
};

export type TonightImpressionEvent = {
  householdId: string;
  recipeId: string;
  action: "displayed" | "swapped" | "preview_opened";
  occurredAt: string;
};
