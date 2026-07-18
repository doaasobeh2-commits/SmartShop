import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { DEFAULT_ALLERGEN_SAFETY_POLICY } from "../catalog/schema";
import { createDefaultHouseholdFoodProfileV2 } from "../contracts/householdPreferences";
import { DEFAULT_EXPLORATION_WILLINGNESS, LANGUAGE_CUISINE_PRIOR_MAX } from "../taxonomy/constants";

describe("ShareYum A2.2 policy constants", () => {
  it("defaults exploration willingness to 0.3", () => {
    const profile = createDefaultHouseholdFoodProfileV2("hh_test");
    assert.equal(profile.explorationWillingness, DEFAULT_EXPLORATION_WILLINGNESS);
    assert.equal(DEFAULT_EXPLORATION_WILLINGNESS, 0.3);
  });

  it("keeps language cuisine prior weak", () => {
    assert.ok(LANGUAGE_CUISINE_PRIOR_MAX <= 0.05);
  });

  it("fail-closes on mayContain allergens by default", () => {
    assert.equal(DEFAULT_ALLERGEN_SAFETY_POLICY.rejectOnMayContain, true);
    assert.equal(DEFAULT_ALLERGEN_SAFETY_POLICY.rejectOnContains, true);
  });
});
