/**
 * Seeds Arab Batch 2 Group 2 curated recipes into Admin Recipe Studio drafts.
 * Idempotent; never overwrites human edits; never touches consumer catalog.
 */

import {
  draftPatchFromGeneratedRecipe,
  metadataPatchFromGeneratedRecipe,
} from "./recipeAiGeneration";
import type { GeneratedRecipe } from "./generatedRecipeLibrary";
import { ARAB_BATCH_2_GROUP_2 } from "./arabBatch2Group2Library";
import { slugifyBatch2Title } from "./arabBatch2Group1Shared";
import {
  createDraftFromCreationInput,
  emptyStudioMetadata,
  type DraftRecipeRecord,
  type RecipeStudioPersistedState,
} from "./recipeStudioTypes";

export function arabBatch2Group2DraftId(recipe: GeneratedRecipe): string {
  return `draft-arab-batch2-g2-${slugifyBatch2Title(recipe.canonicalTitle)}`;
}

export function buildArabBatch2Group2DraftRecord(
  recipe: GeneratedRecipe,
): DraftRecipeRecord {
  const id = arabBatch2Group2DraftId(recipe);
  const base = createDraftFromCreationInput(id, {
    dishName: recipe.canonicalTitle,
    cuisineFamilyId: recipe.cuisineFamilyId,
    regionSubcuisine: recipe.regionSubcuisine,
    adminNote: `Arab Batch 2 Group 2 curated draft — ${recipe.regionSubcuisine}`,
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

export function listArabBatch2Group2DraftIds(): string[] {
  return ARAB_BATCH_2_GROUP_2.map(arabBatch2Group2DraftId);
}

export function ensureArabBatch2Group2StudioDrafts(
  state: RecipeStudioPersistedState,
): RecipeStudioPersistedState {
  const drafts = { ...state.drafts };
  const metadata = { ...state.metadata };
  const recipeQa = { ...state.recipeQa };
  const existingTitles = new Set(
    Object.values(drafts).map((d) => d.title.trim().toLowerCase()),
  );

  let changed = false;

  for (const recipe of ARAB_BATCH_2_GROUP_2) {
    const id = arabBatch2Group2DraftId(recipe);
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

    drafts[id] = buildArabBatch2Group2DraftRecord(recipe);
    metadata[id] = metadataPatchFromGeneratedRecipe(
      recipe,
      {
        ...emptyStudioMetadata(),
        creationNote: `Arab Batch 2 Group 2 curated draft — ${recipe.regionSubcuisine}`,
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
