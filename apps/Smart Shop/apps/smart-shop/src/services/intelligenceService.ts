import {
  buildDerivedPreferenceView,
  type DerivedPreferenceView,
  type RecipeSignalInput,
} from "@smart-shop/core";
import {
  createPlatformIntelligenceBridge,
  createRecipeAiIntelligenceService,
} from "@smart-shop/ecosystem";
import {
  HOUSEHOLD_ID,
  loadHypotheses,
  loadKnowledge,
  loadMemory,
  saveHypotheses,
} from "../state/localStore";

export const platformIntelligence = createPlatformIntelligenceBridge({
  hypothesisStore: {
    async get(householdId) {
      return loadHypotheses(householdId);
    },
    async save(store) {
      saveHypotheses(store);
    },
  },
  loadMemory: async (householdId) => loadMemory(householdId),
  loadKnowledge: async (householdId) => loadKnowledge(householdId),
});

export const recipeAiIntelligence = createRecipeAiIntelligenceService(platformIntelligence);

export function getDerivedPreferenceView(
  householdId: string = HOUSEHOLD_ID,
): DerivedPreferenceView {
  return buildDerivedPreferenceView(loadHypotheses(householdId));
}

export async function recordRecipeAccepted(input: Omit<RecipeSignalInput, "householdId">) {
  await recipeAiIntelligence.recordRecipeAccepted({
    ...input,
    householdId: HOUSEHOLD_ID,
  });
}

export async function recordRecipeRejected(input: Omit<RecipeSignalInput, "householdId">) {
  await recipeAiIntelligence.recordRecipeRejected({
    ...input,
    householdId: HOUSEHOLD_ID,
  });
}

export async function recordMealCooked(input: Omit<RecipeSignalInput, "householdId">) {
  await recipeAiIntelligence.recordMealCooked({
    ...input,
    householdId: HOUSEHOLD_ID,
  });
}
