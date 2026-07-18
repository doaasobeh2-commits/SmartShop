import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  BATCH1_ACCEPTED_TOTAL_MAX,
  BATCH1_ACCEPTED_TOTAL_MIN,
  BATCH1_PLAN,
  BATCH1_FULL_CATALOG_TARGETS,
  validateBatch1Plan,
} from "./batch1Plan";
import { CUISINE_FAMILIES } from "./families";
import { CUISINE_SUBREGIONS } from "./subregions";
import {
  ACTIVE_CUISINE_FAMILY_IDS,
  CUISINE_FAMILY_IDS,
  DEFERRED_CUISINE_FAMILY_IDS,
} from "./ids";
import { validateTaxonomyRegistry } from "./validate";

describe("ShareYum taxonomy registry", () => {
  it("passes internal validation", () => {
    const result = validateTaxonomyRegistry();
    assert.equal(result.ok, true, result.errors.join("; "));
  });

  it("has unique cuisine family IDs aligned with CUISINE_FAMILY_IDS", () => {
    const fromSeed = CUISINE_FAMILIES.map((entry) => entry.id);
    assert.deepEqual([...fromSeed].sort(), [...CUISINE_FAMILY_IDS].sort());
  });

  it("registers deferred families romanian and japanese", () => {
    assert.deepEqual([...DEFERRED_CUISINE_FAMILY_IDS], ["romanian", "japanese"]);
    for (const id of DEFERRED_CUISINE_FAMILY_IDS) {
      const family = CUISINE_FAMILIES.find((entry) => entry.id === id);
      assert.equal(family?.catalogPhase, "deferred");
    }
  });

  it("keeps central_european as one family with austrian and german subregions", () => {
    const subregions = CUISINE_SUBREGIONS.filter(
      (entry) => entry.familyId === "central_european",
    ).map((entry) => entry.id);
    assert.ok(subregions.includes("austrian"));
    assert.ok(subregions.includes("german"));
  });

  it("Batch 1 total catalog target is constrained to 30–35 dishes", () => {
    assert.equal(BATCH1_ACCEPTED_TOTAL_MIN, 30);
    assert.equal(BATCH1_ACCEPTED_TOTAL_MAX, 35);
    assert.equal(BATCH1_PLAN.totalMin, 30);
    assert.equal(BATCH1_PLAN.totalMax, 35);

    const min = BATCH1_PLAN.families.reduce((sum, row) => sum + row.minDishes, 0);
    const max = BATCH1_PLAN.families.reduce((sum, row) => sum + row.maxDishes, 0);
    assert.equal(min, 30);
    assert.equal(max, 35);
    assert.equal(BATCH1_PLAN.families.length, 5);

    const validation = validateBatch1Plan();
    assert.equal(validation.ok, true, validation.errors.join("; "));
  });

  it("Batch 1 includes controlled chinese exploration dishes", () => {
    const chinese = BATCH1_PLAN.families.find((row) => row.familyId === "chinese");
    assert.ok(chinese);
    assert.ok(chinese!.minDishes >= 2);
    assert.ok(chinese!.maxDishes <= 3);
  });

  it("full catalog targets approximate 230 dishes", () => {
    assert.equal(BATCH1_FULL_CATALOG_TARGETS.totalApprox, 230);
    assert.equal(BATCH1_FULL_CATALOG_TARGETS.arab, 50);
  });

  it("active families exclude deferred romanian and japanese", () => {
    for (const deferred of DEFERRED_CUISINE_FAMILY_IDS) {
      assert.ok(!(ACTIVE_CUISINE_FAMILY_IDS as readonly string[]).includes(deferred));
    }
  });
});
