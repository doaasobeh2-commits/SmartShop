import type { RecipeSignalInput } from "@smart-shop/core";
import {
  extractMealCookedSignal,
  extractRecipeAcceptedSignal,
  extractRecipeRejectedSignal,
} from "@smart-shop/core";
import type { PlatformIntelligenceBridge } from "./PlatformIntelligenceBridge";

export type RecipeAiIntelligenceService = {
  recordRecipeAccepted(input: RecipeSignalInput): Promise<void>;
  recordRecipeRejected(input: RecipeSignalInput): Promise<void>;
  recordMealCooked(input: RecipeSignalInput): Promise<void>;
};

export function createRecipeAiIntelligenceService(
  bridge: PlatformIntelligenceBridge,
): RecipeAiIntelligenceService {
  return {
    async recordRecipeAccepted(input) {
      await bridge.contributeSignals({
        householdId: input.householdId,
        signals: [extractRecipeAcceptedSignal(input)],
        contributedAt: new Date().toISOString(),
      });
    },

    async recordRecipeRejected(input) {
      await bridge.contributeSignals({
        householdId: input.householdId,
        signals: [extractRecipeRejectedSignal(input)],
        contributedAt: new Date().toISOString(),
      });
    },

    async recordMealCooked(input) {
      await bridge.contributeSignals({
        householdId: input.householdId,
        signals: [extractMealCookedSignal(input)],
        contributedAt: new Date().toISOString(),
      });
    },
  };
}
