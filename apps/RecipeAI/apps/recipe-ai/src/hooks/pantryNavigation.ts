import type { FlowScreen } from "@recipe-ai/core/types";

export type RecipePreviewOrigin = "tonight" | "pantry";

/**
 * After selecting a pantry match, push Recipe Detail without clearing pantry results.
 * Never jumps to Tonight.
 */
export function flowAfterOpenPantryMatch(stack: FlowScreen[]): FlowScreen[] {
  const withoutPreview = stack.filter((s) => s !== "recipe-preview");
  return [...withoutPreview, "recipe-preview"];
}

/**
 * Back from Recipe Detail opened via pantry → return to pantry results.
 */
export function flowAfterBackFromPantryPreview(
  stack: FlowScreen[],
): FlowScreen[] {
  const trimmed = stack.filter((s) => s !== "recipe-preview");
  if (trimmed.includes("cook-with-what-i-have")) return trimmed;
  return [...trimmed, "cook-with-what-i-have"];
}

/**
 * Pantry match selection must open preview — never Tonight.
 */
export function pantryMatchDestinationScreen(): FlowScreen {
  return "recipe-preview";
}

export function shouldExposeTryAnotherOption(input: {
  fromWeeklyPlan: boolean;
  candidateCount: number;
  occasion?: "household" | "guests" | "friend";
}): boolean {
  void input;
  return false;
}
