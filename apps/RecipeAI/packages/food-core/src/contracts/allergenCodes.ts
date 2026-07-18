/**
 * Canonical allergen authority for ShareYum food domain.
 * UI labels map to these codes at write time — never the reverse.
 */
export const ALLERGEN_CODES = [
  "celery",
  "cereals_gluten",
  "crustaceans",
  "eggs",
  "fish",
  "lupin",
  "milk",
  "molluscs",
  "mustard",
  "nuts",
  "peanuts",
  "sesame",
  "soy",
  "sulphites",
] as const;

export type AllergenCode = (typeof ALLERGEN_CODES)[number];

/** Maps A1 Food Preferences UI labels to canonical codes. */
export const UI_ALLERGEN_LABEL_TO_CODES: Record<string, readonly AllergenCode[]> = {
  Gluten: ["cereals_gluten"],
  Dairy: ["milk"],
  Eggs: ["eggs"],
  Nuts: ["nuts"],
  Peanuts: ["peanuts"],
  Fish: ["fish"],
  Shellfish: ["crustaceans", "molluscs"],
  Soy: ["soy"],
  Sesame: ["sesame"],
} as const;

export type RecipeAllergenDeclaration = {
  contains: AllergenCode[];
  mayContain: AllergenCode[];
};
