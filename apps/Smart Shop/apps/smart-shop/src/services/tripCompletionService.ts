import {
  processTripCompletion,
  type CompletedTripInput,
  type HouseholdTimelineWriter,
  type HouseholdMemoryStore,
  type HouseholdKnowledgeStore,
  type HypothesisPersistence,
} from "@smart-shop/core";
import {
  appendTimelineEvent,
  HOUSEHOLD_ID,
  loadKnowledge,
  loadMemory,
  loadHypotheses,
  saveKnowledge,
  saveMemory,
  saveHypotheses,
} from "../state/localStore";

const timelineWriter: HouseholdTimelineWriter = {
  async append(event) {
    appendTimelineEvent(event);
  },
};

const memoryStore: HouseholdMemoryStore = {
  async get(householdId) {
    return loadMemory(householdId);
  },
  async save(memory) {
    saveMemory(memory);
  },
};

const knowledgeStore: HouseholdKnowledgeStore = {
  async get(householdId) {
    return loadKnowledge(householdId);
  },
  async save(knowledge) {
    saveKnowledge(knowledge);
  },
};

const hypothesisStore: HypothesisPersistence = {
  async get(householdId) {
    return loadHypotheses(householdId);
  },
  async save(store) {
    saveHypotheses(store);
  },
};

export async function completeShoppingTrip(input: Omit<CompletedTripInput, "householdId">) {
  await processTripCompletion(
    { ...input, householdId: HOUSEHOLD_ID },
    timelineWriter,
    memoryStore,
    knowledgeStore,
    hypothesisStore,
  );
}
