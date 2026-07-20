/**
 * Display-logic checks for Admin recipe cards (no status mutations).
 */
import assert from "node:assert/strict";
import { isDishPlaceholderUrl } from "../src/components/dishImageStyle.ts";
import { NEEDS_PHOTO_PLACEHOLDER_PATH } from "../src/data/catalog/imageAssets.ts";
import { emptyStudioState } from "../src/admin/recipeStudioStorage.ts";
import { createDraftFromCreationInput } from "../src/admin/recipeStudioTypes.ts";
import { saveRecipeQaToStore } from "../src/admin/recipeQaReview.ts";
import { savePhotoReviewToStore } from "../src/admin/recipePhotoReview.ts";
import { listStudioRecipeViews } from "../src/admin/recipeStudioMerge.ts";
import { findGeneratedRecipe } from "../src/admin/generatedRecipeLibrary.ts";
import {
  generateDraftContent,
  metadataPatchFromGeneratedRecipe,
} from "../src/admin/recipeAiGeneration.ts";

function showDraftOverlay(recipe: {
  isDraft: boolean;
  recipeQaStatus: string;
}): boolean {
  return recipe.isDraft && recipe.recipeQaStatus === "draft";
}

function showPhotoGap(imageUrl: string | undefined): boolean {
  return !imageUrl || isDishPlaceholderUrl(imageUrl);
}

// --- Yalanji: Recipe Approved + Photo Approved ---
const yalanjiId = "draft-mrrfvax1";
let yalanjiDraft = createDraftFromCreationInput(yalanjiId, {
  dishName: "Yalanji",
  cuisineFamilyId: "arab",
});
const gen = generateDraftContent({
  dishName: "Yalanji",
  cuisineFamilyId: "arab",
});
if (gen.status === "generated") {
  yalanjiDraft = { ...yalanjiDraft, ...gen.draftPatch };
}
// Ensure a real image path when library provides one
const lib = findGeneratedRecipe("Yalanji");
if (lib?.photo.preparedImageUrl) {
  yalanjiDraft = { ...yalanjiDraft, imageUrl: lib.photo.preparedImageUrl };
}

const studioY = {
  ...emptyStudioState(),
  drafts: { [yalanjiId]: yalanjiDraft },
  recipeQa: saveRecipeQaToStore({}, yalanjiId, { status: "approved" }),
};
const photoY = savePhotoReviewToStore({}, yalanjiId, "approved");
const yalanji = listStudioRecipeViews(
  studioY.overrides,
  studioY.drafts,
  studioY.recipeQa,
  photoY,
).find((v) => v.id === yalanjiId)!;

assert.equal(yalanji.recipeQaStatus, "approved");
assert.equal(yalanji.photoQaStatus, "approved");
assert.equal(showDraftOverlay(yalanji), false, "Yalanji: no DRAFT overlay");
assert.equal(
  showPhotoGap(yalanji.imageUrl),
  false,
  `Yalanji: no Photo gap (imageUrl=${yalanji.imageUrl})`,
);
assert.equal(yalanji.isDraft, true, "still a draft record internally");

// --- Unapproved draft: DRAFT badge still visible ---
const unapprovedId = "draft-unapproved-test";
const unapprovedDraft = createDraftFromCreationInput(unapprovedId, {
  dishName: "Untitled draft",
  cuisineFamilyId: "arab",
});
const studioU = {
  ...emptyStudioState(),
  drafts: { [unapprovedId]: unapprovedDraft },
  recipeQa: saveRecipeQaToStore({}, unapprovedId, { status: "draft" }),
};
const photoU = savePhotoReviewToStore({}, unapprovedId, "pending");
const unapproved = listStudioRecipeViews(
  studioU.overrides,
  studioU.drafts,
  studioU.recipeQa,
  photoU,
).find((v) => v.id === unapprovedId)!;

assert.equal(unapproved.recipeQaStatus, "draft");
assert.equal(showDraftOverlay(unapproved), true, "unapproved: DRAFT overlay visible");
assert.equal(
  showPhotoGap(unapproved.imageUrl) ||
    unapproved.imageUrl.includes(NEEDS_PHOTO_PLACEHOLDER_PATH),
  true,
  "unapproved without image: Photo gap allowed",
);

console.log(
  JSON.stringify(
    {
      ok: true,
      yalanji: {
        id: yalanji.id,
        recipeQa: yalanji.recipeQaStatus,
        photoQa: yalanji.photoQaStatus,
        showDraftOverlay: showDraftOverlay(yalanji),
        showPhotoGap: showPhotoGap(yalanji.imageUrl),
        badgesExpected: ["Photo: Approved", "Recipe: Approved"],
      },
      unapprovedDraft: {
        id: unapproved.id,
        recipeQa: unapproved.recipeQaStatus,
        showDraftOverlay: showDraftOverlay(unapproved),
        showPhotoGap: showPhotoGap(unapproved.imageUrl),
      },
    },
    null,
    2,
  ),
);
