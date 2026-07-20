import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getDishById, listAllDishes } from "../data/catalog/dishes";
import {
  assertRecipeDetailIntegrity,
  buildStudioSummary,
  EMPTY_CATALOG_FILTERS,
  filterStudioRecipes,
} from "./recipeCatalogAdmin";
import { savePhotoReviewToStore } from "./recipePhotoReview";
import { listStudioRecipeViews } from "./recipeStudioMerge";
import { seedRecipeQaFromKnownFindings } from "./recipeStudioKnownFindings";

describe("Admin catalog workspace logic", () => {
  const photoReview = {};
  const recipeQa = seedRecipeQaFromKnownFindings({});
  const allViews = listStudioRecipeViews({}, {}, recipeQa, photoReview);

  it("all 43 canonical catalog recipes are addressable by id", () => {
    assert.equal(listAllDishes().length, 43);
    for (const dish of listAllDishes()) {
      const resolved = getDishById(dish.id);
      assert.ok(assertRecipeDetailIntegrity(dish, resolved));
    }
  });

  it("empty filters return full studio list including canonical count", () => {
    const filtered = filterStudioRecipes(allViews, EMPTY_CATALOG_FILTERS);
    assert.equal(filtered.length, allViews.length);
    assert.ok(filtered.length >= 43);
  });

  it("search filter narrows without removing catalog entries from source", () => {
    const filtered = filterStudioRecipes(allViews, {
      ...EMPTY_CATALOG_FILTERS,
      search: "kofte",
    });
    assert.ok(filtered.length >= 1);
    const reset = filterStudioRecipes(allViews, EMPTY_CATALOG_FILTERS);
    assert.equal(reset.length, allViews.length);
  });

  it("Musakhan Wraps is findable by wrap aliases, not only sumac-chicken id", () => {
    const byAlias = filterStudioRecipes(allViews, {
      ...EMPTY_CATALOG_FILTERS,
      search: "musakhan wraps",
    });
    assert.ok(byAlias.some((r) => r.id === "sumac-chicken"));
    const byArabic = filterStudioRecipes(allViews, {
      ...EMPTY_CATALOG_FILTERS,
      search: "سندويش مسخن",
    });
    assert.ok(byArabic.some((r) => r.id === "sumac-chicken"));
  });

  it("independent photo QA filter works", () => {
    const photo = savePhotoReviewToStore({}, "kofte", "approved");
    const views = listStudioRecipeViews({}, {}, recipeQa, photo);
    const approved = filterStudioRecipes(views, {
      ...EMPTY_CATALOG_FILTERS,
      photoQaStatus: "approved",
    });
    assert.deepEqual(approved.map((d) => d.id), ["kofte"]);
  });

  it("summary reflects canonical catalog size", () => {
    const summary = buildStudioSummary(allViews);
    assert.ok(summary.totalRecipes >= 43);
    assert.equal(summary.canonicalCount, 43);
    assert.ok(summary.recipeQaCounts.draft >= 0);
    assert.ok(summary.recipeQaCounts.approved >= 0);
    assert.ok(
      summary.recipeQaCounts.draft +
        summary.recipeQaCounts.needs_correction +
        summary.recipeQaCounts.approved ===
        summary.totalRecipes,
    );
  });
});
