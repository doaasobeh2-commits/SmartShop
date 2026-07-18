import type { ActiveCuisineFamilyId, ArabSubregionId } from "./ids";

/** Distribution targets only — no recipe records. Owner-approved Batch 1 plan. */
export type Batch1FamilyTarget = {
  familyId: ActiveCuisineFamilyId;
  minDishes: number;
  maxDishes: number;
  notes?: string;
};

export type Batch1SubregionTarget = {
  subregionId: ArabSubregionId;
  minDishes: number;
  maxDishes: number;
};

/** Accepted Batch 1 catalog size — finalized plans must stay within this band. */
export const BATCH1_ACCEPTED_TOTAL_MIN = 30 as const;
export const BATCH1_ACCEPTED_TOTAL_MAX = 35 as const;

export const BATCH1_PLAN = {
  totalMin: BATCH1_ACCEPTED_TOTAL_MIN,
  totalMax: BATCH1_ACCEPTED_TOTAL_MAX,
  families: [
    {
      familyId: "arab",
      minDishes: 13,
      maxDishes: 14,
      notes: "Levantine-heavy within arab family",
    },
    {
      familyId: "turkish",
      minDishes: 5,
      maxDishes: 6,
    },
    {
      familyId: "central_european",
      minDishes: 6,
      maxDishes: 7,
      notes: "Austrian and German subregions",
    },
    {
      familyId: "italian",
      minDishes: 4,
      maxDishes: 5,
    },
    {
      familyId: "chinese",
      minDishes: 2,
      maxDishes: 3,
      notes: "Controlled exploration dishes from accepted family",
    },
  ] satisfies readonly Batch1FamilyTarget[],
  arabSubregionEmphasis: [
    { subregionId: "levantine", minDishes: 8, maxDishes: 12 },
  ] satisfies readonly Batch1SubregionTarget[],
} as const;

export const BATCH1_FULL_CATALOG_TARGETS = {
  arab: 50,
  turkish: 35,
  central_european: 30,
  italian: 35,
  chinese: 25,
  indian: 20,
  mexican: 20,
  mealStyleTaggedMeals: 15,
  totalApprox: 230,
} as const;

export type Batch1PlanValidationResult = {
  ok: boolean;
  errors: string[];
};

/** Ensures Batch 1 distribution sums and bounds stay within 30–35 dishes. */
export function validateBatch1Plan(): Batch1PlanValidationResult {
  const errors: string[] = [];
  const familyMin = BATCH1_PLAN.families.reduce((sum, row) => sum + row.minDishes, 0);
  const familyMax = BATCH1_PLAN.families.reduce((sum, row) => sum + row.maxDishes, 0);

  if (familyMin !== BATCH1_PLAN.totalMin) {
    errors.push(
      `Batch 1 family min sum (${familyMin}) must equal totalMin (${BATCH1_PLAN.totalMin})`,
    );
  }
  if (familyMax !== BATCH1_PLAN.totalMax) {
    errors.push(
      `Batch 1 family max sum (${familyMax}) must equal totalMax (${BATCH1_PLAN.totalMax})`,
    );
  }
  if (BATCH1_PLAN.totalMin < BATCH1_ACCEPTED_TOTAL_MIN) {
    errors.push(
      `Batch 1 totalMin (${BATCH1_PLAN.totalMin}) is below accepted minimum (${BATCH1_ACCEPTED_TOTAL_MIN})`,
    );
  }
  if (BATCH1_PLAN.totalMax > BATCH1_ACCEPTED_TOTAL_MAX) {
    errors.push(
      `Batch 1 totalMax (${BATCH1_PLAN.totalMax}) exceeds accepted maximum (${BATCH1_ACCEPTED_TOTAL_MAX})`,
    );
  }

  for (const row of BATCH1_PLAN.families) {
    if (row.minDishes > row.maxDishes) {
      errors.push(`Batch 1 family ${row.familyId}: minDishes exceeds maxDishes`);
    }
  }

  return { ok: errors.length === 0, errors };
}
