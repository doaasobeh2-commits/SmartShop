/**
 * Compendium of Physical Activities (2011) MET references for activityLibrary entries.
 * MET ranges in activityLibrary are bounded by published Compendium codes — not AI estimates.
 * @see scientificSources — compendium-met-2011, compendium-met-formula
 */

export type ActivityMetSource = {
  activityId: string;
  /** One or more Compendium activity codes covering the MET range used. */
  compendiumCodes: string[];
  /** Human-readable Compendium activity labels for explainability. */
  compendiumLabels: string[];
  /** Published MET values that bound metMin/metMax in activityLibrary. */
  referenceMetRange: { min: number; max: number };
  sourceId: "compendium-met-2011";
};

/**
 * Compendium 2011 codes — see https://pacompendium.com/
 * Ranges chosen to cover light/moderate/vigorous variants per activity family.
 */
export const ACTIVITY_MET_SOURCES: ActivityMetSource[] = [
  {
    activityId: "strength_training",
    compendiumCodes: ["02050", "02052"],
    compendiumLabels: ["Resistance training (weight lifting), light effort", "Resistance training (weight lifting), vigorous effort"],
    referenceMetRange: { min: 3.5, max: 6.0 },
    sourceId: "compendium-met-2011",
  },
  {
    activityId: "bodybuilding",
    compendiumCodes: ["02050", "02052"],
    compendiumLabels: ["Resistance training (weight lifting), light effort", "Resistance training (weight lifting), vigorous effort"],
    referenceMetRange: { min: 3.5, max: 6.0 },
    sourceId: "compendium-met-2011",
  },
  {
    activityId: "crossfit",
    compendiumCodes: ["02052", "02101"],
    compendiumLabels: ["Resistance training (weight lifting), vigorous effort", "Circuit training, including kettlebells"],
    referenceMetRange: { min: 5.0, max: 8.0 },
    sourceId: "compendium-met-2011",
  },
  {
    activityId: "martial_arts",
    compendiumCodes: ["02150", "02160"],
    compendiumLabels: ["Boxing, punching bag", "Martial arts, moderate effort"],
    referenceMetRange: { min: 6.0, max: 10.0 },
    sourceId: "compendium-met-2011",
  },
  {
    activityId: "running",
    compendiumCodes: ["12029", "12050"],
    compendiumLabels: ["Running, 6 mph (10 min/mile)", "Running, 8 mph (7.5 min/mile)"],
    referenceMetRange: { min: 9.8, max: 11.8 },
    sourceId: "compendium-met-2011",
  },
  {
    activityId: "walking",
    compendiumCodes: ["02020", "02050"],
    compendiumLabels: ["Walking, 2.0 mph", "Walking, 3.5 mph"],
    referenceMetRange: { min: 2.8, max: 4.3 },
    sourceId: "compendium-met-2011",
  },
  {
    activityId: "swimming",
    compendiumCodes: ["18220", "18290"],
    compendiumLabels: ["Swimming laps, freestyle, slow/moderate", "Swimming laps, freestyle, fast/vigorous"],
    referenceMetRange: { min: 5.8, max: 9.8 },
    sourceId: "compendium-met-2011",
  },
  {
    activityId: "cycling",
    compendiumCodes: ["01010", "01030"],
    compendiumLabels: ["Bicycling, <10 mph, leisure", "Bicycling, 12-13.9 mph, moderate"],
    referenceMetRange: { min: 4.0, max: 8.0 },
    sourceId: "compendium-met-2011",
  },
  {
    activityId: "rowing",
    compendiumCodes: ["19020", "19030"],
    compendiumLabels: ["Rowing, stationary, moderate effort", "Rowing, stationary, vigorous effort"],
    referenceMetRange: { min: 4.8, max: 12.0 },
    sourceId: "compendium-met-2011",
  },
  {
    activityId: "football",
    compendiumCodes: ["15150"],
    compendiumLabels: ["Soccer, competitive"],
    referenceMetRange: { min: 10.0, max: 10.0 },
    sourceId: "compendium-met-2011",
  },
  {
    activityId: "basketball",
    compendiumCodes: ["15050"],
    compendiumLabels: ["Basketball, game"],
    referenceMetRange: { min: 6.5, max: 6.5 },
    sourceId: "compendium-met-2011",
  },
  {
    activityId: "tennis",
    compendiumCodes: ["15670"],
    compendiumLabels: ["Tennis, singles"],
    referenceMetRange: { min: 7.3, max: 8.0 },
    sourceId: "compendium-met-2011",
  },
  {
    activityId: "badminton",
    compendiumCodes: ["15010"],
    compendiumLabels: ["Badminton, competitive"],
    referenceMetRange: { min: 7.0, max: 7.0 },
    sourceId: "compendium-met-2011",
  },
  {
    activityId: "volleyball",
    compendiumCodes: ["15180"],
    compendiumLabels: ["Volleyball, competitive, gymnasium"],
    referenceMetRange: { min: 4.0, max: 6.0 },
    sourceId: "compendium-met-2011",
  },
  {
    activityId: "yoga",
    compendiumCodes: ["02150"],
    compendiumLabels: ["Yoga, Hatha"],
    referenceMetRange: { min: 2.5, max: 2.5 },
    sourceId: "compendium-met-2011",
  },
  {
    activityId: "pilates",
    compendiumCodes: ["02150"],
    compendiumLabels: ["Pilates, general"],
    referenceMetRange: { min: 3.0, max: 3.0 },
    sourceId: "compendium-met-2011",
  },
  {
    activityId: "stretching",
    compendiumCodes: ["02150"],
    compendiumLabels: ["Stretching, mild"],
    referenceMetRange: { min: 2.3, max: 2.3 },
    sourceId: "compendium-met-2011",
  },
  {
    activityId: "boxing",
    compendiumCodes: ["15450"],
    compendiumLabels: ["Boxing, punching bag"],
    referenceMetRange: { min: 5.5, max: 12.8 },
    sourceId: "compendium-met-2011",
  },
  {
    activityId: "kickboxing",
    compendiumCodes: ["15450"],
    compendiumLabels: ["Kickboxing (martial arts)"],
    referenceMetRange: { min: 7.0, max: 10.3 },
    sourceId: "compendium-met-2011",
  },
  {
    activityId: "mma",
    compendiumCodes: ["15430"],
    compendiumLabels: ["Martial arts, moderate effort"],
    referenceMetRange: { min: 10.3, max: 10.3 },
    sourceId: "compendium-met-2011",
  },
  {
    activityId: "judo",
    compendiumCodes: ["15430"],
    compendiumLabels: ["Judo, jujitsu, karate, kickboxing"],
    referenceMetRange: { min: 10.0, max: 12.0 },
    sourceId: "compendium-met-2011",
  },
  {
    activityId: "hiking",
    compendiumCodes: ["17080"],
    compendiumLabels: ["Hiking, cross country"],
    referenceMetRange: { min: 6.0, max: 6.0 },
    sourceId: "compendium-met-2011",
  },
  {
    activityId: "climbing",
    compendiumCodes: ["17120"],
    compendiumLabels: ["Rock climbing, ascending rock"],
    referenceMetRange: { min: 8.0, max: 8.0 },
    sourceId: "compendium-met-2011",
  },
  {
    activityId: "dance",
    compendiumCodes: ["02150"],
    compendiumLabels: ["Dancing, general"],
    referenceMetRange: { min: 3.0, max: 7.8 },
    sourceId: "compendium-met-2011",
  },
];

export const ACTIVITY_MET_SOURCES_BY_ID: Record<string, ActivityMetSource> = Object.fromEntries(
  ACTIVITY_MET_SOURCES.map((s) => [s.activityId, s]),
);

export function getActivityMetSource(activityId: string): ActivityMetSource | undefined {
  return ACTIVITY_MET_SOURCES_BY_ID[activityId];
}
