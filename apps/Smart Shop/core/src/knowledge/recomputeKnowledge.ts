import type { HouseholdMemory, HouseholdMemoryEntry } from "../memory/HouseholdMemory";
import type { PurchaseLine } from "../plan/WeeklyHouseholdPlan";
import {
  applyKnowledgeDecay,
  emptyKnowledge,
  KNOWLEDGE_SCHEMA_VERSION,
  type HouseholdKnowledge,
  type KnowledgeFact,
} from "./HouseholdKnowledge";

function upsertMemoryEntry(
  entries: HouseholdMemoryEntry[],
  type: HouseholdMemoryEntry["type"],
  key: string,
  delta: number,
): HouseholdMemoryEntry[] {
  const existing = entries.find((entry) => entry.type === type && entry.key === key);
  const now = new Date().toISOString();

  if (existing) {
    return entries.map((entry) =>
      entry.id === existing.id
        ? {
            ...entry,
            value: (entry.value as number) + delta,
            evidenceCount: entry.evidenceCount + 1,
            lastUpdatedAt: now,
          }
        : entry,
    );
  }

  return [
    ...entries,
    {
      id: `mem-${type}-${key}`,
      type,
      key,
      value: delta,
      evidenceCount: 1,
      lastUpdatedAt: now,
    },
  ];
}

export function applyTripToMemory(
  memory: HouseholdMemory,
  purchasedLines: PurchaseLine[],
  storeCount: number,
  totalAmount: number,
): HouseholdMemory {
  let entries = [...memory.entries];

  entries = upsertMemoryEntry(entries, "trip_count", "all", 1);
  entries = upsertMemoryEntry(entries, "purchase_total", "all", totalAmount);

  for (const line of purchasedLines.filter((item) => item.purchased)) {
    entries = upsertMemoryEntry(entries, "category_spend", line.category, line.price);
    entries = upsertMemoryEntry(entries, "store_visit", line.storeName, 1);
  }

  entries = upsertMemoryEntry(entries, "store_visit", "trip_stores", storeCount);

  return {
    ...memory,
    entries,
    lastUpdatedAt: new Date().toISOString(),
  };
}

function upsertFact(
  facts: KnowledgeFact[],
  type: string,
  category: string,
  value: string,
): KnowledgeFact[] {
  const now = new Date().toISOString();
  const existing = facts.find(
    (fact) =>
      fact.type === type && fact.category === category && fact.value === value && fact.status === "active",
  );

  if (existing) {
    return facts.map((fact) =>
      fact.id === existing.id
        ? {
            ...fact,
            evidenceCount: fact.evidenceCount + 1,
            confidence: Math.min(0.99, fact.confidence + 0.05),
            lastObservedAt: now,
          }
        : fact,
    );
  }

  return [
    ...facts,
    {
      id: `fact-${type}-${category}-${value}`,
      type,
      category,
      value,
      confidence: 0.55,
      evidenceCount: 1,
      lastObservedAt: now,
      createdAt: now,
      status: "active",
    },
  ];
}

export function recomputeKnowledgeFromMemory(
  memory: HouseholdMemory,
  existing?: HouseholdKnowledge,
): HouseholdKnowledge {
  const base = existing ?? emptyKnowledge(memory.householdId);
  let facts = [...base.facts];

  const storeVisits = memory.entries.filter((entry) => entry.type === "store_visit" && entry.key !== "trip_stores");
  const topStore = storeVisits.sort(
    (a, b) => (b.value as number) - (a.value as number),
  )[0];

  if (topStore) {
    facts = upsertFact(facts, "store_preference", "supermarket", topStore.key);
  }

  const tripCount = memory.entries.find((entry) => entry.type === "trip_count");
  if (tripCount && (tripCount.value as number) >= 2) {
    facts = upsertFact(
      facts,
      "shopping_frequency",
      "habit",
      "regular_weekly_shopper",
    );
  }

  const petEntries = memory.entries.filter((entry) => entry.type === "pet_count");
  for (const pet of petEntries) {
    facts = upsertFact(
      facts,
      "pet_household",
      pet.key,
      String(pet.value),
    );
  }

  const hasPets = memory.entries.find(
    (entry) => entry.type === "pet_household" && entry.key === "active",
  );
  if (hasPets && Number(hasPets.value) > 0) {
    facts = upsertFact(facts, "pet_household", "status", "active");
  }

  facts = applyKnowledgeDecay(facts);

  return {
    householdId: memory.householdId,
    schemaVersion: KNOWLEDGE_SCHEMA_VERSION,
    facts,
    lastRecomputedAt: new Date().toISOString(),
  };
}
