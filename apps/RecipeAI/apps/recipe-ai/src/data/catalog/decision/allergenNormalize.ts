import type { CatalogAllergen } from "../types";

/** Canonical UI / catalog allergen labels used by ShareYum SPA V1. */
export const CANONICAL_ALLERGENS: readonly CatalogAllergen[] = [
  "Gluten",
  "Dairy",
  "Eggs",
  "Nuts",
  "Peanuts",
  "Fish",
  "Shellfish",
  "Soy",
  "Sesame",
] as const;

/**
 * Deterministic normalization of legacy / case / display-label variants.
 * ShareYum-local only — does not import food-core into the SPA.
 */
const ALLERGEN_ALIASES: Record<string, CatalogAllergen> = {
  gluten: "Gluten",
  cereals_gluten: "Gluten",
  "cereals-gluten": "Gluten",
  wheat: "Gluten",
  dairy: "Dairy",
  milk: "Dairy",
  lactose: "Dairy",
  eggs: "Eggs",
  egg: "Eggs",
  nuts: "Nuts",
  "tree nuts": "Nuts",
  treenuts: "Nuts",
  peanuts: "Peanuts",
  peanut: "Peanuts",
  fish: "Fish",
  shellfish: "Shellfish",
  crustaceans: "Shellfish",
  molluscs: "Shellfish",
  mollusks: "Shellfish",
  soy: "Soy",
  soya: "Soy",
  sesame: "Sesame",
};

export function normalizeAllergenLabel(
  value: string | undefined | null,
): CatalogAllergen | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const exact = CANONICAL_ALLERGENS.find((a) => a === trimmed);
  if (exact) return exact;
  const key = trimmed.toLowerCase().replace(/\s+/g, " ");
  return (
    ALLERGEN_ALIASES[key] ??
    ALLERGEN_ALIASES[key.replace(/[\s_-]+/g, "")] ??
    null
  );
}

export function normalizeAllergyList(
  allergies: string[] | undefined,
): CatalogAllergen[] {
  if (!allergies?.length) return [];
  const out = new Set<CatalogAllergen>();
  for (const raw of allergies) {
    const n = normalizeAllergenLabel(raw);
    if (n) out.add(n);
  }
  return [...out];
}

/** Diet types currently representable in local preferences. */
export type SupportedDietType = "normal" | "halal" | "vegetarian" | "vegan";

export function normalizeDietType(
  value: string | undefined | null,
): SupportedDietType {
  const v = (value ?? "normal").toLowerCase().trim();
  if (v === "halal" || v === "vegetarian" || v === "vegan") return v;
  return "normal";
}
