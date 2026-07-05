export type HouseholdMemoryEntryType =
  | "purchase_total"
  | "store_visit"
  | "category_spend"
  | "trip_count"
  | "preferred_store"
  | "pet_count"
  | "pet_household";

export type HouseholdMemoryEntry = {
  id: string;
  type: HouseholdMemoryEntryType;
  key: string;
  value: number | string;
  lastUpdatedAt: string;
  evidenceCount: number;
};

export type HouseholdMemory = {
  householdId: string;
  entries: HouseholdMemoryEntry[];
  lastUpdatedAt?: string;
};

export type HouseholdMemoryStore = {
  get(householdId: string): Promise<HouseholdMemory>;
  save(memory: HouseholdMemory): Promise<void>;
};
