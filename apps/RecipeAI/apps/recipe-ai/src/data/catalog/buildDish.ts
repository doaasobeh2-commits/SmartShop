import type { CuisineFamilyId } from "@recipe-ai/core/types";
import { dishPhotoPath } from "./imageAssets";
import { DISH_INTENT_META } from "./mealIntentMeta";
import type {
  BudgetTier,
  CatalogAllergen,
  CuisineBridge,
  DietaryTag,
  DishCatalogEntry,
  DishDifficulty,
  DishMood,
  IngredientRole,
  LocalizedDishContent,
  MealIntentTag,
  MealSlotRole,
  MealType,
  PantryIngredient,
  ProteinCategory,
  SuitabilityTag,
} from "./types";

export const DISH_IMAGE_BASE = "/assets/dishes";

export function dishImage(cuisineFolder: string, fileName: string): string {
  return `${DISH_IMAGE_BASE}/${cuisineFolder}/${fileName}.jpg`;
}

export type SeedIngredient = {
  id: string;
  en: string;
  de: string;
  ar: string;
  tr: string;
  detailEn: string;
  detailDe: string;
  detailAr: string;
  detailTr: string;
  status?: "have" | "need";
};

export type SeedLocaleCopy = {
  reason: string;
  reasonGuests?: string;
  cuisineLabel: string;
  tips: string[];
  storageTip: string;
  steps: string[];
};

/** Compact seed shape used by cuisine modules — expanded by buildDish. */
export type DishSeed = {
  id: string;
  cuisineFamilyId: CuisineFamilyId;
  cuisineFolder: string;
  title: string;
  prepMinutes: number;
  servings: number;
  difficulty: DishDifficulty;
  mealTypes: MealType[];
  suitability: SuitabilityTag[];
  specialness: 1 | 2 | 3;
  familiarity: 1 | 2 | 3;
  ingredientTokens: string[];
  /** Optional explicit pantry roles; otherwise derived from tokens */
  pantryIngredients?: PantryIngredient[];
  allergens: CatalogAllergen[];
  /** Optional may-contain; defaults to none when omitted. */
  mayContain?: CatalogAllergen[];
  /** Override derived dinner role when needed. */
  mealSlotRole?: MealSlotRole;
  /** Optional overrides — otherwise curated DISH_INTENT_META is used. */
  mealIntents?: MealIntentTag[];
  budgetTier?: BudgetTier;
  proteinCategory?: ProteinCategory;
  /** Reuse another dish's image file when unique photography is unavailable. */
  imageFile?: string;
  moods: DishMood[];
  bridges?: CuisineBridge[];
  ingredients: SeedIngredient[];
  en: SeedLocaleCopy;
  de: SeedLocaleCopy;
  ar: SeedLocaleCopy;
  tr: SeedLocaleCopy;
};

const CRITICAL_CANONICAL = new Set([
  "chicken",
  "beef",
  "lamb",
  "pork",
  "fish",
  "potato",
  "potatoes",
  "rice",
  "pasta",
  "lentils",
  "dal",
  "beans",
  "tofu",
  "egg",
  "eggs",
  "yogurt",
  "mozzarella",
  "avocado",
  "cauliflower",
  "dumpling",
  "tortilla",
  "tortillas",
]);

const MEAT_TOKENS = new Set([
  "chicken",
  "beef",
  "lamb",
  "pork",
  "meat",
  "schnitzel",
  "kofte",
  "köfte",
  "tinga",
]);

function roleForToken(token: string, index: number): IngredientRole {
  const t = token.toLowerCase();
  if (CRITICAL_CANONICAL.has(t) || index === 0) return "critical";
  if (index === 1) return "supporting";
  if (
    t.includes("oil") ||
    t.includes("salt") ||
    t.includes("pepper") ||
    t.includes("herb") ||
    t.includes("mint") ||
    t.includes("parsley") ||
    t.includes("cilantro") ||
    t.includes("basil") ||
    t.includes("lemon") ||
    t.includes("lime") ||
    t.includes("garlic")
  ) {
    return index < 3 ? "supporting" : "garnish";
  }
  return index < 3 ? "supporting" : "optional";
}

/** Derive pantry roles from flat tokens when seeds omit structured roles. */
export function derivePantryIngredients(
  tokens: string[],
  override?: PantryIngredient[],
): PantryIngredient[] {
  if (override?.length) return override;
  const seen = new Set<string>();
  const out: PantryIngredient[] = [];
  tokens.forEach((raw, index) => {
    const token = raw.toLowerCase().trim();
    if (!token || seen.has(token)) return;
    seen.add(token);
    const canonicalId = token.replace(/\s+/g, "-");
    out.push({
      canonicalId,
      role: roleForToken(token, index),
      tokens: [token],
    });
  });
  return out;
}

