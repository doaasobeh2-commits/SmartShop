import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  countPhotoReviewsByStatus,
  findNextUnreviewedRecipeId,
  getPhotoReviewStatus,
  loadPhotoReviewStore,
  savePhotoReviewToStore,
} from "./recipePhotoReview";

describe("Photo review persistence (Phase A localStorage model)", () => {
  it("defaults to pending when no entry exists", () => {
    assert.equal(getPhotoReviewStatus({}, "kofte"), "pending");
  });

  it("round-trips valid statuses through JSON store", () => {
    let store = savePhotoReviewToStore({}, "kofte", "approved");
    store = savePhotoReviewToStore(store, "tabbouleh", "needs_replacement");
    const raw = JSON.stringify(store);
    const loaded = loadPhotoReviewStore(raw);
    assert.equal(getPhotoReviewStatus(loaded, "kofte"), "approved");
    assert.equal(getPhotoReviewStatus(loaded, "tabbouleh"), "needs_replacement");
    assert.equal(getPhotoReviewStatus(loaded, "missing"), "pending");
  });

  it("ignores invalid JSON and unknown status values", () => {
    assert.deepEqual(loadPhotoReviewStore("{bad"), {});
    assert.deepEqual(
      loadPhotoReviewStore(JSON.stringify({ kofte: "broken" })),
      {},
    );
  });

  it("counts review statuses across catalog ids", () => {
    const store = savePhotoReviewToStore(
      savePhotoReviewToStore({}, "a", "approved"),
      "b",
      "needs_replacement",
    );
    const counts = countPhotoReviewsByStatus(["a", "b", "c"], store);
    assert.equal(counts.approved, 1);
    assert.equal(counts.needs_replacement, 1);
    assert.equal(counts.pending, 1);
  });

  it("finds next unreviewed recipe after current", () => {
    const ids = ["a", "b", "c", "d"];
    const store = savePhotoReviewToStore(
      savePhotoReviewToStore({}, "a", "approved"),
      "b",
      "approved",
    );
    assert.equal(findNextUnreviewedRecipeId(ids, store), "c");
    assert.equal(findNextUnreviewedRecipeId(ids, store, "c"), "d");
    assert.equal(findNextUnreviewedRecipeId(ids, store, "d"), "c");
    const allDone = savePhotoReviewToStore(
      savePhotoReviewToStore(store, "c", "approved"),
      "d",
      "approved",
    );
    assert.equal(findNextUnreviewedRecipeId(ids, allDone), undefined);
  });
});
