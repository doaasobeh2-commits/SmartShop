/**
 * Arab Batch 2 Group 2 aggregator (14 new recipes).
 * Mutabbal Batinjan skipped — near-duplicate of existing Baba Ghanouj.
 * Sheikh al-Mahshi remains skipped from Group 1 (Batch 1 canonical).
 */

import { ARAB_BATCH_2_GROUP_2_A } from "./arabBatch2Group2A";
import { ARAB_BATCH_2_GROUP_2_B } from "./arabBatch2Group2B";
import type { GeneratedRecipe } from "./generatedRecipeLibrary";

export const ARAB_BATCH_2_GROUP_2: GeneratedRecipe[] = [
  ...ARAB_BATCH_2_GROUP_2_A,
  ...ARAB_BATCH_2_GROUP_2_B,
];

export const ARAB_BATCH_2_GROUP_2_TITLES: string[] = ARAB_BATCH_2_GROUP_2.map(
  (r) => r.canonicalTitle,
);

/** Approved Group 2 titles skipped due to existing / near-duplicate matches. */
export const ARAB_BATCH_2_GROUP_2_SKIPPED = [
  {
    title: "Mutabbal Batinjan",
    arabic: "متبل باذنجان",
    reason:
      "Near-duplicate of existing Studio recipe Baba Ghanouj (smoky eggplant + tahini mezze). Not overwritten.",
    existingMatch: "Baba Ghanouj",
  },
] as const;
