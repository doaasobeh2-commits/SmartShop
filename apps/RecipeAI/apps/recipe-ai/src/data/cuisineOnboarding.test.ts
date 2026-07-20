import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getCuisineOnboardingOptions,
  normalizeCuisineFamilyId,
} from "./cuisineOnboarding";

describe("cuisineOnboarding", () => {
  it("normalizes legacy cuisine ids", () => {
    assert.equal(normalizeCuisineFamilyId("arabic"), "arab");
    assert.equal(normalizeCuisineFamilyId("austrian"), "central_european");
    assert.equal(normalizeCuisineFamilyId("turkish"), "turkish");
  });

  it("returns active A2.2 families with localized labels", () => {
    const ar = getCuisineOnboardingOptions("ar");
    assert.ok(ar.length >= 7);
    assert.ok(ar.some((option) => option.id === "arab" && option.label.includes("العرب")));
    const en = getCuisineOnboardingOptions("en");
    assert.deepEqual(
      en.map((option) => option.id),
      ar.map((option) => option.id),
    );
  });

  it("uses food imagery URLs without flag emoji labels", () => {
    const en = getCuisineOnboardingOptions("en");
    for (const option of en) {
      assert.match(option.imageUrl, /^\/assets\/onboarding\/cuisine-/);
      assert.doesNotMatch(option.label, /🇦🇹|🫓|🧿|🍝|🥢|🍛|🌮/);
    }
  });
});
