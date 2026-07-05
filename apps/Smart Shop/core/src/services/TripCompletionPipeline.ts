import type { HouseholdMemory, HouseholdMemoryStore } from "../memory/HouseholdMemory";
import type { HouseholdKnowledgeStore } from "../knowledge/HouseholdKnowledge";
import { recomputeKnowledgeFromMemory, applyTripToMemory } from "../knowledge/recomputeKnowledge";
import type { PurchaseLine } from "../plan/WeeklyHouseholdPlan";
import type {
  HouseholdTimelineWriter,
  ShoppingCompletedEvent,
  StoreVisitedEvent,
} from "../timeline/HouseholdTimeline";

export type CompletedTripInput = {
  householdId: string;
  basketId: string;
  storeCount: number;
  totalAmount: number;
  currency: string;
  lines: PurchaseLine[];
};

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function processTripCompletion(
  input: CompletedTripInput,
  timelineWriter: HouseholdTimelineWriter,
  memoryStore: HouseholdMemoryStore,
  knowledgeStore: HouseholdKnowledgeStore,
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
}
