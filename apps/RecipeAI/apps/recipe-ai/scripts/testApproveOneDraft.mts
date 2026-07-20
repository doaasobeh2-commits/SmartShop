/**
 * Programmatic Approve-recipe workflow test (one draft only).
 * Simulates AdminApp persistStudio + reload path.
 */
import assert from "node:assert/strict";
import {
  emptyStudioState,
  loadStudioState,
  RECIPE_STUDIO_STORAGE_KEY,
} from "../src/admin/recipeStudioStorage.ts";
import {
  getRecipeQaEntry,
  saveRecipeQaToStore,
} from "../src/admin/recipeQaReview.ts";
import {
  getPhotoReviewStatus,
  savePhotoReviewToStore,
} from "../src/admin/recipePhotoReview.ts";
import { listStudioRecipeViews } from "../src/admin/recipeStudioMerge.ts";
import { seedPhotoQaFromKnownFindings } from "../src/admin/recipeStudioKnownFindings.ts";
import { isInConsumerCatalog } from "../src/admin/consumerIsolation.ts";

const DRAFT_ID = "draft-arab-batch2-g1-artichoke-salad";

let studio = emptyStudioState();
assert.ok(studio.drafts[DRAFT_ID], "draft must exist");
assert.equal(isInConsumerCatalog(DRAFT_ID), false);

const photoBefore = getPhotoReviewStatus(
  seedPhotoQaFromKnownFindings({}),
  DRAFT_ID,
);

// Simulate handleApproveRecipe
studio = {
  ...studio,
  recipeQa: saveRecipeQaToStore(studio.recipeQa, DRAFT_ID, {
    status: "approved",
    notes: "Single-draft approve test — do not bulk approve",
  }),
};

const viewsAfter = listStudioRecipeViews(
  studio.overrides,
  studio.drafts,
  studio.recipeQa,
  {},
);
const view = viewsAfter.find((v) => v.id === DRAFT_ID);
assert.equal(view?.recipeQaStatus, "approved");
assert.equal(view?.photoQaStatus, "pending");

// Persist + reload (normalizeStudioState / known findings)
const persisted = JSON.stringify(studio);
const reloaded = loadStudioState(persisted);
assert.equal(reloaded.recipeQa[DRAFT_ID]?.status, "approved");
assert.equal(
  getRecipeQaEntry(reloaded.recipeQa, DRAFT_ID, {
    isDraft: true,
    isCanonical: false,
  }).status,
  "approved",
);

// Photo QA unchanged by approve; seed must not wipe human photo decisions
const photoHuman = seedPhotoQaFromKnownFindings(
  savePhotoReviewToStore({}, DRAFT_ID, "approved"),
);
assert.equal(photoHuman[DRAFT_ID], "approved");
assert.equal(
  getPhotoReviewStatus(seedPhotoQaFromKnownFindings({}), DRAFT_ID),
  photoBefore,
);

// Still not in consumer catalog
assert.equal(isInConsumerCatalog(DRAFT_ID), false);

console.log(
  JSON.stringify(
    {
      ok: true,
      draftId: DRAFT_ID,
      storageKey: RECIPE_STUDIO_STORAGE_KEY,
      storagePath: `localStorage['${RECIPE_STUDIO_STORAGE_KEY}'].recipeQa['${DRAFT_ID}'].status`,
      statusAfterApprove: "approved",
      statusAfterReload: reloaded.recipeQa[DRAFT_ID]?.status,
      photoQaUnchanged: true,
      publishedToConsumer: false,
      whyButtonAppearedBroken:
        "Approve did persist, but UI only showed a transient message; primary button never reflected Approved, and Photo QA seed overwrote human photo decisions on remount (looked like approval failed).",
    },
    null,
    2,
  ),
);
