/**
 * Single-recipe Photo QA approve test: Yalanji — draft-mrrfvax1
 */
import assert from "node:assert/strict";
import { emptyStudioState, loadStudioState } from "../src/admin/recipeStudioStorage.ts";
import { saveRecipeQaToStore, getRecipeQaEntry } from "../src/admin/recipeQaReview.ts";
import {
  PHOTO_REVIEW_STORAGE_KEY,
  getPhotoReviewStatus,
  loadPhotoReviewStore,
  savePhotoReviewToStore,
} from "../src/admin/recipePhotoReview.ts";
import { seedPhotoQaFromKnownFindings } from "../src/admin/recipeStudioKnownFindings.ts";
import { listStudioRecipeViews } from "../src/admin/recipeStudioMerge.ts";
import { isInConsumerCatalog } from "../src/admin/consumerIsolation.ts";
import { createDraftFromCreationInput } from "../src/admin/recipeStudioTypes.ts";

const DRAFT_ID = "draft-mrrfvax1";

// Simulate the user's Yalanji draft (local Studio id) with Recipe QA already Approved.
let studio = emptyStudioState();
const draft = createDraftFromCreationInput(DRAFT_ID, {
  dishName: "Yalanji",
  cuisineFamilyId: "arab",
  regionSubcuisine: "Syrian (Levantine)",
});
studio = {
  ...studio,
  drafts: { ...studio.drafts, [DRAFT_ID]: draft },
  recipeQa: saveRecipeQaToStore(studio.recipeQa, DRAFT_ID, {
    status: "approved",
    notes: "Recipe QA already Approved before photo test",
  }),
};

let photoReview = seedPhotoQaFromKnownFindings({});
assert.equal(getPhotoReviewStatus(photoReview, DRAFT_ID), "pending");

// handleApprovePhoto — Photo QA only
photoReview = savePhotoReviewToStore(photoReview, DRAFT_ID, "approved");

const views = listStudioRecipeViews(
  studio.overrides,
  studio.drafts,
  studio.recipeQa,
  photoReview,
);
const view = views.find((v) => v.id === DRAFT_ID);
assert.ok(view, "Yalanji draft visible in Studio");
assert.equal(view.recipeQaStatus, "approved", "Recipe QA remains Approved");
assert.equal(view.photoQaStatus, "approved", "Photo QA is Approved");
assert.equal(isInConsumerCatalog(DRAFT_ID), false, "not promoted to consumer");

// Persist + reload Photo QA store (existing key architecture)
const rawPhoto = JSON.stringify(photoReview);
const reloadedPhoto = seedPhotoQaFromKnownFindings(loadPhotoReviewStore(rawPhoto));
assert.equal(
  getPhotoReviewStatus(reloadedPhoto, DRAFT_ID),
  "approved",
  "Photo QA survives reload",
);

// Recipe QA unchanged after photo approve + studio reload
const reloadedStudio = loadStudioState(JSON.stringify(studio));
assert.equal(
  getRecipeQaEntry(reloadedStudio.recipeQa, DRAFT_ID, {
    isDraft: true,
    isCanonical: false,
  }).status,
  "approved",
);

const viewsAfterReload = listStudioRecipeViews(
  reloadedStudio.overrides,
  reloadedStudio.drafts,
  reloadedStudio.recipeQa,
  reloadedPhoto,
);
const card = viewsAfterReload.find((v) => v.id === DRAFT_ID);
assert.equal(card?.photoQaStatus, "approved");
assert.equal(card?.recipeQaStatus, "approved");

console.log(
  JSON.stringify(
    {
      ok: true,
      draftId: DRAFT_ID,
      title: "Yalanji",
      photoStorageKey: PHOTO_REVIEW_STORAGE_KEY,
      photoStoragePath: `localStorage['${PHOTO_REVIEW_STORAGE_KEY}']['${DRAFT_ID}']`,
      recipeQaAfter: card?.recipeQaStatus,
      photoQaAfter: card?.photoQaStatus,
      photoQaAfterReload: getPhotoReviewStatus(reloadedPhoto, DRAFT_ID),
      overviewBadge: "Photo: Approved",
      publishedToConsumer: false,
      bulkApprove: false,
    },
    null,
    2,
  ),
);
