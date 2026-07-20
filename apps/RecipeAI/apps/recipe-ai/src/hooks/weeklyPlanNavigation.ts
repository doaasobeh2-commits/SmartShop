import type { FlowScreen } from "@recipe-ai/core/types";

const WEEKLY_WIZARD_SCREENS: FlowScreen[] = [
  "weekly-plan-opt-in",
  "weekly-plan-intents",
  "weekly-plan",
];

export function canGoBackInFlow(stack: FlowScreen[]): boolean {
  return stack.length > 1;
}

export function goBackInFlow(stack: FlowScreen[]): FlowScreen[] {
  return stack.length > 1 ? stack.slice(0, -1) : stack;
}

export function appendFlowStep(
  stack: FlowScreen[],
  step: FlowScreen,
): FlowScreen[] {
  return [...stack, step];
}

/** Exit planning wizard — committed or skipped — without stale history. */
export function exitWeeklyPlanWizardToTonight(): FlowScreen[] {
  return ["tonight"];
}

export function isWeeklyPlanWizardStack(stack: FlowScreen[]): boolean {
  return stack.some((screen) => WEEKLY_WIZARD_SCREENS.includes(screen));
}

export function cuisinePreferencesToOptInStack(): FlowScreen[] {
  return ["cuisine-preferences", "weekly-plan-opt-in"];
}
