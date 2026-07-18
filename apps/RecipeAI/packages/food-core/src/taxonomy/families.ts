import type { CuisineFamilyId } from "./ids";

export type CuisineFamilyCatalogPhase = "active" | "deferred";

export type CuisineFamilyDefinition = {
  id: CuisineFamilyId;
  catalogPhase: CuisineFamilyCatalogPhase;
  /** Target dish count for the full initial catalog program (~200–250 total). */
  targetDishCount: number;
  /** Optional small recognition aid for preference onboarding — not browse UI. */
  recognitionIcon?: string;
  displayOrder: number;
};

export const CUISINE_FAMILIES: readonly CuisineFamilyDefinition[] = [
  {
    id: "arab",
    catalogPhase: "active",
    targetDishCount: 50,
    recognitionIcon: "🫓",
    displayOrder: 1,
  },
  {
    id: "turkish",
    catalogPhase: "active",
    targetDishCount: 35,
    recognitionIcon: "🧿",
    displayOrder: 2,
  },
  {
    id: "central_european",
    catalogPhase: "active",
    targetDishCount: 30,
    recognitionIcon: "🇦🇹",
    displayOrder: 3,
  },
  {
    id: "italian",
    catalogPhase: "active",
    targetDishCount: 35,
    recognitionIcon: "🍝",
    displayOrder: 4,
  },
  {
    id: "chinese",
    catalogPhase: "active",
    targetDishCount: 25,
    recognitionIcon: "🥢",
    displayOrder: 5,
  },
  {
    id: "indian",
    catalogPhase: "active",
    targetDishCount: 20,
    recognitionIcon: "🍛",
    displayOrder: 6,
  },
  {
    id: "mexican",
    catalogPhase: "active",
    targetDishCount: 20,
    recognitionIcon: "🌮",
    displayOrder: 7,
  },
  {
    id: "romanian",
    catalogPhase: "deferred",
    targetDishCount: 0,
    recognitionIcon: "🥘",
    displayOrder: 90,
  },
  {
    id: "japanese",
    catalogPhase: "deferred",
    targetDishCount: 0,
    recognitionIcon: "🍣",
    displayOrder: 91,
  },
] as const;

export function getCuisineFamily(id: CuisineFamilyId): CuisineFamilyDefinition {
  const family = CUISINE_FAMILIES.find((entry) => entry.id === id);
  if (!family) {
    throw new Error(`Unknown cuisine family: ${id}`);
  }
  return family;
}
