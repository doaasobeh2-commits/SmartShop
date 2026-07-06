import { matchKeyword } from "./cuisineAffinityRules";

/** Maps Recipe AI cuisine tags to internal hypothesis labels. */
export const RECIPE_CUISINE_TAG_MAP: Readonly<Record<string, string>> = {
  levantine: "levantine_cuisine",
  middle_eastern: "levantine_cuisine",
  arab: "levantine_cuisine",
  italian: "italian_cuisine",
  turkish: "turkish_cuisine",
  german: "german_cuisine",
  austrian: "german_cuisine",
};

const RECIPE_NAME_HINTS: ReadonlyArray<{ cuisineLabel: string; keywords: string[] }> = [
  {
    cuisineLabel: "levantine_cuisine",
    keywords: ["hummus", "falafel", "shawarma", "tabbouleh", "shakshuka", "labneh"],
  },
  {
    cuisineLabel: "italian_cuisine",
    keywords: ["pasta", "carbonara", "risotto", "lasagne", "pesto", "parmesan"],
  },
  {
    cuisineLabel: "turkish_cuisine",
    keywords: ["köfte", "kofte", "lahmacun", "börek", "borek", "menemen", "mercimek"],
  },
  {
    cuisineLabel: "german_cuisine",
    keywords: ["schnitzel", "bratkartoffel", "sauerkraut", "gulasch", "spätzle", "spaetzle"],
  },
];

export function inferCuisineLabelsFromRecipe(
  recipeName: string,
  cuisineTags: string[] = [],
): string[] {
  const labels = new Set<string>();
  const normalizedName = recipeName.trim().toLowerCase();

  for (const tag of cuisineTags) {
    const mapped = RECIPE_CUISINE_TAG_MAP[tag.trim().toLowerCase()];
    if (mapped) {
      labels.add(mapped);
    }
  }

  for (const hint of RECIPE_NAME_HINTS) {
    if (hint.keywords.some((keyword) => matchKeyword(normalizedName, keyword))) {
      labels.add(hint.cuisineLabel);
    }
  }

  return [...labels];
}

export const RECIPE_ACCEPTED_BASE_CONFIDENCE = 0.58;
export const MEAL_COOKED_BASE_CONFIDENCE = 0.64;
export const RECIPE_REJECTED_PENALTY = 0.07;