/**
 * Structured dinner eligibility from mealTypes — not recipe-name hacks.
 * Sides / salad-only / rice-only components are not dinner-complete.
 */
export function deriveMealSlotRole(
  mealTypes: MealType[],
  override?: MealSlotRole,
): MealSlotRole {
  if (override) return override;
  if (mealTypes.includes("main") || mealTypes.includes("stew")) {
    return "dinner_complete";
  }
  if (mealTypes.includes("soup") && !mealTypes.includes("side")) {
    return "dinner_complete";
  }
  return "side_component";
}

export function deriveDietaryTags(
  tokens: string[],
  allergens: CatalogAllergen[],
): DietaryTag[] {
  const t = new Set(tokens.map((x) => x.toLowerCase()));
  const tags = new Set<DietaryTag>();

  const hasMeat = [...t].some((tok) => MEAT_TOKENS.has(tok));
  const hasPork = t.has("pork");
  const hasFish =
    allergens.includes("Fish") ||
    allergens.includes("Shellfish") ||
    t.has("fish");
  const hasDairy =
    allergens.includes("Dairy") ||
    t.has("yogurt") ||
    t.has("butter") ||
    t.has("mozzarella") ||
    t.has("cheese") ||
    t.has("cream") ||
    t.has("milk");
  const hasEgg = allergens.includes("Eggs") || t.has("egg") || t.has("eggs");

  if (hasMeat) tags.add("contains_meat");
  if (hasPork) tags.add("contains_pork");
  if (hasFish) tags.add("contains_fish");
  if (hasDairy) tags.add("contains_dairy");
  if (hasEgg) tags.add("contains_egg");

  if (!hasMeat && !hasFish && !hasPork) tags.add("vegetarian_ok");
  if (!hasMeat && !hasFish && !hasPork && !hasDairy && !hasEgg) {
    tags.add("vegan_ok");
  }

  return [...tags];
}

function localizeIngredients(
  ingredients: SeedIngredient[],
  locale: "en" | "de" | "ar" | "tr",
): LocalizedDishContent["ingredients"] {
  return ingredients.map((ing) => ({
    id: ing.id,
    name:
      locale === "en"
        ? ing.en
        : locale === "de"
          ? ing.de
          : locale === "ar"
            ? ing.ar
            : ing.tr,
    detail:
      locale === "en"
        ? ing.detailEn
        : locale === "de"
          ? ing.detailDe
          : locale === "ar"
            ? ing.detailAr
            : ing.detailTr,
    status: ing.status ?? "need",
  }));
}

function localize(
  copy: SeedLocaleCopy,
  ingredients: SeedIngredient[],
  locale: "en" | "de" | "ar" | "tr",
): LocalizedDishContent {
  return {
    reason: copy.reason,
    reasonGuests: copy.reasonGuests,
    cuisineLabel: copy.cuisineLabel,
    ingredients: localizeIngredients(ingredients, locale),
    steps: copy.steps.map((instruction, index) => ({
      order: index + 1,
      instruction,
    })),
    tips: copy.tips,
    storageTip: copy.storageTip,
  };
}

export function buildDish(seed: DishSeed): DishCatalogEntry {
  const ingredientTokens = seed.ingredientTokens.map((t) => t.toLowerCase());
  const allergens = seed.allergens;
  const curated = DISH_INTENT_META[seed.id];
  return {
    id: seed.id,
    cuisineFamilyId: seed.cuisineFamilyId,
    title: seed.title,
    imageUrl: dishPhotoPath(seed.cuisineFolder, seed.id, seed.imageFile),
    prepMinutes: seed.prepMinutes,
    servings: seed.servings,
    difficulty: seed.difficulty,
    mealTypes: seed.mealTypes,
    suitability: seed.suitability,
    specialness: seed.specialness,
    familiarity: seed.familiarity,
    ingredientTokens,
    pantryIngredients: derivePantryIngredients(
      ingredientTokens,
      seed.pantryIngredients,
    ),
    bridges: seed.bridges,
    allergens,
    mayContain: seed.mayContain ?? [],
    allergenDeclared: true,
    mealSlotRole: deriveMealSlotRole(seed.mealTypes, seed.mealSlotRole),
    dietaryTags: deriveDietaryTags(ingredientTokens, allergens),
    mealIntents: seed.mealIntents ?? curated?.mealIntents ?? ["family_friendly"],
    budgetTier: seed.budgetTier ?? curated?.budgetTier ?? "medium",
    proteinCategory: seed.proteinCategory ?? curated?.proteinCategory ?? "mixed",
    moods: seed.moods,
    content: {
      en: localize(seed.en, seed.ingredients, "en"),
      de: localize(seed.de, seed.ingredients, "de"),
      ar: localize(seed.ar, seed.ingredients, "ar"),
      tr: localize(seed.tr, seed.ingredients, "tr"),
    },
  };
}
