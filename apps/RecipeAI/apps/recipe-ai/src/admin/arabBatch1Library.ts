/**
 * Arabic catalog expansion — Batch 1 aggregator (exactly 15 recipes).
 *
 * Combines the three curated Studio generation groups into a single ordered
 * batch. These are Studio draft SOURCES only: generating from them produces a
 * Recipe QA = Draft / Photo QA = Pending draft and never touches the consumer
 * canonical catalog.
 */

import { ARAB_BATCH_1_GROUP_A } from "./arabBatch1GroupA";
import { ARAB_BATCH_1_GROUP_B } from "./arabBatch1GroupB";
import { ARAB_BATCH_1_GROUP_C } from "./arabBatch1GroupC";
import type { GeneratedRecipe } from "./generatedRecipeLibrary";

export const ARAB_BATCH_1: GeneratedRecipe[] = [
  ...ARAB_BATCH_1_GROUP_A,
  ...ARAB_BATCH_1_GROUP_B,
  ...ARAB_BATCH_1_GROUP_C,
];

/** Canonical English titles of the Batch 1 recipes, in intended order. */
export const ARAB_BATCH_1_TITLES: string[] = ARAB_BATCH_1.map(
  (r) => r.canonicalTitle,
);
