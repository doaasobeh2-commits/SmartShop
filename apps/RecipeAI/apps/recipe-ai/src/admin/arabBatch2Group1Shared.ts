/**
 * Shared helpers for Arab Batch 2 Studio fixtures (Group 1 + Group 2).
 * Draft sources only — no consumer catalog promotion; Photo QA Pending (no images).
 */

import { DEFAULT_IMAGE_QUALITY_GUIDANCE } from "../components/responsiveDishImage";
import type { GeneratedRecipe, GeneratedRecipePhotoBrief } from "./generatedRecipeLibrary";
import type { StudioEditableIngredient, StudioLocaleCopy } from "./recipeStudioTypes";

export const B2G1_REGION = "Syrian (Levantine)" as const;
export const B2_REGION_LEBANESE = "Lebanese (Levantine)" as const;
export const B2_REGION_TUNISIAN = "Tunisian (Maghreb)" as const;
export const B2_REGION_MOROCCAN = "Moroccan (Maghreb)" as const;

export function b2g1Photo(
  brief: string,
  platingNotes: string,
  culturalAuthenticityNotes: string,
  preparedImageUrl?: string,
): GeneratedRecipePhotoBrief {
  return {
    brief,
    platingNotes,
    culturalAuthenticityNotes,
    focalPointX: 50,
    focalPointY: 50,
    imageQualityGuidance: DEFAULT_IMAGE_QUALITY_GUIDANCE,
    ...(preparedImageUrl ? { preparedImageUrl } : {}),
  };
}

export function b2g1Ing(
  id: string,
  en: string,
  de: string,
  ar: string,
  tr: string,
  detailEn: string,
  detailDe: string,
  detailAr: string,
  detailTr: string,
): StudioEditableIngredient {
  return {
    id,
    en,
    de,
    ar,
    tr,
    detailEn,
    detailDe,
    detailAr,
    detailTr,
    status: "need",
  };
}

export function b2g1Loc(
  reason: string,
  cuisineLabel: string,
  tips: string[],
  storageTip: string,
  steps: string[],
): StudioLocaleCopy {
  return { reason, cuisineLabel, tips, storageTip, steps };
}

export type B2G1Base = Omit<
  GeneratedRecipe,
  "cuisineFamilyId" | "regionSubcuisine" | "mayContain" | "allergenDeclared"
>;

export function b2g1Recipe(recipe: B2G1Base): GeneratedRecipe {
  return b2Recipe(recipe, B2G1_REGION);
}

export function b2Recipe(
  recipe: B2G1Base,
  regionSubcuisine: string,
): GeneratedRecipe {
  const titleKey = slugifyBatch2Title(recipe.canonicalTitle).replace(/-/g, " ");
  const matchKeys = recipe.matchKeys.includes(titleKey)
    ? recipe.matchKeys
    : [titleKey, ...recipe.matchKeys];
  return {
    ...recipe,
    matchKeys,
    cuisineFamilyId: "arab",
    regionSubcuisine,
    mayContain: [],
    allergenDeclared: true,
  };
}

export function slugifyBatch2Title(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}
