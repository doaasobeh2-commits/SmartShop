import { isDishPlaceholderUrl } from "../components/dishImageStyle";
import { NEEDS_PHOTO_PLACEHOLDER_PATH } from "../data/catalog/imageAssets";
import type { DishCatalogEntry } from "../data/catalog/types";
import type { AppLocale } from "../i18n/types";

export type QaWarningSeverity = "warn" | "info";

export type QaWarning = {
  code: string;
  severity: QaWarningSeverity;
  message: string;
};

const LOCALES: AppLocale[] = ["en", "de", "ar", "tr"];

const STEP_STOPWORDS = new Set([
  "the",
  "and",
  "with",
  "then",
  "until",
  "about",
  "minutes",
  "serve",
  "heat",
  "add",
  "mix",
  "cook",
  "roast",
  "bake",
  "toss",
  "chop",
  "dice",
  "slice",
  "season",
  "salt",
  "pepper",
]);

function normalizeToken(value: string): string {
  return value.toLowerCase().trim();
}

function ingredientListTokens(dish: DishCatalogEntry): Set<string> {
  const tokens = new Set<string>();
  for (const ing of dish.content.en.ingredients) {
    tokens.add(normalizeToken(ing.id));
    for (const part of ing.name.toLowerCase().split(/\s+/)) {
      if (part.length > 2) tokens.add(part);
    }
  }
  return tokens;
}

function stepText(dish: DishCatalogEntry): string {
  return dish.content.en.steps.map((s) => s.instruction.toLowerCase()).join(" ");
}

function tokenMentionedInSteps(token: string, steps: string): boolean {
  const t = normalizeToken(token);
  if (t.length < 3 || STEP_STOPWORDS.has(t)) return false;
  return steps.includes(t);
}

function ingredientMentionedInList(token: string, listTokens: Set<string>): boolean {
  const t = normalizeToken(token);
  if (listTokens.has(t)) return true;
  for (const existing of listTokens) {
    if (existing.includes(t) || t.includes(existing)) return true;
  }
  return false;
}

export function auditRecipeContent(dish: DishCatalogEntry): QaWarning[] {
  const warnings: QaWarning[] = [];
  const en = dish.content.en;
  const steps = stepText(dish);
  const listTokens = ingredientListTokens(dish);

  for (const token of dish.ingredientTokens) {
    if (!tokenMentionedInSteps(token, steps)) continue;
    if (!ingredientMentionedInList(token, listTokens)) {
      warnings.push({
        code: "step_ingredient_missing_from_list",
        severity: "warn",
        message: `Steps reference "${token}" but it is missing from the EN ingredient list.`,
      });
    }
  }

  for (const pantry of dish.pantryIngredients) {
    const inList =
      ingredientMentionedInList(pantry.canonicalId, listTokens) ||
      pantry.tokens.some((t) => ingredientMentionedInList(t, listTokens));
    if (!inList) {
      warnings.push({
        code: "pantry_role_not_in_ingredient_list",
        severity: "warn",
        message: `Pantry role "${pantry.canonicalId}" (${pantry.role}) is not represented in the ingredient list.`,
      });
    }
  }

  const ingredientCounts = LOCALES.map((l) => dish.content[l]?.ingredients.length ?? 0);
  const stepCounts = LOCALES.map((l) => dish.content[l]?.steps.length ?? 0);
  if (new Set(ingredientCounts).size > 1) {
    warnings.push({
      code: "locale_ingredient_count_mismatch",
      severity: "warn",
      message: `Ingredient counts differ across locales: ${ingredientCounts.join(" / ")} (EN/DE/AR/TR).`,
    });
  }
  if (new Set(stepCounts).size > 1) {
    warnings.push({
      code: "locale_step_count_mismatch",
      severity: "warn",
      message: `Step counts differ across locales: ${stepCounts.join(" / ")} (EN/DE/AR/TR).`,
    });
  }

  for (const ing of en.ingredients) {
    if (!ing.detail?.trim()) {
      warnings.push({
        code: "missing_quantity",
        severity: "warn",
        message: `Missing quantity/detail for ingredient "${ing.name}".`,
      });
    }
  }

  if (en.steps.length === 0) {
    warnings.push({
      code: "missing_steps",
      severity: "warn",
      message: "No cooking steps in EN content.",
    });
  }

  if (
    dish.dietaryTags.includes("vegetarian_ok") &&
    dish.dietaryTags.includes("contains_meat")
  ) {
    warnings.push({
      code: "vegetarian_meat_conflict",
      severity: "warn",
      message: "Both vegetarian_ok and contains_meat dietary tags are set.",
    });
  }
  if (
    dish.dietaryTags.includes("vegan_ok") &&
    (dish.dietaryTags.includes("contains_dairy") ||
      dish.dietaryTags.includes("contains_egg") ||
      dish.dietaryTags.includes("contains_meat") ||
      dish.dietaryTags.includes("contains_fish"))
  ) {
    warnings.push({
      code: "vegan_animal_product_conflict",
      severity: "warn",
      message: "vegan_ok conflicts with animal-product dietary tags.",
    });
  }

  if (!dish.allergenDeclared) {
    warnings.push({
      code: "allergen_not_declared",
      severity: "warn",
      message: "allergenDeclared is false — recipe would fail closed in consumer safety gate.",
    });
  }

  if (isDishPlaceholderUrl(dish.imageUrl)) {
    warnings.push({
      code: "placeholder_image",
      severity: "info",
      message: "Uses placeholder image path instead of verified JPG.",
    });
  } else if (!dish.imageUrl.endsWith(".jpg")) {
    warnings.push({
      code: "image_path_unusual",
      severity: "info",
      message: `Image path does not end with .jpg: ${dish.imageUrl}`,
    });
  }

  if (!dish.imageUrl.startsWith("/assets/dishes/") && !dish.imageUrl.includes(NEEDS_PHOTO_PLACEHOLDER_PATH)) {
    warnings.push({
      code: "image_path_integrity",
      severity: "warn",
      message: `Unexpected image asset path: ${dish.imageUrl}`,
    });
  }

  return warnings;
}

export function recipeHasQaWarnings(dish: DishCatalogEntry): boolean {
  return auditRecipeContent(dish).some((w) => w.severity === "warn");
}

export function countRecipesWithWarnings(
  dishes: readonly DishCatalogEntry[],
): number {
  return dishes.filter((d) => recipeHasQaWarnings(d)).length;
}
