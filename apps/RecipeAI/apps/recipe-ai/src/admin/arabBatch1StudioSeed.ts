/**
 * Seeds Arab Batch 1 curated recipes into the INTERNAL Admin Recipe Studio
 * draft store so they appear in /admin/recipes as reviewable drafts.
 *
 * GENERATED_RECIPE_LIBRARY alone only powers the Generate provider — it does
 * not populate studio.drafts. This module bridges that gap without promoting
 * anything to the consumer catalog.
 *
 * Idempotent: never duplicates by stable id or by title; never overwrites an
 * existing draft (so human edits are preserved).
 */

import {
  draftPatchFromGeneratedRecipe,
  metadataPatchFromGeneratedRecipe,
} from "./recipeAiGeneration";
import type { GeneratedRecipe } from "./generatedRecipeLibrary";
import { ARAB_BATCH_1 } from "./arabBatch1Library";
import {
  createDraftFromCreationInput,
  emptyStudioMetadata,
  type DraftRecipeRecord,
  type RecipeStudioPersistedState,
} from "./recipeStudioTypes";

/** Stable Studio draft id derived from the prepared image slug. */
export function arabBatch1DraftId(recipe: GeneratedRecipe): string {
  const url = recipe.photo.preparedImageUrl ?? "";
  const match = url.match(/\/([^/]+)\.jpg$/i);
  const slug = match?.[1] ?? recipe.canonicalTitle.toLowerCase().replace(/\s+/g, "-");
  return `draft-arab-batch1-${slug}`;
}

export function buildArabBatch1DraftRecord(
  recipe: GeneratedRecipe,
): DraftRecipeRecord {
  const id = arabBatch1DraftId(recipe);
  const base = createDraftFromCreationInput(id, {
    dishName: recipe.canonicalTitle,
    cuisineFamilyId: recipe.cuisineFamilyId,
    regionSubcuisine: recipe.regionSubcuisine,
    adminNote: `Arab Batch 1 curated draft for human review — ${recipe.regionSubcuisine}`,
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

export function listArabBatch1DraftIds(): string[] {
  return ARAB_BATCH_1.map(arabBatch1DraftId);
}

/**
 * Merge Batch 1 into a Studio persisted state as reviewable drafts.
 * Does not touch the consumer catalog. Safe to call on every load.
 */
export function ensureArabBatch1StudioDrafts(
  state: RecipeStudioPersistedState,
): RecipeStudioPersistedState {
  const drafts = { ...state.drafts };
  const metadata = { ...state.metadata };
  const recipeQa = { ...state.recipeQa };
  const existingTitles = new Set(
    Object.values(drafts).map((d) => d.title.trim().toLowerCase()),
  );

  let changed = false;

  for (const recipe of ARAB_BATCH_1) {
    const id = arabBatch1DraftId(recipe);
    const titleKey = recipe.canonicalTitle.trim().toLowerCase();

    // Already seeded by id — leave human edits alone.
    if (drafts[id]) continue;
    // Already present under another draft id (manual create) — do not duplicate.
    if (existingTitles.has(titleKey)) continue;

    drafts[id] = buildArabBatch1DraftRecord(recipe);
    metadata[id] = metadataPatchFromGeneratedRecipe(
      recipe,
      {
        ...emptyStudioMetadata(),
        creationNote: `Arab Batch 1 curated draft for human review — ${recipe.regionSubcuisine}`,
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
