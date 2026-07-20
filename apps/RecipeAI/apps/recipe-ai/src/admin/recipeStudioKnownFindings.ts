import type { PhotoReviewStatus, PhotoReviewStore } from "./recipePhotoReview";
import type { RecipeQaStatus } from "./recipeStudioTypes";

export type KnownStudioFinding = {
  recipeQaStatus: RecipeQaStatus;
  notes: string;
  culturalReviewNote?: string;
  suggestedPhotoQa?: PhotoReviewStatus;
};

/** Preserved audit findings — surfaced in Recipe Studio, not auto-corrected. */
export const KNOWN_STUDIO_FINDINGS: Record<string, KnownStudioFinding> = {
  fattoush: {
    recipeQaStatus: "draft",
    suggestedPhotoQa: "approved",
    notes:
      "Ingredient list reconciled to corrected catalog (8 EN ingredients covering step pantry items). Photo still acceptable. Human Recipe QA review still required before approval — do not auto-approve.",
  },
  "sumac-chicken": {
    // Content reworked to Musakhan Wraps (tortilla). Human Recipe QA still needed.
    // Photo QA: human-approved musakhan-wraps.jpg.
    recipeQaStatus: "draft",
    suggestedPhotoQa: "approved",
    notes:
      "REWORKED: identity is Musakhan Wraps (سندويش مسخّن / Musakhan-Wraps / Musakhan Dürüm) — modern tortilla wrap, not traditional plated Musakhan. Ingredient↔step consistency fixed. IMAGE APPROVED: /assets/dishes/arab/musakhan-wraps.jpg (legacy sumac-chicken.jpg unused; musakhan.jpg untouched). Do not regenerate the wrap photo.",
    culturalReviewNote:
      "Distinct from authentic Palestinian Musakhan (taboon/flatbread platter). This id keeps consumer key sumac-chicken but is a home-style wrap: boneless chicken strips, onion, sumac, olive oil, salt, pepper, tortilla; reserve cooking juices, brush wraps, oven-finish. Search aliases: musakhan wraps, musakhan sandwich, سندويش مسخن — NOT bare musakhan/مسخن (those resolve to Palestinian Musakhan).",
  },
  "draft-arab-batch2-g1-syrian-meat-maqluba": {
    recipeQaStatus: "draft",
    suggestedPhotoQa: "pending",
    notes: "Syrian meat version (eggplant/potato) — no cauliflower. Image candidate generated and wired; needs visual review.",
  },
  "draft-arab-batch2-g2-fattet-dajaj": {
    recipeQaStatus: "draft",
    suggestedPhotoQa: "pending",
    notes: "Chicken fatteh layered with toasted pita, chicken, and garlicky yogurt-tahini. Image candidate generated and wired; needs visual review.",
  },
  "draft-arab-batch2-g1-syrian-savory-pastries": {
    recipeQaStatus: "draft",
    suggestedPhotoQa: "pending",
    notes: "Assorted Syrian pastries (cheese and zaatar). Image candidate generated and wired; needs visual review.",
  },
  "draft-arab-batch2-g1-syrian-sfiha": {
    recipeQaStatus: "draft",
    suggestedPhotoQa: "pending",
    notes: "Open-faced meat pastries (lahm bi ajeen). Image candidate generated and wired; needs visual review.",
  },
  "draft-arab-batch2-g1-spinach-fatayer": {
    recipeQaStatus: "draft",
    suggestedPhotoQa: "pending",
    notes: "Triangular closed spinach pastries. Image candidate generated and wired; needs visual review.",
  },
  "draft-arab-batch2-g1-shish-barak": {
    recipeQaStatus: "draft",
    suggestedPhotoQa: "pending",
    notes: "Small meat dumplings in garlicky yogurt sauce. Image candidate generated and wired; needs visual review.",
  },
  "draft-arab-batch2-g1-syrian-ouzi": {
    recipeQaStatus: "draft",
    suggestedPhotoQa: "pending",
    notes: "Celebration spiced rice mound with minced meat, peas, nuts and chicken. Image candidate generated and wired; needs visual review.",
  },
  "draft-arab-batch2-g1-bamieh-bil-lahmeh": {
    recipeQaStatus: "draft",
    suggestedPhotoQa: "pending",
    notes: "Okra and meat in tomato-garlic sauce. Image candidate generated and wired; needs visual review.",
  },
  "draft-arab-batch2-g2-basha-wa-asakro": {
    recipeQaStatus: "draft",
    suggestedPhotoQa: "pending",
    notes: "Fried eggplant with small meatballs and garlic yogurt. Image candidate generated and wired; needs visual review.",
  },
  "draft-arab-batch2-g2-beetroot-mutabbal": {
    recipeQaStatus: "draft",
    suggestedPhotoQa: "pending",
    notes: "Bright pink beetroot-tahini dip mezze. Image candidate generated and wired; needs visual review.",
  },
  "draft-arab-batch2-g1-shakriyeh-with-rice": {
    recipeQaStatus: "draft",
    suggestedPhotoQa: "pending",
    notes: "Yogurt-meat sauce with rice. Image wired from prepared asset; needs visual review.",
  },
  "draft-arab-batch2-g1-syrian-molokhia-with-chicken": {
    recipeQaStatus: "draft",
    suggestedPhotoQa: "pending",
    notes: "Syrian chopped molokhia with chicken. Image wired from prepared asset; needs visual review.",
  },
  "draft-arab-batch2-g1-fasolia-bi-zeit": {
    recipeQaStatus: "draft",
    suggestedPhotoQa: "pending",
    notes: "Olive-oil green bean stew. Image wired from prepared asset; needs visual review.",
  },
  "draft-arab-batch2-g1-artichoke-salad": {
    recipeQaStatus: "draft",
    suggestedPhotoQa: "pending",
    notes: "Artichoke salad mezze. Image wired from prepared asset; needs visual review.",
  },
  "draft-arab-batch2-g1-peas-with-tomato": {
    recipeQaStatus: "draft",
    suggestedPhotoQa: "pending",
    notes: "Peas with tomato stew. Image wired from prepared asset; needs visual review.",
  },
  "draft-arab-batch2-g1-syrian-stuffed-chicken": {
    recipeQaStatus: "draft",
    suggestedPhotoQa: "pending",
    notes: "Whole stuffed chicken. Image wired from prepared asset; needs visual review.",
  },
  "draft-arab-batch2-g1-freekeh-with-meat": {
    recipeQaStatus: "draft",
    suggestedPhotoQa: "pending",
    notes: "Freekeh with meat. Image wired from prepared asset; needs visual review.",
  },
  "draft-arab-batch2-g2-harraq-esbao": {
    recipeQaStatus: "draft",
    suggestedPhotoQa: "pending",
    notes: "Lentil-pasta stew with crispy onions. Image wired from prepared asset; needs visual review.",
  },
  "draft-arab-batch2-g2-macarona-bil-lahmeh": {
    recipeQaStatus: "draft",
    suggestedPhotoQa: "pending",
    notes: "Syrian pasta with minced meat. Image wired from prepared asset; needs visual review.",
  },
  "draft-arab-batch2-g2-syrian-boiled-potato-salad": {
    recipeQaStatus: "draft",
    suggestedPhotoQa: "pending",
    notes: "Syrian potato salad. Image wired from prepared asset; needs visual review.",
  },
  "draft-arab-batch2-g2-dawood-basha": {
    recipeQaStatus: "draft",
    suggestedPhotoQa: "pending",
    notes: "Meatballs in tomato sauce. Image wired from prepared asset; needs visual review.",
  },
  "draft-arab-batch2-g2-syrian-stuffed-cabbage-stew": {
    recipeQaStatus: "draft",
    suggestedPhotoQa: "pending",
    notes: "Stuffed cabbage stew. Image wired from prepared asset; needs visual review.",
  },
  "draft-arab-batch2-g2-syrian-cauliflower-with-meat": {
    recipeQaStatus: "draft",
    suggestedPhotoQa: "pending",
    notes: "Cauliflower with meat stew. Image wired from prepared asset; needs visual review.",
  },
  "draft-arab-batch2-g2-syrian-potato-garlic-olive-oil-stew": {
    recipeQaStatus: "draft",
    suggestedPhotoQa: "pending",
    notes: "Potato garlic olive-oil stew. Image wired from prepared asset; needs visual review.",
  },
  "draft-arab-batch2-g2-tunisian-couscous-with-meat-and-vegetables": {
    recipeQaStatus: "draft",
    suggestedPhotoQa: "pending",
    notes: "Tunisian couscous with meat and vegetables. Image wired from prepared asset; needs visual review.",
  },
  "draft-arab-batch2-g2-moroccan-meat-tagine-with-prunes": {
    recipeQaStatus: "draft",
    suggestedPhotoQa: "pending",
    notes: "Moroccan meat tagine with prunes. Image wired from prepared asset; needs visual review.",
  },
  "draft-arab-batch2-g2-moroccan-chicken-with-preserved-lemon-and-olives": {
    recipeQaStatus: "draft",
    suggestedPhotoQa: "pending",
    notes: "Moroccan chicken with preserved lemon and olives. Image wired from prepared asset; needs visual review.",
  },
  "draft-arab-batch2-g2-lebanese-batata-harra": {
    recipeQaStatus: "draft",
    suggestedPhotoQa: "pending",
    notes: "Lebanese batata harra. Image wired from prepared asset; needs visual review.",
  },
};

