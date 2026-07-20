import { isDishPlaceholderUrl } from "../components/dishImageStyle";
import { deriveMealBalance } from "../data/catalog/decision/mealComposition";
import {
  INSPECTED_CORRECT_RECIPE_IMAGE_IDS,
  NEEDS_ACCURATE_PHOTOGRAPHY_RECIPE_IDS,
} from "../data/catalog/imageAssets";
import type { DishCatalogEntry, MealType } from "../data/catalog/types";
import { recipeHasQaWarnings } from "./recipeQaAudit";
import {
  countPhotoReviewsByStatus,
  type PhotoReviewStatus,
} from "./recipePhotoReview";
import type { RecipeQaStatus, StudioRecipeView } from "./recipeStudioTypes";
import { CONSUMER_RECIPE_SEARCH_ALIASES } from "./recipeStudioKnownFindings";

export type CatalogPhotoStatus = "verified" | "placeholder" | "missing_registry";

export type IntentFilterTag =
  | "budget"
  | "healthy"
  | "light"
  | "filling"
  | "special"
  | "quick"
  | "vegetarian";

export type CatalogFilters = {
  search: string;
  cuisine: string;
  mealType: string;
  intent: IntentFilterTag | "";
  photoStatus: CatalogPhotoStatus | "all";
  photoQaStatus: PhotoReviewStatus | "all";
  recipeQaStatus: RecipeQaStatus | "all";
  hasQaWarnings: boolean;
  source: "all" | "canonical" | "draft";
};

export const EMPTY_CATALOG_FILTERS: CatalogFilters = {
  search: "",
  cuisine: "",
  mealType: "",
  intent: "",
  photoStatus: "all",
  photoQaStatus: "all",
  recipeQaStatus: "all",
  hasQaWarnings: false,
  source: "all",
};

export type CatalogSummary = {
  totalRecipes: number;
  canonicalCount: number;
  draftCount: number;
  recipesWithPhotos: number;
  cuisineCount: number;
  missingPhotoCount: number;
  photoReviewCounts: Record<PhotoReviewStatus, number>;
  recipeQaCounts: Record<RecipeQaStatus, number>;
  warningCount: number;
};

export const STUDIO_PAGE_SIZE = 24;

const inspectedSet = new Set<string>(INSPECTED_CORRECT_RECIPE_IMAGE_IDS);
const needsPhotoSet = new Set<string>(NEEDS_ACCURATE_PHOTOGRAPHY_RECIPE_IDS);

export function resolveCatalogPhotoStatus(
  dish: DishCatalogEntry,
): CatalogPhotoStatus {
  if (isDishPlaceholderUrl(dish.imageUrl)) return "placeholder";
  if (inspectedSet.has(dish.id)) return "verified";
  if (needsPhotoSet.has(dish.id)) return "placeholder";
  return "missing_registry";
}

export function resolveImageIntegrityLabel(dish: DishCatalogEntry): string {
  const status = resolveCatalogPhotoStatus(dish);
  if (status === "verified") return "Registry verified JPG";
  if (status === "placeholder") return "Placeholder / needs photography";
  return "Missing from image registry";
}

export function dishMatchesIntentFilter(
  dish: DishCatalogEntry,
  intent: IntentFilterTag,
): boolean {
  switch (intent) {
    case "budget":
      return dish.mealIntents.includes("budget");
    case "healthy":
      return dish.mealIntents.includes("healthy");
    case "special":
      return dish.mealIntents.includes("special");
    case "quick":
      return dish.mealIntents.includes("quick");
    case "filling":
      return dish.mealIntents.includes("high_calorie");
    case "vegetarian":
      return dish.dietaryTags.includes("vegetarian_ok");
    case "light":
      return deriveMealBalance(dish) === "light";
    default:
      return true;
  }
}

export function filterStudioRecipes(
  recipes: readonly StudioRecipeView[],
  filters: CatalogFilters,
): StudioRecipeView[] {
  const search = filters.search.trim().toLowerCase();

  return recipes.filter((recipe) => {
    if (search) {
      const aliases = (CONSUMER_RECIPE_SEARCH_ALIASES[recipe.id] ?? []).join(" ");
      const haystack = `${recipe.id} ${recipe.title} ${aliases}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (filters.cuisine && recipe.cuisineFamilyId !== filters.cuisine) return false;
    if (
      filters.mealType &&
      !recipe.mealTypes.includes(filters.mealType as MealType)
    ) {
      return false;
    }
    if (filters.intent && !dishMatchesIntentFilter(recipe, filters.intent)) {
      return false;
    }
    if (
      filters.photoStatus !== "all" &&
      resolveCatalogPhotoStatus(recipe) !== filters.photoStatus
    ) {
      return false;
    }
    if (
      filters.photoQaStatus !== "all" &&
      recipe.photoQaStatus !== filters.photoQaStatus
    ) {
      return false;
    }
    if (
      filters.recipeQaStatus !== "all" &&
      recipe.recipeQaStatus !== filters.recipeQaStatus
    ) {
      return false;
    }
    if (filters.hasQaWarnings && !recipeHasQaWarnings(recipe)) return false;
    if (filters.source === "canonical" && recipe.isDraft) return false;
    if (filters.source === "draft" && !recipe.isDraft) return false;
    return true;
  });
}

export function buildStudioSummary(
  recipes: readonly StudioRecipeView[],
): CatalogSummary {
  const cuisines = new Set(recipes.map((d) => d.cuisineFamilyId));
  let recipesWithPhotos = 0;
  let missingPhotoCount = 0;
  let canonicalCount = 0;
  let draftCount = 0;

  for (const dish of recipes) {
    if (dish.isDraft) draftCount += 1;
    else canonicalCount += 1;
    const status = resolveCatalogPhotoStatus(dish);
    if (status === "verified") recipesWithPhotos += 1;
    else missingPhotoCount += 1;
  }

  return {
    totalRecipes: recipes.length,
    canonicalCount,
    draftCount,
    recipesWithPhotos,
    cuisineCount: cuisines.size,
    missingPhotoCount,
    photoReviewCounts: countPhotoReviewsByStatus(
      recipes.map((d) => d.id),
      Object.fromEntries(recipes.map((r) => [r.id, r.photoQaStatus])),
    ),
    recipeQaCounts: {
      draft: recipes.filter((r) => r.recipeQaStatus === "draft").length,
      needs_correction: recipes.filter(
        (r) => r.recipeQaStatus === "needs_correction",
      ).length,
      approved: recipes.filter((r) => r.recipeQaStatus === "approved").length,
    },
    warningCount: recipes.filter((d) => recipeHasQaWarnings(d)).length,
  };
}

export function paginateStudioRecipes<T>(
  items: readonly T[],
  page: number,
  pageSize = STUDIO_PAGE_SIZE,
): {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
} {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
  };
}

export function listUniqueCuisinesFromStudio(
  recipes: readonly StudioRecipeView[],
): string[] {
  return [...new Set(recipes.map((d) => d.cuisineFamilyId))].sort();
}

export function listUniqueMealTypesFromStudio(
  recipes: readonly StudioRecipeView[],
): MealType[] {
  const types = new Set<MealType>();
  for (const dish of recipes) {
    for (const type of dish.mealTypes) types.add(type);
  }
  return [...types].sort();
}

export function assertRecipeDetailIntegrity(
  dish: DishCatalogEntry,
  resolved: DishCatalogEntry | undefined,
): boolean {
  if (!resolved) return false;
  return resolved.id === dish.id;
}
