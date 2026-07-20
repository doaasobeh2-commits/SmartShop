import type { CuisineFamilyId } from "@recipe-ai/core/types";
import type { AppLocale } from "../i18n/types";
import { DEFAULT_IMAGE_QUALITY_GUIDANCE } from "../components/responsiveDishImage";
import type { GeneratedRecipe } from "./generatedRecipeLibrary";
import {
  getActiveRecipeProvider,
  isRecipeGenerationConfigured,
} from "./recipeGenerationProviders";
import type {
  DraftCreationInput,
  DraftRecipeRecord,
  NaturalYieldModel,
  StudioRecipeMetadata,
} from "./recipeStudioTypes";

export type AiGenerationPromptPayload = {
  dishName: string;
  cuisineFamilyId: CuisineFamilyId;
  regionSubcuisine?: string;
  adminNote?: string;
  naturalYield?: NaturalYieldModel;
  authenticityRequirements?: string;
  safetyRequirements: string;
  localizationTargets: AppLocale[];
  photoBriefRequirements: string;
  imageQualityGuidance: string;
  scalingNote?: string;
};

export type AiGenerationAttemptResult =
  | { status: "not_configured"; message: string; prompt: AiGenerationPromptPayload }
  | { status: "success"; prompt: AiGenerationPromptPayload; draftPatch: Partial<DraftRecipeRecord> };

const LOCALIZATION_TARGETS: AppLocale[] = ["en", "de", "ar", "tr"];

const SAFETY_REQUIREMENTS = `Declare allergens explicitly. Do not invent vegetarian/vegan claims. Fail closed on unknown allergen metadata. No medical or nutrition claims.`;

/**
 * True when at least one recipe generation provider is configured. A curated
 * local authored provider is always available, so this is now true. Image
 * generation configuration is tracked separately (see providers module).
 */
export function isAiGenerationConfigured(): boolean {
  return isRecipeGenerationConfigured();
}

export function buildAiGenerationPromptPayload(input: {
  dishName: string;
  cuisineFamilyId: CuisineFamilyId;
  regionSubcuisine?: string;
  adminNote?: string;
  metadata?: StudioRecipeMetadata;
}): AiGenerationPromptPayload {
  const naturalYield = input.metadata?.naturalYield;
  return {
    dishName: input.dishName.trim(),
    cuisineFamilyId: input.cuisineFamilyId,
    regionSubcuisine: input.regionSubcuisine ?? input.metadata?.regionSubcuisine,
    adminNote: input.adminNote ?? input.metadata?.creationNote,
    naturalYield,
    authenticityRequirements:
      input.metadata?.culturalAuthenticityNotes ??
      input.metadata?.culturalReviewNote,
    safetyRequirements: SAFETY_REQUIREMENTS,
    localizationTargets: LOCALIZATION_TARGETS,
    photoBriefRequirements:
      input.metadata?.imagePrompt ??
      `Identity-accurate food photography for ${input.dishName}.`,
    imageQualityGuidance:
      input.metadata?.imageQualityGuidance ?? DEFAULT_IMAGE_QUALITY_GUIDANCE,
    scalingNote: naturalYield?.scalingNote,
  };
}

function cuisineFolderFor(cuisine: CuisineFamilyId): string {
  return cuisine === "central_european" ? "central-european" : cuisine;
}

/** Map curated generated content onto a draft-record patch (no auto-publish). */
export function draftPatchFromGeneratedRecipe(
  recipe: GeneratedRecipe,
): Partial<DraftRecipeRecord> {
  return {
    title: recipe.canonicalTitle,
    cuisineFamilyId: recipe.cuisineFamilyId,
    cuisineFolder: cuisineFolderFor(recipe.cuisineFamilyId),
    prepMinutes: recipe.prepMinutes,
    servings: recipe.servings,
    difficulty: recipe.difficulty,
    mealTypes: [...recipe.mealTypes],
    mealSlotRole: recipe.mealSlotRole,
    suitability: [...recipe.suitability],
    ingredientTokens: [...recipe.ingredientTokens],
    pantryIngredients: recipe.pantryIngredients.map((p) => ({
      ...p,
      tokens: [...p.tokens],
    })),
    allergens: [...recipe.allergens],
    mayContain: [...recipe.mayContain],
    allergenDeclared: recipe.allergenDeclared,
    dietaryTags: [...recipe.dietaryTags],
    mealIntents: [...recipe.mealIntents],
    budgetTier: recipe.budgetTier,
    proteinCategory: recipe.proteinCategory,
    moods: [...recipe.moods],
    ingredients: recipe.ingredients.map((i) => ({ ...i })),
    localeCopy: {
      en: { ...recipe.localeCopy.en },
      de: { ...recipe.localeCopy.de },
      ar: { ...recipe.localeCopy.ar },
      tr: { ...recipe.localeCopy.tr },
    },
    naturalYield: { ...recipe.naturalYield },
    defaultRole: recipe.defaultRole,
    canServeAsMain: recipe.canServeAsMain,
    regionSubcuisine: recipe.regionSubcuisine,
    imageUrl: recipe.photo.preparedImageUrl,
  };
}