/** Admin search / identity aliases for consumer recipes (not generation matchKeys). */
export const CONSUMER_RECIPE_SEARCH_ALIASES: Record<string, readonly string[]> = {
  "sumac-chicken": [
    "musakhan wraps",
    "musakhan wrap",
    "musakhan sandwich",
    "musakhan-wraps",
    "musakhan dürüm",
    "musakhan durum",
    "سندويش مسخن",
    "سندويش مسخّن",
  ],
};

export function seedRecipeQaFromKnownFindings(
  existing: Record<string, { status: RecipeQaStatus; notes?: string }>,
): Record<string, { status: RecipeQaStatus; notes?: string }> {
  const out = { ...existing };
  for (const [recipeId, finding] of Object.entries(KNOWN_STUDIO_FINDINGS)) {
    if (!out[recipeId]) {
      out[recipeId] = {
        status: finding.recipeQaStatus,
        notes: finding.notes,
      };
    }
  }
  return out;
}

export function knownCulturalReviewNote(recipeId: string): string | undefined {
  return KNOWN_STUDIO_FINDINGS[recipeId]?.culturalReviewNote;
}

/**
 * Seed Photo QA from known findings (e.g. human-approved Musakhan Wraps).
 * Only fills missing keys — never overwrites a human Photo QA decision.
 */
export function seedPhotoQaFromKnownFindings(
  existing: PhotoReviewStore,
): PhotoReviewStore {
  const out = { ...existing };
  for (const [recipeId, finding] of Object.entries(KNOWN_STUDIO_FINDINGS)) {
    if (!finding.suggestedPhotoQa) continue;
    if (out[recipeId] == null) {
      out[recipeId] = finding.suggestedPhotoQa;
    }
  }
  return out;
}
