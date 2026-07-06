import type { HouseholdMemory, HouseholdMemoryStore } from "../memory/HouseholdMemory";
import type { HouseholdKnowledgeStore } from "../knowledge/HouseholdKnowledge";
import { recomputeKnowledgeFromMemory, applyTripToMemory } from "../knowledge/recomputeKnowledge";
import type { PurchaseLine } from "../plan/WeeklyHouseholdPlan";
import type {
  HouseholdTimelineWriter,
  ShoppingCompletedEvent,
  StoreVisitedEvent,
} from "../timeline/HouseholdTimeline";
import type { HypothesisPersistence } from "../intelligence/hypotheses/HouseholdHypothesis";
import { extractPurchaseSignals, extractLocaleContextSignals } from "../intelligence/signals";
import { runInferencePipeline } from "../intelligence/inference/InferencePipeline";

export type CompletedTripInput = {
  householdId: string;
  basketId: string;
  storeCount: number;
  totalAmount: number;
  currency: string;
  lines: PurchaseLine[];
  /** Optional locale context for cultural inference — not user preference forms. */
  localeContext?: {
    city?: string;
    countryCode?: string;
    languageCode?: string;
    region?: string;
  };
};

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function processTripCompletion(
  input: CompletedTripInput,
  timelineWriter: HouseholdTimelineWriter,
  memoryStore: HouseholdMemoryStore,
  knowledgeStore: HouseholdKnowledgeStore,
  hypothesisStore?: HypothesisPersistence,
): Promise<void> {
  const occurredAt = new Date().toISOString();
  const purchasedLines = input.lines.filter((line) => line.purchased);

  const shoppingCompleted: ShoppingCompletedEvent = {
    id: createId("evt"),
    familyId: input.householdId,
    type: "shopping_completed",
    occurredAt,
    source: "user",
    basketId: input.basketId,
    storeCount: input.storeCount,
    totalAmount: input.totalAmount,
    currency: input.currency,
  };

  await timelineWriter.append(shoppingCompleted);

  const storeNames = [...new Set(purchasedLines.map((line) => line.storeName))];
  for (const storeName of storeNames) {
    const storeVisited: StoreVisitedEvent = {
      id: createId("evt"),
      familyId: input.householdId,
      type: "store_visited",
      occurredAt,
      source: "user",
      storeId: storeName.toLowerCase().replace(/\s+/g, "-"),
      storeName,
    };
    await timelineWriter.append(storeVisited);
  }

  const memory = await memoryStore.get(input.householdId);
  const updatedMemory: HouseholdMemory = applyTripToMemory(
    memory,
    input.lines,
    input.storeCount,
    input.totalAmount,
  );
  await memoryStore.save(updatedMemory);

  const existingKnowledge = await knowledgeStore.get(input.householdId);
  const updatedKnowledge = recomputeKnowledgeFromMemory(updatedMemory, existingKnowledge);
  await knowledgeStore.save(updatedKnowledge);

  if (hypothesisStore) {
    const occurredAt = new Date().toISOString();
    const purchaseSignals = extractPurchaseSignals(input.householdId, input.lines, occurredAt);
    const localeSignals = input.localeContext
      ? extractLocaleContextSignals(
          { householdId: input.householdId, ...input.localeContext },
          occurredAt,
        )
      : [];

    const existingHypotheses = await hypothesisStore.get(input.householdId);
    const updatedHypotheses = runInferencePipeline({
      householdId: input.householdId,
      signals: [...purchaseSignals, ...localeSignals],
      existing: existingHypotheses,
    });
    await hypothesisStore.save(updatedHypotheses);
  }
}
