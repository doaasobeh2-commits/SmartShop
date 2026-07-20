import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { syncFavoriteCuisinesMirror } from "../data/catalog/decision/householdCuisine";
import { resolveCuisineContinueAction } from "./cuisinePreferencesFlow";

describe("Cuisine Preferences progressive Continue", () => {
  it("1 — primary selected + preferred step not reached → reveal, not complete", () => {
    assert.equal(
      resolveCuisineContinueAction({
        primarySelected: true,
        preferredStepReached: false,
      }),
      "reveal_preferred",
    );
  });

  it("2 — first Continue reveal path differs from second Continue complete path", () => {
    const first = resolveCuisineContinueAction({
      primarySelected: true,
      preferredStepReached: false,
    });
    const second = resolveCuisineContinueAction({
      primarySelected: true,
      preferredStepReached: true,
    });
    assert.equal(first, "reveal_preferred");
    assert.equal(second, "complete");
  });

  it("3 — second Continue navigates with zero preferred cuisines after step reached", () => {
    assert.equal(
      resolveCuisineContinueAction({
        primarySelected: true,
        preferredStepReached: true,
      }),
      "complete",
    );
  });

  it("4 — selected preferred cuisines persist via mirror sync", () => {
    const mirror = syncFavoriteCuisinesMirror("arab", ["turkish", "italian"]);
    assert.deepEqual(mirror, ["arab", "turkish", "italian"]);
  });

  it("5 — primary cuisine cannot be duplicated as preferred", () => {
    const mirror = syncFavoriteCuisinesMirror("arab", ["arab", "turkish"]);
    assert.deepEqual(mirror, ["arab", "turkish"]);
    assert.equal(mirror.filter((c) => c === "arab").length, 1);
  });

  it("blocks Continue without primary", () => {
    assert.equal(
      resolveCuisineContinueAction({
        primarySelected: false,
        preferredStepReached: false,
      }),
      "blocked",
    );
  });
});
