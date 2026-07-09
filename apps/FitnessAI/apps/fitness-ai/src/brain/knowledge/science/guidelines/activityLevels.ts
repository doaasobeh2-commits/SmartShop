import type { ActivityLevel } from "../../../../domain/models";
import { ACTIVITY_MULTIPLIERS } from "../formulas/energyExpenditure";
import { EVIDENCE_BY_ID } from "../evidence/catalog";

export type ActivityGuideline = {
  level: ActivityLevel;
  multiplier: number;
  label: string;
  description: string;
  evidenceId: string;
};

/** Documented activity level definitions linked to PAL multipliers. */
export const ACTIVITY_GUIDELINES: ActivityGuideline[] = [
  {
    level: "sed",
    multiplier: ACTIVITY_MULTIPLIERS.sed,
    label: "Mostly sedentary",
    description: "Desk work, little structured exercise.",
    evidenceId: "activity-pal-heuristic",
  },
  {
    level: "light",
    multiplier: ACTIVITY_MULTIPLIERS.light,
    label: "Light activity",
    description: "Light exercise 1–3 days per week.",
    evidenceId: "activity-pal-heuristic",
  },
  {
    level: "mod",
    multiplier: ACTIVITY_MULTIPLIERS.mod,
    label: "Moderately active",
    description: "Moderate exercise 3–5 days per week.",
    evidenceId: "activity-pal-heuristic",
  },
  {
    level: "active",
    multiplier: ACTIVITY_MULTIPLIERS.active,
    label: "Very active",
    description: "Hard exercise 6–7 days per week.",
    evidenceId: "activity-pal-heuristic",
  },
  {
    level: "athlete",
    multiplier: ACTIVITY_MULTIPLIERS.athlete,
    label: "Athlete",
    description: "Very hard daily training or physical job.",
    evidenceId: "activity-pal-heuristic",
  },
];

export function getActivityEvidenceCitation(level: ActivityLevel): string {
  const g = ACTIVITY_GUIDELINES.find((a) => a.level === level);
  const id = g?.evidenceId ?? "activity-pal-heuristic";
  return EVIDENCE_BY_ID[id]?.citation ?? id;
}
