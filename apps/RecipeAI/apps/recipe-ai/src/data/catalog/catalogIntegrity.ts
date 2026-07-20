/**
 * Catalog + image integrity audit — single programmatic source of truth.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { listAllDishes } from "./dishes";
import {
  INSPECTED_CORRECT_RECIPE_IMAGE_IDS,
  NEEDS_ACCURATE_PHOTOGRAPHY_RECIPE_IDS,
  NEEDS_PHOTO_PLACEHOLDER_PATH,
  dishPhotoPath,
} from "./imageAssets";
import { DISH_INTENT_META, auditCuisineIntentCoverage } from "./mealIntentMeta";
import { dayIntentFit } from "./decision/dayIntent";
import { isVegetarianMainDish } from "./decision/householdCuisine";
import type { DishCatalogEntry, MealIntentTag } from "./types";
import type { DayPlanIntent } from "@recipe-ai/core/types";

export type CatalogImageAudit = {
  totalRecipes: number;
  verifiedPhotoCount: number;
  placeholderPhotoCount: number;
  missingFromImageLists: string[];
  extraInImageLists: string[];
  countsBalanced: boolean;
};

export type ImageFileAudit = {
  recipeId: string;
  expectedRelativePath: string;
  fileExists: boolean;
  usesPlaceholderUrl: boolean;
  sha256?: string;
};

export type DuplicateImageGroup = {
  sha256: string;
  recipeIds: string[];
};

export function cuisineFolderFor(cuisineFamilyId: string): string {
  return cuisineFamilyId === "central_european"
    ? "central-european"
    : cuisineFamilyId;
}

export function expectedJpgRelativePath(dish: DishCatalogEntry): string {
  // Prefer the wired catalog URL when it already points at a real dish JPG
  // (allows dedicated filenames such as musakhan-wraps.jpg for sumac-chicken).
  const wired = dish.imageUrl.split("?")[0] ?? "";
  if (wired.startsWith("/assets/dishes/") && wired.endsWith(".jpg")) {
    return wired;
  }
  const folder = cuisineFolderFor(dish.cuisineFamilyId);
  return `/assets/dishes/${folder}/${dish.id}.jpg`;
}

export function auditCatalogImageRegistry(): CatalogImageAudit {
  const dishes = listAllDishes();
  const catalogIds = dishes.map((d) => d.id);
  const registryIds = new Set<string>([
    ...INSPECTED_CORRECT_RECIPE_IMAGE_IDS,
    ...NEEDS_ACCURATE_PHOTOGRAPHY_RECIPE_IDS,
  ]);

  const missingFromImageLists = catalogIds.filter((id) => !registryIds.has(id));
  const extraInImageLists = [...registryIds].filter((id) => !catalogIds.includes(id));

  return {
    totalRecipes: catalogIds.length,
    verifiedPhotoCount: INSPECTED_CORRECT_RECIPE_IMAGE_IDS.length,
    placeholderPhotoCount: NEEDS_ACCURATE_PHOTOGRAPHY_RECIPE_IDS.length,
    missingFromImageLists,
    extraInImageLists,
    countsBalanced:
      missingFromImageLists.length === 0 &&
      extraInImageLists.length === 0 &&
      INSPECTED_CORRECT_RECIPE_IMAGE_IDS.length +
        NEEDS_ACCURATE_PHOTOGRAPHY_RECIPE_IDS.length ===
        catalogIds.length,
  };
}

export function auditImageFiles(
  publicAssetsRoot: string,
): ImageFileAudit[] {
  return listAllDishes().map((dish) => {
    const rel = expectedJpgRelativePath(dish);
    const abs = path.join(publicAssetsRoot, rel.replace(/^\//, ""));
    const usesPlaceholderUrl = dish.imageUrl.includes(NEEDS_PHOTO_PLACEHOLDER_PATH);
    const fileExists = fs.existsSync(abs);
    let sha256: string | undefined;
    if (fileExists) {
      const buf = fs.readFileSync(abs);
      sha256 = crypto.createHash("sha256").update(buf).digest("hex");
    }
    return {
      recipeId: dish.id,
      expectedRelativePath: rel,
      fileExists,
      usesPlaceholderUrl,
      sha256,
    };
  });
}

/** Finds byte-identical JPGs assigned to different recipe identities. */
export function findDuplicateImageGroups(
  fileAudits: ImageFileAudit[],
): DuplicateImageGroup[] {
  const byHash = new Map<string, string[]>();
  for (const row of fileAudits) {
    if (!row.sha256) continue;
    const list = byHash.get(row.sha256) ?? [];
    list.push(row.recipeId);
    byHash.set(row.sha256, list);
  }
  return [...byHash.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([sha256, recipeIds]) => ({ sha256, recipeIds: [...recipeIds].sort() }));
}

export function buildCoverageMatrix(
  dishes: DishCatalogEntry[] = listAllDishes(),
): Record<
  string,
  Record<MealIntentTag | DayPlanIntent | "dinner_complete" | "vegetarian_ok", string[]>
> {
  const cuisines = [...new Set(dishes.map((d) => d.cuisineFamilyId))];
  const intents: DayPlanIntent[] = [
    "budget",
    "healthy",
    "light",
    "high_calorie",
    "special",
    "quick",
    "vegetarian",
  ];
  const base = auditCuisineIntentCoverage(dishes);
  const out: Record<string, Record<string, string[]>> = {};

  for (const cuisine of cuisines) {
    const mains = dishes.filter(
      (d) =>
        d.cuisineFamilyId === cuisine && d.mealSlotRole === "dinner_complete",
    );
    out[cuisine] = {
      dinner_complete: mains.map((d) => d.id),
      vegetarian_ok: mains
        .filter((d) => d.dietaryTags.includes("vegetarian_ok"))
        .map((d) => d.id),
    };
    for (const intent of intents) {
      out[cuisine]![intent] = mains
        .filter((d) =>
          intent === "vegetarian"
            ? isVegetarianMainDish(d)
            : dayIntentFit(d, intent) > 0,
        )
        .map((d) => d.id);
    }
    for (const tag of [
      "budget",
      "healthy",
      "high_calorie",
      "special",
      "quick",
      "family_friendly",
    ] as MealIntentTag[]) {
      const key = `tag_${tag}`;
      out[cuisine]![key] = mains
        .filter((d) => d.mealIntents.includes(tag))
        .map((d) => d.id);
    }
  }
  return out as Record<
    string,
    Record<MealIntentTag | DayPlanIntent | "dinner_complete" | "vegetarian_ok", string[]>
  >;
}

export function assertCatalogMetadataIntegrity(dish: DishCatalogEntry): void {
  if (!DISH_INTENT_META[dish.id]) {
    throw new Error(`missing DISH_INTENT_META for ${dish.id}`);
  }
  if (dish.mealSlotRole === "dinner_complete" && dish.allergens.length >= 0) {
    if (!dish.allergenDeclared) {
      throw new Error(`${dish.id} allergenDeclared false`);
    }
  }
  if (
    dish.dietaryTags.includes("vegetarian_ok") &&
    dish.dietaryTags.includes("contains_meat")
  ) {
    throw new Error(`${dish.id} vegetarian_ok conflicts with contains_meat`);
  }
  if (dish.pantryIngredients.length < 1) {
    throw new Error(`${dish.id} missing pantryIngredients`);
  }
}

export function resolvePublicAssetsRoot(fromCatalogDir: string): string {
  return path.join(fromCatalogDir, "../../../public");
}

export { dishPhotoPath };
