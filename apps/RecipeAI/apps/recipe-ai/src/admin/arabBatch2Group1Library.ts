/**
 * Arab Batch 2 Group 1 aggregator (14 new Syrian/Levantine recipes).
 * Sheikh al-Mahshi was listed in the approved Group 1 but already exists in
 * Batch 1 — it is intentionally omitted here (not overwritten).
 *
 * Studio draft sources only — never auto-promoted to consumer catalog.
 */

import { ARAB_BATCH_2_GROUP_1_A } from "./arabBatch2Group1A";
import { ARAB_BATCH_2_GROUP_1_B } from "./arabBatch2Group1B";
import type { GeneratedRecipe } from "./generatedRecipeLibrary";

export const ARAB_BATCH_2_GROUP_1: GeneratedRecipe[] = [
  ...ARAB_BATCH_2_GROUP_1_A,
  ...ARAB_BATCH_2_GROUP_1_B,
];

export const ARAB_BATCH_2_GROUP_1_TITLES: string[] = ARAB_BATCH_2_GROUP_1.map(
  (r) => r.canonicalTitle,
);

/** Approved Group 1 title that already exists in Batch 1 and must not be recreated. */
export const ARAB_BATCH_2_GROUP_1_SKIPPED_EXISTING = [
  "Sheikh al-Mahshi",
] as const;
