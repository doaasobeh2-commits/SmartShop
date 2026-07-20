/**
 * Seeds Arab Batch 2 Group 1 curated recipes into Admin Recipe Studio drafts.
 * Idempotent; never overwrites human edits; never touches consumer catalog.
 * No prepared images in this pass — Photo QA remains Pending.
 */

import {
  draftPatchFromGeneratedRecipe,
  metadataPatchFromGeneratedRecipe,
} from "./recipeAiGeneration";
import type { GeneratedRecipe } from "./generatedRecipeLibrary";
import { ARAB_BATCH_2_GROUP_1 } from "./arabBatch2Group1Library";
import { slugifyBatch2Title } from "./arabBatch2Group1Shared";
import {
  createDraftFromCreationInput,
  emptyStudioMetadata,
  type DraftRecipeRecord,
  type RecipeStudioPersistedState,
} from "./recipeStudioTypes";

export function arabBatch2Group1DraftId(recipe: GeneratedRecipe): string {
  return `draft-arab-batch2-g1-${slugifyBatch2Title(recipe.canonicalTitle)}`;
}

export function buildArabBatch2Group1DraftRecord(
  recipe: GeneratedRecipe,
): DraftRecipeRecord {
  const id = arabBatch2Group1DraftId(recipe);
  const base = createDraftFromCreationInput(id, {
    dishName: recipe.canonicalTitle,
    cuisineFamilyId: recipe.cuisineFamilyId,
    regionSubcuisine: recipe.regionSubcuisine,
    adminNote: `Arab Batch 2 Group 1 curated draft — ${recipe.regionSubcuisine}`,
  });
  const patch = draftPatchFromGeneratedRecipe(recipe);
  return {
    ...base,
    ...patch,
    id,
    companionIds: base.companionIds,
    createdAt: base.createdAt,
    updatedAt: base.updatedAt,
  };
}

export function listArabBatch2Group1DraftIds(): string[] {
  return ARAB_BATCH_2_GROUP_1.map(arabBatch2Group1DraftId);
}

export function ensureArabBatch2Group1StudioDrafts(
  state: RecipeStudioPersistedState,
): RecipeStudioPersistedState {
  const drafts = { ...state.drafts };
  const metadata = { ...state.metadata };
  const recipeQa = { ...state.recipeQa };
  const existingTitles = new Set(
    Object.values(drafts).map((d) => d.title.trim().toLowerCase()),
  );

  let changed = false;

  for (const recipe of ARAB_BATCH_2_GROUP_1) {
    const id = arabBatch2Group1DraftId(recipe);
    const titleKey = recipe.canonicalTitle.trim().toLowerCase();

    if (drafts[id]) {
      // Backfill imageUrl if it was missing in the draft (e.g. from previous seeding)
      // but is now available in the library.
      if (!drafts[id].imageUrl && recipe.photo.preparedImageUrl) {
        drafts[id] = { ...drafts[id], imageUrl: recipe.photo.preparedImageUrl };
        changed = true;
      }
      continue;
    }
    if (existingTitles.has(titleKey)) continue;

    drafts[id] = buildArabBatch2Group1DraftRecord(recipe);
    metadata[id] = metadataPatchFromGeneratedRecipe(
      recipe,
      {
        ...emptyStudioMetadata(),
        creationNote: `Arab Batch 2 Group 1 curated draft — ${recipe.regionSubcuisine}`,
      },
      "{}",
    );
    if (!recipeQa[id]) {
      recipeQa[id] = { status: "draft" };
    }
    existingTitles.add(titleKey);
    changed = true;
  }

  if (!changed) return state;
  return { ...state, drafts, metadata, recipeQa };
}
