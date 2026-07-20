import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { t } from "./t";

describe("i18n t()", () => {
  it("uses German when selected and translation exists", () => {
    assert.equal(t("de", "createFamily"), "Familie erstellen");
  });

  it("does not return English when German translation exists", () => {
    const de = t("de", "setupKitchenTitle");
    const en = t("en", "setupKitchenTitle");
    assert.notEqual(de, en);
    assert.equal(de, "Küche einrichten");
  });

  it("interpolates variables in selected language", () => {
    assert.match(t("de", "pendingJoinBanner", { count: 1 }), /1/);
  });

  it("keeps join copy free of cross-app branding", () => {
    for (const locale of ["en", "de", "ar", "tr"] as const) {
      const body = t(locale, "possibleFamilyBody").toLowerCase();
      assert.equal(body.includes("fadi"), false);
      assert.equal(body.includes("fitness"), false);
      assert.equal(body.includes("household graph"), false);
    }
  });

  it("uses RTL-facing arrows in Arabic actions", () => {
    assert.match(t("ar", "continue"), /←/);
    assert.doesNotMatch(t("ar", "continue"), /→/);
  });

  it("explains explicit guest cuisine without nationality inference", () => {
    for (const locale of ["en", "de", "ar", "tr"] as const) {
      assert.ok(t(locale, "guestCuisinePrompt").length > 0);
      assert.ok(t(locale, "guestCuisineHelp").length > 0);
    }
    assert.match(t("en", "guestCuisineHelp"), /never guesses/i);
  });
});
