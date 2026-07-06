/**
 * Ingredient and product keyword → cuisine affinity inference rules.
 * Internal only — outputs hypotheses, never user-visible facts.
 */
export type CuisineAffinityRule = {
  cuisineLabel: string;
  keywords: string[];
  baseConfidence: number;
};

export const CUISINE_AFFINITY_RULES: ReadonlyArray<CuisineAffinityRule> = [
  {
    cuisineLabel: "levantine_cuisine",
    keywords: ["olive oil", "olivenöl", "labneh", "za'atar", "zaatar", "chickpea", "kichererbse", "hummus", "tahini", "pita"],
    baseConfidence: 0.52,
  },
  {
    cuisineLabel: "italian_cuisine",
    keywords: ["pasta", "parmesan", "pesto", "mozzarella", "risotto", "parmigiano", "spaghetti", "penne"],
    baseConfidence: 0.52,
  },
  {
    cuisineLabel: "turkish_cuisine",
    keywords: ["ayran", "börek", "borek", "lahmacun", "sucuk", "beyaz peynir", "bulgur", "köfte", "kofte", "döner", "doner"],
    baseConfidence: 0.52,
  },
  {
    cuisineLabel: "german_cuisine",
    keywords: ["brötchen", "broetchen", "sauerkraut", "knödel", "knoedel", "wurst", "kartoffel", "potato", "quark"],
    baseConfidence: 0.5,
  },
];

export const DIETARY_TENDENCY_RULES: ReadonlyArray<{
  tendencyLabel: string;
  keywords: string[];
  baseConfidence: number;
}> = [
  {
    tendencyLabel: "vegetarian_tendency",
    keywords: ["tofu", "lentil", "linse", "chickpea", "kichererbse", "spinach", "spinat"],
    baseConfidence: 0.4,
  },
  {
    tendencyLabel: "organic_preference",
    keywords: ["bio ", "organic", "ökologisch"],
    baseConfidence: 0.42,
  },
];

export type LocaleCuisineBoost = {
  cuisineLabel: string;
  countryCodes?: string[];
  languageCodes?: string[];
  boost: number;
};

/** Contextual boosts — e.g. German residence + Turkish language. */
export const LOCALE_CUISINE_BOOSTS: ReadonlyArray<LocaleCuisineBoost> = [
  {
    cuisineLabel: "german_cuisine",
    countryCodes: ["de", "at"],
    boost: 0.12,
  },
  {
    cuisineLabel: "turkish_cuisine",
    languageCodes: ["tr"],
    boost: 0.18,
  },
  {
    cuisineLabel: "turkish_cuisine",
    countryCodes: ["de", "at"],
    languageCodes: ["tr"],
    boost: 0.1,
  },
];

export function matchKeyword(text: string, keyword: string): boolean {
  return text.includes(keyword.toLowerCase());
}