/** Map curated generated content onto a studio-metadata patch. */
export function metadataPatchFromGeneratedRecipe(
  recipe: GeneratedRecipe,
  base: StudioRecipeMetadata,
  promptJson: string,
): StudioRecipeMetadata {
  return {
    ...base,
    naturalYield: { ...recipe.naturalYield },
    regionSubcuisine: recipe.regionSubcuisine,
    imagePrompt: recipe.photo.brief,
    platingNotes: recipe.photo.platingNotes,
    culturalAuthenticityNotes: recipe.photo.culturalAuthenticityNotes,
    focalPointX: recipe.photo.focalPointX,
    focalPointY: recipe.photo.focalPointY,
    imageQualityGuidance: recipe.photo.imageQualityGuidance,
    lastAiPromptJson: promptJson,
  };
}

export type GenerateDraftContentResult =
  | {
      status: "generated";
      providerId: string;
      recipe: GeneratedRecipe;
      draftPatch: Partial<DraftRecipeRecord>;
      prompt: AiGenerationPromptPayload;
    }
  | { status: "unsupported"; message: string; prompt: AiGenerationPromptPayload }
  | { status: "unavailable"; message: string; prompt: AiGenerationPromptPayload };

/**
 * Generate full draft content for a dish via the active provider. Never marks
 * QA — callers must keep Recipe QA = Draft and Photo QA = Pending.
 */
export function generateDraftContent(input: {
  dishName: string;
  cuisineFamilyId: CuisineFamilyId;
  regionSubcuisine?: string;
  adminNote?: string;
  metadata?: StudioRecipeMetadata;
}): GenerateDraftContentResult {
  const prompt = buildAiGenerationPromptPayload(input);
  const provider = getActiveRecipeProvider(input.dishName);
  if (!provider) {
    return {
      status: "unavailable",
      message:
        "No recipe generation provider is configured. Connect a provider to generate drafts.",
      prompt,
    };
  }
  const outcome = provider.generateRecipe({
    dishName: input.dishName,
    regionSubcuisine: input.regionSubcuisine,
  });
  if (outcome.status !== "generated") {
    return { status: outcome.status, message: outcome.message, prompt };
  }
  return {
    status: "generated",
    providerId: outcome.providerId,
    recipe: outcome.recipe,
    draftPatch: draftPatchFromGeneratedRecipe(outcome.recipe),
    prompt,
  };
}

/**
 * Legacy contract kept for callers/tests that only need the prompt payload and
 * a configured/not-configured signal. Never auto-publishes.
 */
export function attemptAiDraftGeneration(input: {
  dishName: string;
  cuisineFamilyId: CuisineFamilyId;
  regionSubcuisine?: string;
  adminNote?: string;
  metadata?: StudioRecipeMetadata;
}): AiGenerationAttemptResult {
  const prompt = buildAiGenerationPromptPayload(input);
  const result = generateDraftContent(input);
  if (result.status === "generated") {
    return { status: "success", prompt, draftPatch: result.draftPatch };
  }
  return { status: "not_configured", message: result.message, prompt };
}

export function creationInputFromDraft(
  draft: DraftRecipeRecord,
  metadata?: StudioRecipeMetadata,
): DraftCreationInput {
  return {
    dishName: draft.title,
    cuisineFamilyId: draft.cuisineFamilyId,
    regionSubcuisine: metadata?.regionSubcuisine ?? draft.regionSubcuisine,
    adminNote: metadata?.creationNote ?? draft.creationNote,
  };
}
