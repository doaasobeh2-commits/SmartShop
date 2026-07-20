/**
 * Pure continue-step logic for Cuisine Preferences progressive disclosure.
 */
export type CuisineContinueAction = "blocked" | "reveal_preferred" | "complete";

export function resolveCuisineContinueAction(input: {
  primarySelected: boolean;
  /** True after the first Continue following primary selection. */
  preferredStepReached: boolean;
}): CuisineContinueAction {
  if (!input.primarySelected) return "blocked";
  if (!input.preferredStepReached) return "reveal_preferred";
  return "complete";
}
