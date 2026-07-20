import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  appendFlowStep,
  canGoBackInFlow,
  cuisinePreferencesToOptInStack,
  exitWeeklyPlanWizardToTonight,
  goBackInFlow,
  isWeeklyPlanWizardStack,
} from "./weeklyPlanNavigation";

describe("Weekly plan navigation stack", () => {
  it("cuisine complete preserves back to cuisine from opt-in", () => {
    assert.deepEqual(cuisinePreferencesToOptInStack(), [
      "cuisine-preferences",
      "weekly-plan-opt-in",
    ]);
  });

  it("unsaved wizard steps support Back without losing stack depth", () => {
    let stack = cuisinePreferencesToOptInStack();
    stack = appendFlowStep(stack, "weekly-plan-intents");
    stack = appendFlowStep(stack, "weekly-plan");
    assert.equal(stack.at(-1), "weekly-plan");
    stack = goBackInFlow(stack);
    assert.equal(stack.at(-1), "weekly-plan-intents");
    stack = goBackInFlow(stack);
    assert.equal(stack.at(-1), "weekly-plan-opt-in");
    assert.ok(canGoBackInFlow(stack));
  });

  it("Save or Not now exits to Tonight with a clean stack", () => {
    assert.deepEqual(exitWeeklyPlanWizardToTonight(), ["tonight"]);
    const afterSave = exitWeeklyPlanWizardToTonight();
    assert.ok(!isWeeklyPlanWizardStack(afterSave));
    assert.equal(canGoBackInFlow(afterSave), false);
  });

  it("Not now does not leave wizard screens on stack", () => {
    const stack = exitWeeklyPlanWizardToTonight();
    assert.deepEqual(stack, ["tonight"]);
  });
});
