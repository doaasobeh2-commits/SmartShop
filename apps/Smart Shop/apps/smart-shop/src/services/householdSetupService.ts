import {
  applySetupToMemory,
  recomputeKnowledgeFromMemory,
  type HouseholdSetupSnapshot,
} from "@smart-shop/core";
import { loadKnowledge, loadMemory, saveKnowledge, saveMemory } from "../state/localStore";

export function syncHouseholdSetupToMemory(
  householdId: string,
  setup: HouseholdSetupSnapshot,
): void {
  const memory = loadMemory(householdId);
  const updatedMemory = applySetupToMemory(memory, setup);
  saveMemory(updatedMemory);

  const existingKnowledge = loadKnowledge(householdId);
  const updatedKnowledge = recomputeKnowledgeFromMemory(updatedMemory, existingKnowledge);
  saveKnowledge(updatedKnowledge);
}
