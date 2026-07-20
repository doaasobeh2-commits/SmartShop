import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { FlowScreen } from "@recipe-ai/core/types";
import {
  adminDetailPath,
  adminListPath,
  isAdminRecipesRoute,
  parseAdminRoute,
} from "./adminRoute";

const ALL_FLOW_SCREENS: FlowScreen[] = [
  "language-selection",
  "welcome",
  "auth",
  "household-members",
  "food-preferences",
  "cuisine-preferences",
  "weekly-plan-opt-in",
  "weekly-plan-intents",
  "tonight",
  "recipe-preview",
  "cook-mode",
  "weekly-plan",
  "feedback",
  "cook-with-what-i-have",
];

describe("Admin recipes route", () => {
  it("recognizes /admin/recipes paths", () => {
    assert.equal(isAdminRecipesRoute("/admin/recipes"), true);
    assert.equal(isAdminRecipesRoute("/admin/recipes/kofte"), true);
    assert.equal(isAdminRecipesRoute("/tonight"), false);
  });

  it("parses list and detail routes", () => {
    assert.deepEqual(parseAdminRoute("/admin/recipes"), { screen: "list" });
    assert.deepEqual(parseAdminRoute("/admin/recipes/"), { screen: "list" });
    assert.deepEqual(parseAdminRoute("/admin/recipes/kofte"), {
      screen: "detail",
      recipeId: "kofte",
    });
    assert.equal(parseAdminRoute("/admin/other"), null);
  });

  it("builds stable admin paths", () => {
    assert.equal(adminListPath(), "/admin/recipes");
    assert.equal(adminDetailPath("wiener-schnitzel"), "/admin/recipes/wiener-schnitzel");
  });

  it("consumer FlowScreen union has no admin entry", () => {
    for (const screen of ALL_FLOW_SCREENS) {
      assert.ok(!screen.includes("admin"));
    }
    assert.equal(ALL_FLOW_SCREENS.length, 14);
  });
});
