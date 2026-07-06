import type {
  BehavioralSignalBatch,
  HouseholdHypothesisStore,
  HouseholdIntelligenceState,
  HypothesisPersistence,
} from "@smart-shop/core";
import { runInferencePipeline } from "@smart-shop/core";

/**
 * Cross-application bridge for the Fadi Core Household Intelligence Engine.
 * Every platform app contributes behavioral signals and reads confidence-based hypotheses.
 */
export type PlatformIntelligenceAppId = "smart_shop" | "recipe_ai" | "fitness_ai";

export type PlatformIntelligenceBridge = {
  contributeSignals(batch: BehavioralSignalBatch): Promise<void>;
  readHypotheses(householdId: string): Promise<HouseholdHypothesisStore>;
  readState(householdId: string): Promise<HouseholdIntelligenceState>;
};

export type PlatformIntelligenceBridgeDeps = {
  hypothesisStore: HypothesisPersistence;
  loadMemory: (householdId: string) => Promise<HouseholdIntelligenceState["memory"]>;
  loadKnowledge: (householdId: string) => Promise<HouseholdIntelligenceState["knowledge"]>;
};

export function createPlatformIntelligenceBridge(
  deps: PlatformIntelligenceBridgeDeps,
): PlatformIntelligenceBridge {
  return {
    async contributeSignals(batch) {
      const existing = await deps.hypothesisStore.get(batch.householdId);
      const updated = runInferencePipeline({
        householdId: batch.householdId,
        signals: batch.signals,
        existing,
      });
      await deps.hypothesisStore.save(updated);
    },

    async readHypotheses(householdId) {
      return deps.hypothesisStore.get(householdId);
    },

    async readState(householdId) {
      const [memory, knowledge, hypotheses] = await Promise.all([
        deps.loadMemory(householdId),
        deps.loadKnowledge(householdId),
        deps.hypothesisStore.get(householdId),
      ]);

      return {
        householdId,
        memory,
        knowledge,
        hypotheses,
        lastUpdatedAt: hypotheses.lastInferredAt ?? new Date().toISOString(),
      };
    },
  };
}

export type PlatformIntelligenceBridgeStatus = {
  connected: boolean;
  contributors: PlatformIntelligenceAppId[];
};

export const DEFAULT_PLATFORM_INTELLIGENCE_BRIDGE_STATUS: PlatformIntelligenceBridgeStatus = {
  connected: true,
  contributors: ["smart_shop"],
};
