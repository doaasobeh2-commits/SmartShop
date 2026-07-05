import type { HouseholdSetupSnapshot } from "../models/household/HouseholdSetupSnapshot";
import type { HouseholdMemory, HouseholdMemoryEntry } from "./HouseholdMemory";

function setMemoryEntry(
  entries: HouseholdMemoryEntry[],
  type: HouseholdMemoryEntry["type"],
  key: string,
  value: number | string,
): HouseholdMemoryEntry[] {
  const now = new Date().toISOString();
  const filtered = entries.filter((entry) => !(entry.type === type && entry.key === key));

  return [
    ...filtered,
    {
      id: `mem-${type}-${key}`,
      type,
      key,
      value,
      evidenceCount: 1,
      lastUpdatedAt: now,
    },
  ];
}

const PET_MEMORY_TYPES: HouseholdMemoryEntry["type"][] = ["pet_count", "pet_household"];

/** Sync declared household pets into hidden memory for plans, offers and recommendations. */
export function applySetupToMemory(
  memory: HouseholdMemory,
  setup: HouseholdSetupSnapshot,
): HouseholdMemory {
  let entries = memory.entries.filter((entry) => !PET_MEMORY_TYPES.includes(entry.type));

  if (setup.hasPets && setup.pets.length > 0) {
    entries = setMemoryEntry(entries, "pet_household", "active", 1);

    for (const pet of setup.pets) {
      entries = setMemoryEntry(entries, "pet_count", pet.type, pet.quantity);
    }
  } else {
    entries = setMemoryEntry(entries, "pet_household", "active", 0);
  }

  return {
    ...memory,
    entries,
    lastUpdatedAt: new Date().toISOString(),
  };
}
