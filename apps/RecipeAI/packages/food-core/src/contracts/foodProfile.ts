import type { AllergenCode } from "./allergenCodes";
import type { HouseholdDietaryRequirements } from "./dietaryFacts";

/** Household food profile — canonical allergen codes only. */
export type HouseholdFoodProfileDto = {
  householdId: string;
  allergenCodes: AllergenCode[];
  dietary: HouseholdDietaryRequirements;
  updatedAt: string;
};

export type UpsertHouseholdFoodProfileRequest = {
  allergenCodes: AllergenCode[];
  dietary: HouseholdDietaryRequirements;
};
