import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  LEGACY_CUISINES_TS_MAP,
  LEGACY_RECIPES_TS_MAP,
  LEGACY_WORLD_KITCHENS_MAP,
  mapLegacyCuisinesId,
  mapLegacyRecipeId,
  mapLegacyWorldKitchenId,
} from "./normalization";

describe("legacy normalization mapping", () => {
  it("maps cuisines.ts austrian to central_european / austrian", () => {
    const mapped = mapLegacyCuisinesId("austrian");
    assert.ok(mapped);
    assert.equal(mapped!.cuisineFamilyId, "central_european");
    assert.equal(mapped!.suggestedSubregionId, "austrian");
  });

  it("maps all cuisines.ts legacy IDs", () => {
    assert.equal(LEGACY_CUISINES_TS_MAP.length, 4);
    for (const id of ["arabic", "italian", "turkish", "austrian"]) {
      assert.ok(mapLegacyCuisinesId(id), `missing map for ${id}`);
    }
  });

  it("maps all recipes.ts seed candidates", () => {
    assert.equal(LEGACY_RECIPES_TS_MAP.length, 4);
    for (const id of ["tabbouleh", "sarma", "schnitzel", "pomodoro"]) {
      assert.ok(mapLegacyRecipeId(id), `missing map for ${id}`);
    }
  });

  it("maps worldKitchens healthy to meal_style only", () => {
    const healthy = mapLegacyWorldKitchenId("healthy");
    assert.ok(healthy);
    assert.equal(healthy!.status, "meal_style_only");
    assert.equal(healthy!.mealStyleId, "protein_bowl");
    assert.equal(healthy!.cuisineFamilyId, undefined);
  });

  it("registers deferred worldKitchens romanian and japanese", () => {
    const romanian = mapLegacyWorldKitchenId("romanian");
    const japanese = mapLegacyWorldKitchenId("japanese");
    assert.equal(romanian?.status, "deferred_family");
    assert.equal(japanese?.status, "deferred_family");
    assert.equal(romanian?.cuisineFamilyId, "romanian");
    assert.equal(japanese?.cuisineFamilyId, "japanese");
  });

  it("covers all eight worldKitchens legacy IDs", () => {
    assert.equal(LEGACY_WORLD_KITCHENS_MAP.length, 8);
    for (const id of [
      "arabic",
      "austrian",
      "turkish",
      "italian",
      "mexican",
      "healthy",
      "romanian",
      "japanese",
    ]) {
      assert.ok(mapLegacyWorldKitchenId(id), `missing worldKitchen map for ${id}`);
    }
  });
});
