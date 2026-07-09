/**
 * Primary sport labels for onboarding and profile UI.
 */

import { PRIMARY_SPORT_IDS, type PrimarySportId } from "../knowledge/sportKnowledge";

export type SportLabelLocale = "de" | "en";

const LABELS_DE: Record<PrimarySportId, string> = {
  bodybuilding: "Bodybuilding",
  running: "Laufen",
  cycling: "Radfahren",
  swimming: "Schwimmen",
  martial_arts: "Kampfsport",
  football: "Fußball",
  tennis: "Tennis",
  crossfit: "CrossFit",
  walking: "Gehen",
  hiking: "Wandern",
  yoga: "Yoga",
};

const LABELS_EN: Record<PrimarySportId, string> = {
  bodybuilding: "Bodybuilding",
  running: "Running",
  cycling: "Cycling",
  swimming: "Swimming",
  martial_arts: "Martial arts",
  football: "Football",
  tennis: "Tennis",
  crossfit: "CrossFit",
  walking: "Walking",
  hiking: "Hiking",
  yoga: "Yoga",
};

export function getPrimarySportOptions(locale: SportLabelLocale = "de"): { id: PrimarySportId; label: string }[] {
  const labels = locale === "en" ? LABELS_EN : LABELS_DE;
  return PRIMARY_SPORT_IDS.map((id) => ({ id, label: labels[id] }));
}

export function getSportLabel(sportId: string, locale: SportLabelLocale = "de"): string {
  const labels = locale === "en" ? LABELS_EN : LABELS_DE;
  return labels[sportId as PrimarySportId] ?? sportId.replace(/_/g, " ");
}

export type { PrimarySportId } from "../knowledge/sportKnowledge";
export { PRIMARY_SPORT_IDS };
