/**
 * Conservative dietary facts — no halal certification claims.
 */
export type RecipeDietaryFacts = {
  porkFree: boolean;
  alcoholFree: boolean;
  containsMeat: boolean;
  meatIsPoultryOrFishOnly: boolean;
  vegetarian: boolean;
  vegan: boolean;
};

export type HouseholdDietaryRequirements = {
  requirePorkFree: boolean;
  requireAlcoholFree: boolean;
  requireVegetarian: boolean;
  requireVegan: boolean;
  /** Applies pork-free + alcohol-free + conservative meat rules — not certification. */
  applyConservativeHalalRules: boolean;
};
