/**
 * Sport-specific scientific knowledge — foundation for training decisions.
 * Each primary sport has principles, energy/recovery demands, progression, nutrition, weekly structure, and sessions.
 * @see knowledge/sportPhilosophy
 */

import type { ExperienceLevel } from "../types";
import type { KnowledgeRule } from "./evidenceLevels";

export type SportEnergyDemand = "low" | "moderate" | "high" | "very_high";
export type SportRecoveryNeed = "low" | "moderate" | "high";
export type SportProgressionStyle = "volume" | "intensity" | "distance" | "skill" | "mixed";

export type SportSessionItem = {
  id: string;
  name: string;
  detail: string;
  estMinutes?: number;
  /** Strength sports — link to EXERCISE_CATALOG id */
  catalogExerciseId?: string;
};

export type SportSessionDefinition = {
  key: string;
  type: "workout" | "rest" | "light_activity" | "walking";
  title: string;
  detail: string;
  items: SportSessionItem[];
  targetMinutes: number;
  supportingRuleIds: string[];
};

export type SportWeeklyStructure = {
  sessionsPerWeek: Record<ExperienceLevel, { min: number; max: number }>;
  /** Session keys rotated on training days */
  sessionRotation: Record<ExperienceLevel, string[]>;
};

export type SportKnowledge = {
  id: string;
  name: string;
  /** Links to activityLibrary for MET / recovery metadata */
  activityLibraryId: string;
  trainingPrinciples: string[];
  energyDemand: SportEnergyDemand;
  recoveryNeed: SportRecoveryNeed;
  progressionStyle: SportProgressionStyle;
  nutritionConsiderations: string[];
  weeklyStructure: SportWeeklyStructure;
  sessions: Record<string, SportSessionDefinition>;
  sourceIds: string[];
};

/** Primary sports selectable at onboarding — extensible for future sports. */
export const PRIMARY_SPORT_IDS = [
  "bodybuilding",
  "running",
  "cycling",
  "swimming",
  "martial_arts",
  "football",
  "tennis",
  "crossfit",
  "walking",
  "hiking",
  "yoga",
] as const;

export type PrimarySportId = (typeof PRIMARY_SPORT_IDS)[number];

function session(
  key: string,
  type: SportSessionDefinition["type"],
  title: string,
  detail: string,
  targetMinutes: number,
  items: SportSessionItem[],
  supportingRuleIds: string[],
): SportSessionDefinition {
  return { key, type, title, detail, targetMinutes, items, supportingRuleIds };
}

function strengthItems(
  ids: { catalogExerciseId: string; sets?: number; reps?: string }[],
): SportSessionItem[] {
  return ids.map(({ catalogExerciseId, sets = 3, reps = "8–12" }) => ({
    id: catalogExerciseId,
    catalogExerciseId,
    name: catalogExerciseId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    detail: `${sets} × ${reps}`,
    estMinutes: 10,
  }));
}

const REST_SESSION = session(
  "rest",
  "rest",
  "Planned rest",
  "Recovery supports adaptation — light mobility optional.",
  0,
  [],
  ["rest-day-logic"],
);

const WALK_SESSION = session(
  "active_recovery_walk",
  "walking",
  "Active recovery walk",
  "Easy pace — supports circulation without adding training stress.",
  25,
  [{ id: "walk-easy", name: "Easy walk", detail: "20–25 min · conversational pace", estMinutes: 25 }],
  ["light-activity-recommendation"],
);

const MOBILITY_SESSION = session(
  "mobility",
  "light_activity",
  "Mobility & breath",
  "Gentle movement — no intensity target today.",
  20,
  [
    { id: "mobility-flow", name: "Mobility flow", detail: "10 min joints + 10 min breathing", estMinutes: 20 },
  ],
  ["light-activity-recommendation"],
);

function buildStrengthSport(
  id: string,
  name: string,
  rotations: Record<ExperienceLevel, string[]>,
  sessions: Record<string, SportSessionDefinition>,
): SportKnowledge {
  return {
    id,
    name,
    activityLibraryId: id,
    trainingPrinciples: [
      "Progressive overload with controlled form",
      "Adequate rest between hard sessions",
      "Match volume to experience and recovery",
    ],
    energyDemand: "high",
    recoveryNeed: "high",
    progressionStyle: "volume",
    nutritionConsiderations: [
      "Protein spread across meals supports muscle repair",
      "Pre-session carbs optional for longer sessions",
    ],
    weeklyStructure: {
      sessionsPerWeek: {
        beginner: { min: 2, max: 3 },
        intermediate: { min: 3, max: 4 },
        advanced: { min: 4, max: 5 },
      },
      sessionRotation: rotations,
    },
    sessions: { rest: REST_SESSION, active_recovery_walk: WALK_SESSION, mobility: MOBILITY_SESSION, ...sessions },
    sourceIds: ["acsm-exercise-prescription"],
  };
}

export const SPORT_KNOWLEDGE: SportKnowledge[] = [
  buildStrengthSport("bodybuilding", "Bodybuilding", {
    beginner: ["full_body_a", "full_body_b", "full_body_a"],
    intermediate: ["upper_hypertrophy", "lower_hypertrophy", "push", "pull"],
    advanced: ["push", "pull", "legs", "upper_pump"],
  }, {
    full_body_a: session(
      "full_body_a",
      "workout",
      "Full-body basics",
      "Compound focus — moderate volume, controlled tempo.",
      40,
      strengthItems([
        { catalogExerciseId: "barbell-squat", sets: 4, reps: "8–10" },
        { catalogExerciseId: "bench-press", sets: 3, reps: "8–10" },
        { catalogExerciseId: "romanian-deadlift", sets: 3, reps: "10–12" },
        { catalogExerciseId: "pull-up", sets: 3, reps: "6–10" },
      ]),
      ["beginner-frequency", "progressive-overload-basics"],
    ),
    full_body_b: session(
      "full_body_b",
      "workout",
      "Full-body hypertrophy B",
      "Alternate movement patterns — same scientific volume principles.",
      40,
      strengthItems([
        { catalogExerciseId: "leg-press", sets: 3, reps: "12–15" },
        { catalogExerciseId: "bench-press", sets: 4, reps: "6–8" },
        { catalogExerciseId: "romanian-deadlift", sets: 3, reps: "8–10" },
        { catalogExerciseId: "calf-raises", sets: 3, reps: "15" },
      ]),
      ["beginner-frequency", "progressive-overload-basics"],
    ),
    upper_hypertrophy: session(
      "upper_hypertrophy",
      "workout",
      "Upper hypertrophy",
      "Push/pull balance — moderate sets per muscle group.",
      45,
      strengthItems([
        { catalogExerciseId: "bench-press", sets: 4, reps: "8–10" },
        { catalogExerciseId: "pull-up", sets: 4, reps: "6–10" },
        { catalogExerciseId: "leg-extension", sets: 3, reps: "12–15" },
      ]),
      ["intermediate-frequency", "progressive-overload-basics"],
    ),
    lower_hypertrophy: session(
      "lower_hypertrophy",
      "workout",
      "Lower hypertrophy",
      "Squat and hinge patterns — legs and glutes emphasis.",
      45,
      strengthItems([
        { catalogExerciseId: "barbell-squat", sets: 4, reps: "8–10" },
        { catalogExerciseId: "romanian-deadlift", sets: 4, reps: "8–10" },
        { catalogExerciseId: "leg-press", sets: 3, reps: "12–15" },
        { catalogExerciseId: "calf-raises", sets: 4, reps: "15–20" },
      ]),
      ["intermediate-frequency", "progressive-overload-basics"],
    ),
    push: session(
      "push",
      "workout",
      "Push session",
      "Chest, shoulders, triceps — progressive overload focus.",
      45,
      strengthItems([
        { catalogExerciseId: "bench-press", sets: 4, reps: "6–10" },
        { catalogExerciseId: "leg-extension", sets: 3, reps: "12–15" },
      ]),
      ["intermediate-frequency", "progressive-overload-basics"],
    ),
    pull: session(
      "pull",
      "workout",
      "Pull session",
      "Back and biceps — controlled eccentric work.",
      40,
      strengthItems([
        { catalogExerciseId: "pull-up", sets: 4, reps: "6–10" },
        { catalogExerciseId: "romanian-deadlift", sets: 3, reps: "10–12" },
      ]),
      ["intermediate-frequency", "progressive-overload-basics"],
    ),
    legs: session(
      "legs",
      "workout",
      "Leg day",
      "Lower-body volume — form before load increases.",
      50,
      strengthItems([
        { catalogExerciseId: "barbell-squat", sets: 4, reps: "6–10" },
        { catalogExerciseId: "romanian-deadlift", sets: 4, reps: "8–10" },
        { catalogExerciseId: "leg-press", sets: 3, reps: "12–15" },
        { catalogExerciseId: "leg-extension", sets: 3, reps: "15" },
        { catalogExerciseId: "calf-raises", sets: 4, reps: "20" },
      ]),
      ["intermediate-frequency", "progressive-overload-basics"],
    ),
    upper_pump: session(
      "upper_pump",
      "workout",
      "Upper pump",
      "Moderate load, higher rep ranges — recovery permitting.",
      40,
      strengthItems([
        { catalogExerciseId: "bench-press", sets: 3, reps: "12–15" },
        { catalogExerciseId: "pull-up", sets: 3, reps: "8–12" },
      ]),
      ["intermediate-frequency"],
    ),
  }),
  {
    id: "running",
    name: "Running",
    activityLibraryId: "running",
    trainingPrinciples: [
      "Easy days easy, hard days hard",
      "Increase weekly mileage gradually (~10% rule)",
      "Include rest or cross-training for tendon adaptation",
    ],
    energyDemand: "high",
    recoveryNeed: "moderate",
    progressionStyle: "distance",
    nutritionConsiderations: [
      "Carbohydrate availability matters for sessions over 60 min",
      "Hydration scales with sweat rate and duration",
    ],
    weeklyStructure: {
      sessionsPerWeek: {
        beginner: { min: 2, max: 3 },
        intermediate: { min: 3, max: 4 },
        advanced: { min: 4, max: 6 },
      },
      sessionRotation: {
        beginner: ["easy_run", "easy_run", "long_easy"],
        intermediate: ["easy_run", "tempo", "easy_run", "long_run"],
        advanced: ["easy_run", "intervals", "tempo", "easy_run", "long_run"],
      },
    },
    sessions: {
      rest: REST_SESSION,
      active_recovery_walk: WALK_SESSION,
      mobility: MOBILITY_SESSION,
      easy_run: session(
        "easy_run",
        "workout",
        "Easy aerobic run",
        "Conversational pace — builds aerobic base without excessive stress.",
        30,
        [{ id: "run-easy", name: "Easy run", detail: "25–35 min · Zone 2 effort", estMinutes: 30 }],
        ["light-activity-recommendation", "compendium-met-2011"],
      ),
      tempo: session(
        "tempo",
        "workout",
        "Tempo run",
        "Sustained moderate effort — lactate threshold development.",
        40,
        [
          { id: "run-warmup", name: "Warm-up jog", detail: "10 min easy", estMinutes: 10 },
          { id: "run-tempo", name: "Tempo block", detail: "20 min comfortably hard", estMinutes: 20 },
          { id: "run-cooldown", name: "Cool-down", detail: "10 min easy", estMinutes: 10 },
        ],
        ["intermediate-frequency"],
      ),
      intervals: session(
        "intervals",
        "workout",
        "Interval session",
        "Short hard repeats with full recovery — speed and VO₂ stimulus.",
        35,
        [
          { id: "run-warmup", name: "Warm-up", detail: "10 min easy + drills", estMinutes: 10 },
          { id: "run-intervals", name: "Intervals", detail: "6 × 2 min hard / 2 min easy", estMinutes: 20 },
          { id: "run-cooldown", name: "Cool-down", detail: "5 min walk/jog", estMinutes: 5 },
        ],
        ["intermediate-frequency"],
      ),
      long_run: session(
        "long_run",
        "workout",
        "Long run",
        "Extended aerobic session — pace stays controlled throughout.",
        55,
        [{ id: "run-long", name: "Long run", detail: "45–60 min easy–moderate", estMinutes: 55 }],
        ["intermediate-frequency"],
      ),
      long_easy: session(
        "long_easy",
        "workout",
        "Long easy run",
        "Gradual endurance build — stay at easy effort.",
        35,
        [{ id: "run-long-easy", name: "Long easy run", detail: "30–40 min easy", estMinutes: 35 }],
        ["beginner-frequency"],
      ),
    },
    sourceIds: ["acsm-exercise-prescription", "compendium-met-2011"],
  },
  {
    id: "cycling",
    name: "Cycling",
    activityLibraryId: "cycling",
    trainingPrinciples: [
      "Balance intensity with recovery rides",
      "Progress duration before intensity for beginners",
      "Cadence and posture reduce joint stress",
    ],
    energyDemand: "moderate",
    recoveryNeed: "moderate",
    progressionStyle: "distance",
    nutritionConsiderations: ["Carb intake scales with ride duration", "Electrolytes on rides over 90 min"],
    weeklyStructure: {
      sessionsPerWeek: {
        beginner: { min: 2, max: 3 },
        intermediate: { min: 3, max: 4 },
        advanced: { min: 4, max: 5 },
      },
      sessionRotation: {
        beginner: ["endurance_ride", "recovery_spin", "endurance_ride"],
        intermediate: ["endurance_ride", "tempo_ride", "recovery_spin", "long_ride"],
        advanced: ["endurance_ride", "intervals_ride", "tempo_ride", "recovery_spin", "long_ride"],
      },
    },
    sessions: {
      rest: REST_SESSION,
      active_recovery_walk: WALK_SESSION,
      mobility: MOBILITY_SESSION,
      endurance_ride: session(
        "endurance_ride",
        "workout",
        "Endurance ride",
        "Steady aerobic cadence — conversational effort.",
        45,
        [{ id: "cycle-endurance", name: "Endurance ride", detail: "40–50 min steady", estMinutes: 45 }],
        ["light-activity-recommendation"],
      ),
      tempo_ride: session(
        "tempo_ride",
        "workout",
        "Tempo ride",
        "Sustained moderate power — controlled breathing.",
        50,
        [{ id: "cycle-tempo", name: "Tempo ride", detail: "35 min tempo + warm-up/cool-down", estMinutes: 50 }],
        ["intermediate-frequency"],
      ),
      intervals_ride: session(
        "intervals_ride",
        "workout",
        "Interval ride",
        "Short high-intensity blocks with recovery spins.",
        45,
        [{ id: "cycle-intervals", name: "Interval ride", detail: "5 × 3 min hard / 3 min easy", estMinutes: 45 }],
        ["intermediate-frequency"],
      ),
      recovery_spin: session(
        "recovery_spin",
        "light_activity",
        "Recovery spin",
        "Very easy legs — flush without load.",
        30,
        [{ id: "cycle-recovery", name: "Recovery spin", detail: "25–30 min very easy", estMinutes: 30 }],
        ["light-activity-recommendation"],
      ),
      long_ride: session(
        "long_ride",
        "workout",
        "Long ride",
        "Extended aerobic volume — fuel and hydrate accordingly.",
        75,
        [{ id: "cycle-long", name: "Long ride", detail: "60–90 min steady", estMinutes: 75 }],
        ["intermediate-frequency"],
      ),
    },
    sourceIds: ["acsm-exercise-prescription", "compendium-met-2011"],
  },
  {
    id: "swimming",
    name: "Swimming",
    activityLibraryId: "swimming",
    trainingPrinciples: [
      "Technique before volume",
      "Shoulder mobility supports stroke health",
      "Mix aerobic and drill sets",
    ],
    energyDemand: "moderate",
    recoveryNeed: "moderate",
    progressionStyle: "skill",
    nutritionConsiderations: ["Post-session protein supports upper-body recovery"],
    weeklyStructure: {
      sessionsPerWeek: {
        beginner: { min: 2, max: 2 },
        intermediate: { min: 3, max: 4 },
        advanced: { min: 4, max: 5 },
      },
      sessionRotation: {
        beginner: ["technique_swim", "easy_swim"],
        intermediate: ["technique_swim", "aerobic_swim", "drill_set"],
        advanced: ["aerobic_swim", "threshold_swim", "technique_swim", "endurance_swim"],
      },
    },
    sessions: {
      rest: REST_SESSION,
      active_recovery_walk: WALK_SESSION,
      mobility: MOBILITY_SESSION,
      technique_swim: session(
        "technique_swim",
        "workout",
        "Technique focus",
        "Drills and easy laps — stroke efficiency first.",
        35,
        [
          { id: "swim-warmup", name: "Warm-up", detail: "200 m easy", estMinutes: 8 },
          { id: "swim-drills", name: "Drill set", detail: "4 × 50 m technique", estMinutes: 12 },
          { id: "swim-main", name: "Main set", detail: "400 m steady", estMinutes: 15 },
        ],
        ["beginner-frequency"],
      ),
      easy_swim: session(
        "easy_swim",
        "workout",
        "Easy swim",
        "Low-intensity continuous swimming.",
        30,
        [{ id: "swim-easy", name: "Easy swim", detail: "20–30 min continuous easy", estMinutes: 30 }],
        ["light-activity-recommendation"],
      ),
      aerobic_swim: session(
        "aerobic_swim",
        "workout",
        "Aerobic swim",
        "Moderate continuous volume.",
        45,
        [{ id: "swim-aerobic", name: "Aerobic set", detail: "800–1200 m steady", estMinutes: 45 }],
        ["intermediate-frequency"],
      ),
      drill_set: session(
        "drill_set",
        "workout",
        "Drill & pull set",
        "Skill and upper-body conditioning.",
        40,
        [{ id: "swim-drill-main", name: "Drill main set", detail: "6 × 100 m drill/pull", estMinutes: 40 }],
        ["intermediate-frequency"],
      ),
      threshold_swim: session(
        "threshold_swim",
        "workout",
        "Threshold swim",
        "Controlled hard repeats with rest.",
        45,
        [{ id: "swim-threshold", name: "Threshold set", detail: "5 × 200 m moderate-hard", estMinutes: 45 }],
        ["intermediate-frequency"],
      ),
      endurance_swim: session(
        "endurance_swim",
        "workout",
        "Endurance swim",
        "Longer continuous aerobic session.",
        55,
        [{ id: "swim-endurance", name: "Endurance set", detail: "1500 m+ steady", estMinutes: 55 }],
        ["intermediate-frequency"],
      ),
    },
    sourceIds: ["acsm-exercise-prescription"],
  },
  {
    id: "martial_arts",
    name: "Martial Arts",
    activityLibraryId: "martial_arts",
    trainingPrinciples: [
      "Skill practice and conditioning are both required",
      "Protect joints with proper warm-up",
      "Balance hard sparring days with technical days",
    ],
    energyDemand: "high",
    recoveryNeed: "high",
    progressionStyle: "skill",
    nutritionConsiderations: ["Adequate protein for recovery from impact and grip work", "Hydration before long sessions"],
    weeklyStructure: {
      sessionsPerWeek: {
        beginner: { min: 2, max: 3 },
        intermediate: { min: 3, max: 4 },
        advanced: { min: 4, max: 5 },
      },
      sessionRotation: {
        beginner: ["fundamentals", "conditioning", "fundamentals"],
        intermediate: ["technique", "conditioning", "sparring_light", "technique"],
        advanced: ["technique", "sparring", "conditioning", "technique"],
      },
    },
    sessions: {
      rest: REST_SESSION,
      active_recovery_walk: WALK_SESSION,
      mobility: MOBILITY_SESSION,
      fundamentals: session(
        "fundamentals",
        "workout",
        "Fundamentals class",
        "Stance, footwork, and basic combinations.",
        45,
        [
          { id: "ma-warmup", name: "Dynamic warm-up", detail: "10 min mobility + shadow", estMinutes: 10 },
          { id: "ma-drills", name: "Technique drills", detail: "25 min fundamentals", estMinutes: 25 },
          { id: "ma-cooldown", name: "Cool-down", detail: "10 min stretch", estMinutes: 10 },
        ],
        ["beginner-frequency"],
      ),
      technique: session(
        "technique",
        "workout",
        "Technique session",
        "Skill refinement — moderate intensity.",
        50,
        [
          { id: "ma-tech", name: "Technique blocks", detail: "3 × 15 min focused drills", estMinutes: 45 },
          { id: "ma-bag", name: "Bag work", detail: "10 min moderate", estMinutes: 10 },
        ],
        ["intermediate-frequency"],
      ),
      conditioning: session(
        "conditioning",
        "workout",
        "Fight conditioning",
        "Work capacity — circuits and intervals.",
        40,
        [{ id: "ma-conditioning", name: "Conditioning circuit", detail: "6 rounds · 3 min work / 1 min rest", estMinutes: 40 }],
        ["intermediate-frequency"],
      ),
      sparring_light: session(
        "sparring_light",
        "workout",
        "Light sparring",
        "Controlled partner work — technique over power.",
        45,
        [{ id: "ma-spar-light", name: "Light sparring", detail: "30 min technical sparring", estMinutes: 45 }],
        ["intermediate-frequency"],
      ),
      sparring: session(
        "sparring",
        "workout",
        "Sparring session",
        "Higher intensity partner rounds — recovery tomorrow.",
        50,
        [{ id: "ma-spar", name: "Sparring rounds", detail: "5 × 5 min rounds", estMinutes: 50 }],
        ["intermediate-frequency"],
      ),
    },
    sourceIds: ["acsm-exercise-prescription", "compendium-met-2011"],
  },
  {
    id: "football",
    name: "Football",
    activityLibraryId: "football",
    trainingPrinciples: [
      "Mix aerobic base with speed and agility",
      "Hamstring and groin prep reduce injury risk",
      "Match day replaces one hard session",
    ],
    energyDemand: "very_high",
    recoveryNeed: "high",
    progressionStyle: "mixed",
    nutritionConsiderations: ["Carb loading before match day", "Rehydration priority after long matches"],
    weeklyStructure: {
      sessionsPerWeek: {
        beginner: { min: 2, max: 3 },
        intermediate: { min: 3, max: 4 },
        advanced: { min: 4, max: 5 },
      },
      sessionRotation: {
        beginner: ["technical", "small_sided", "technical"],
        intermediate: ["technical", "conditioning", "small_sided", "match_prep"],
        advanced: ["technical", "conditioning", "small_sided", "match_prep", "recovery_run"],
      },
    },
    sessions: {
      rest: REST_SESSION,
      active_recovery_walk: WALK_SESSION,
      mobility: MOBILITY_SESSION,
      technical: session(
        "technical",
        "workout",
        "Technical session",
        "Passing, first touch, and movement patterns.",
        50,
        [{ id: "fb-tech", name: "Technical drills", detail: "45 min ball work + warm-up", estMinutes: 50 }],
        ["intermediate-frequency"],
      ),
      conditioning: session(
        "conditioning",
        "workout",
        "Football conditioning",
        "Repeated sprint ability and agility.",
        45,
        [{ id: "fb-conditioning", name: "Sprint & agility", detail: "Intervals + change of direction", estMinutes: 45 }],
        ["intermediate-frequency"],
      ),
      small_sided: session(
        "small_sided",
        "workout",
        "Small-sided game",
        "Game-based conditioning — high engagement.",
        50,
        [{ id: "fb-ssg", name: "Small-sided games", detail: "4 × 8 min games", estMinutes: 50 }],
        ["intermediate-frequency"],
      ),
      match_prep: session(
        "match_prep",
        "workout",
        "Match preparation",
        "Tactical walk-through + sharpness drills.",
        40,
        [{ id: "fb-match-prep", name: "Match prep", detail: "30 min tactical + 10 min activation", estMinutes: 40 }],
        ["intermediate-frequency"],
      ),
      recovery_run: session(
        "recovery_run",
        "light_activity",
        "Recovery jog",
        "Flush legs after heavy match load.",
        25,
        [{ id: "fb-recovery", name: "Recovery jog", detail: "20 min very easy", estMinutes: 25 }],
        ["light-activity-recommendation"],
      ),
    },
    sourceIds: ["acsm-exercise-prescription", "compendium-met-2011"],
  },
  {
    id: "tennis",
    name: "Tennis",
    activityLibraryId: "tennis",
    trainingPrinciples: [
      "Rotational power and lateral movement matter",
      "Alternate court sessions with mobility",
      "Shoulder prehab supports serve volume",
    ],
    energyDemand: "high",
    recoveryNeed: "moderate",
    progressionStyle: "skill",
    nutritionConsiderations: ["Hydration critical in long matches", "Quick carbs between sets in tournaments"],
    weeklyStructure: {
      sessionsPerWeek: {
        beginner: { min: 2, max: 3 },
        intermediate: { min: 3, max: 4 },
        advanced: { min: 4, max: 5 },
      },
      sessionRotation: {
        beginner: ["court_basics", "court_basics", "mobility"],
        intermediate: ["court_session", "drills", "match_play", "mobility"],
        advanced: ["court_session", "drills", "match_play", "conditioning", "mobility"],
      },
    },
    sessions: {
      rest: REST_SESSION,
      active_recovery_walk: WALK_SESSION,
      mobility: MOBILITY_SESSION,
      court_basics: session(
        "court_basics",
        "workout",
        "Court basics",
        "Groundstrokes and footwork fundamentals.",
        45,
        [{ id: "tennis-basics", name: "Court session", detail: "40 min technique + feeds", estMinutes: 45 }],
        ["beginner-frequency"],
      ),
      court_session: session(
        "court_session",
        "workout",
        "Court session",
        "Full session — warm-up, drills, point play.",
        60,
        [{ id: "tennis-court", name: "Court training", detail: "60 min structured session", estMinutes: 60 }],
        ["intermediate-frequency"],
      ),
      drills: session(
        "drills",
        "workout",
        "Tennis drills",
        "Serve, return, and pattern repetition.",
        50,
        [{ id: "tennis-drills", name: "Drill session", detail: "45 min targeted drills", estMinutes: 50 }],
        ["intermediate-frequency"],
      ),
      match_play: session(
        "match_play",
        "workout",
        "Match play",
        "Competitive sets — apply tactics under pressure.",
        60,
        [{ id: "tennis-match", name: "Match play", detail: "Best of 3 short sets", estMinutes: 60 }],
        ["intermediate-frequency"],
      ),
      conditioning: session(
        "conditioning",
        "workout",
        "Tennis conditioning",
        "Lateral movement and repeat sprint work.",
        35,
        [{ id: "tennis-conditioning", name: "Agility & sprints", detail: "30 min court movement", estMinutes: 35 }],
        ["intermediate-frequency"],
      ),
    },
    sourceIds: ["acsm-exercise-prescription"],
  },
  buildStrengthSport("crossfit", "CrossFit", {
    beginner: ["wod_light", "skill_wod", "wod_light"],
    intermediate: ["wod_strength", "wod_metcon", "wod_strength"],
    advanced: ["wod_strength", "wod_metcon", "wod_grinder", "wod_strength"],
  }, {
    wod_light: session(
      "wod_light",
      "workout",
      "Light WOD",
      "Scaled movements — technique and consistency.",
      35,
      strengthItems([
        { catalogExerciseId: "barbell-squat", sets: 3, reps: "10" },
        { catalogExerciseId: "pull-up", sets: 3, reps: "8" },
      ]),
      ["beginner-frequency"],
    ),
    skill_wod: session(
      "skill_wod",
      "workout",
      "Skill + short metcon",
      "Movement skill then short conditioning block.",
      40,
      [
        { id: "cf-skill", name: "Skill work", detail: "15 min movement practice", estMinutes: 15 },
        { id: "cf-metcon", name: "Metcon", detail: "12 min AMRAP · moderate", estMinutes: 12 },
      ],
      ["beginner-frequency"],
    ),
    wod_strength: session(
      "wod_strength",
      "workout",
      "Strength + WOD",
      "Strength piece then metcon — classic structure.",
      50,
      strengthItems([
        { catalogExerciseId: "barbell-squat", sets: 5, reps: "5" },
        { catalogExerciseId: "bench-press", sets: 4, reps: "6" },
      ]),
      ["intermediate-frequency", "progressive-overload-basics"],
    ),
    wod_metcon: session(
      "wod_metcon",
      "workout",
      "Metcon day",
      "Conditioning emphasis — pace sustainably.",
      40,
      [{ id: "cf-metcon-main", name: "Metcon", detail: "20 min mixed modal", estMinutes: 40 }],
      ["intermediate-frequency"],
    ),
    wod_grinder: session(
      "wod_grinder",
      "workout",
      "Grinder WOD",
      "Longer conditioning — advanced recovery required.",
      55,
      [{ id: "cf-grinder", name: "Long WOD", detail: "30–40 min sustained effort", estMinutes: 55 }],
      ["intermediate-frequency"],
    ),
  }),
  {
    id: "walking",
    name: "Walking",
    activityLibraryId: "walking",
    trainingPrinciples: [
      "Consistency beats intensity for health goals",
      "Gradually extend duration before adding hills",
      "Supports fat loss and recovery for other sports",
    ],
    energyDemand: "low",
    recoveryNeed: "low",
    progressionStyle: "distance",
    nutritionConsiderations: ["Low additional fuel need for sessions under 45 min"],
    weeklyStructure: {
      sessionsPerWeek: {
        beginner: { min: 3, max: 5 },
        intermediate: { min: 4, max: 6 },
        advanced: { min: 5, max: 7 },
      },
      sessionRotation: {
        beginner: ["daily_walk", "brisk_walk", "daily_walk"],
        intermediate: ["daily_walk", "brisk_walk", "incline_walk", "long_walk"],
        advanced: ["daily_walk", "brisk_walk", "incline_walk", "long_walk", "daily_walk"],
      },
    },
    sessions: {
      rest: REST_SESSION,
      active_recovery_walk: WALK_SESSION,
      mobility: MOBILITY_SESSION,
      daily_walk: session(
        "daily_walk",
        "walking",
        "Daily walk",
        "Easy pace — sustainable daily movement.",
        25,
        [{ id: "walk-daily", name: "Daily walk", detail: "20–30 min easy", estMinutes: 25 }],
        ["light-activity-recommendation", "fat-loss-walking"],
      ),
      brisk_walk: session(
        "brisk_walk",
        "workout",
        "Brisk walk",
        "Moderate pace — slightly elevated breathing.",
        35,
        [{ id: "walk-brisk", name: "Brisk walk", detail: "30–40 min moderate", estMinutes: 35 }],
        ["light-activity-recommendation"],
      ),
      incline_walk: session(
        "incline_walk",
        "workout",
        "Incline walk",
        "Hills or incline — lower impact conditioning.",
        30,
        [{ id: "walk-incline", name: "Incline walk", detail: "25–35 min with hills", estMinutes: 30 }],
        ["light-activity-recommendation"],
      ),
      long_walk: session(
        "long_walk",
        "workout",
        "Long walk",
        "Extended duration — build aerobic capacity gently.",
        50,
        [{ id: "walk-long", name: "Long walk", detail: "45–60 min steady", estMinutes: 50 }],
        ["light-activity-recommendation"],
      ),
    },
    sourceIds: ["compendium-met-2011", "acsm-exercise-prescription"],
  },
  {
    id: "hiking",
    name: "Hiking",
    activityLibraryId: "hiking",
    trainingPrinciples: [
      "Build elevation gradually",
      "Footwear and pacing matter on long trails",
      "Leg and core endurance over speed",
    ],
    energyDemand: "moderate",
    recoveryNeed: "moderate",
    progressionStyle: "distance",
    nutritionConsiderations: ["Pack carbs and water proportional to duration and elevation"],
    weeklyStructure: {
      sessionsPerWeek: {
        beginner: { min: 1, max: 2 },
        intermediate: { min: 2, max: 3 },
        advanced: { min: 2, max: 4 },
      },
      sessionRotation: {
        beginner: ["trail_walk", "trail_walk"],
        intermediate: ["moderate_hike", "trail_walk", "long_hike"],
        advanced: ["moderate_hike", "elevation_hike", "long_hike", "recovery_walk"],
      },
    },
    sessions: {
      rest: REST_SESSION,
      active_recovery_walk: WALK_SESSION,
      mobility: MOBILITY_SESSION,
      trail_walk: session(
        "trail_walk",
        "workout",
        "Trail walk",
        "Uneven terrain at easy pace — build ankle stability.",
        45,
        [{ id: "hike-trail", name: "Trail walk", detail: "40–50 min easy terrain", estMinutes: 45 }],
        ["light-activity-recommendation"],
      ),
      moderate_hike: session(
        "moderate_hike",
        "workout",
        "Moderate hike",
        "Steady climb — controlled effort.",
        60,
        [{ id: "hike-moderate", name: "Moderate hike", detail: "60 min with elevation", estMinutes: 60 }],
        ["intermediate-frequency"],
      ),
      long_hike: session(
        "long_hike",
        "workout",
        "Long hike",
        "Extended time on feet — fuel accordingly.",
        120,
        [{ id: "hike-long", name: "Long hike", detail: "90–120 min", estMinutes: 120 }],
        ["intermediate-frequency"],
      ),
      elevation_hike: session(
        "elevation_hike",
        "workout",
        "Elevation hike",
        "Higher vertical gain — leg endurance focus.",
        75,
        [{ id: "hike-elevation", name: "Elevation hike", detail: "60–90 min climbing", estMinutes: 75 }],
        ["intermediate-frequency"],
      ),
      recovery_walk: session(
        "recovery_walk",
        "walking",
        "Recovery walk",
        "Flat easy walk after a long hike.",
        25,
        [{ id: "hike-recovery", name: "Recovery walk", detail: "20–25 min flat", estMinutes: 25 }],
        ["light-activity-recommendation"],
      ),
    },
    sourceIds: ["compendium-met-2011"],
  },
  {
    id: "yoga",
    name: "Yoga",
    activityLibraryId: "yoga",
    trainingPrinciples: [
      "Breath guides movement",
      "Consistency over extreme flexibility targets",
      "Balance effort and restoration",
    ],
    energyDemand: "low",
    recoveryNeed: "low",
    progressionStyle: "skill",
    nutritionConsiderations: ["Light sessions rarely need extra fuel", "Hydration supports flexibility work"],
    weeklyStructure: {
      sessionsPerWeek: {
        beginner: { min: 2, max: 4 },
        intermediate: { min: 3, max: 5 },
        advanced: { min: 4, max: 6 },
      },
      sessionRotation: {
        beginner: ["gentle_flow", "gentle_flow", "restorative"],
        intermediate: ["vinyasa_flow", "strength_yoga", "restorative", "gentle_flow"],
        advanced: ["vinyasa_flow", "strength_yoga", "power_flow", "restorative"],
      },
    },
    sessions: {
      rest: REST_SESSION,
      active_recovery_walk: WALK_SESSION,
      mobility: MOBILITY_SESSION,
      gentle_flow: session(
        "gentle_flow",
        "workout",
        "Gentle flow",
        "Slow sun salutations and standing poses.",
        35,
        [{ id: "yoga-gentle", name: "Gentle flow", detail: "30–40 min easy practice", estMinutes: 35 }],
        ["light-activity-recommendation"],
      ),
      vinyasa_flow: session(
        "vinyasa_flow",
        "workout",
        "Vinyasa flow",
        "Breath-linked movement — moderate effort.",
        45,
        [{ id: "yoga-vinyasa", name: "Vinyasa flow", detail: "45 min linked sequences", estMinutes: 45 }],
        ["intermediate-frequency"],
      ),
      strength_yoga: session(
        "strength_yoga",
        "workout",
        "Strength yoga",
        "Long holds and bodyweight strength poses.",
        40,
        [{ id: "yoga-strength", name: "Strength yoga", detail: "40 min holds + core", estMinutes: 40 }],
        ["intermediate-frequency"],
      ),
      power_flow: session(
        "power_flow",
        "workout",
        "Power flow",
        "Dynamic sequences — higher physical demand.",
        50,
        [{ id: "yoga-power", name: "Power flow", detail: "50 min dynamic practice", estMinutes: 50 }],
        ["intermediate-frequency"],
      ),
      restorative: session(
        "restorative",
        "light_activity",
        "Restorative yoga",
        "Supported poses — nervous system recovery.",
        30,
        [{ id: "yoga-restore", name: "Restorative", detail: "30 min supported poses", estMinutes: 30 }],
        ["light-activity-recommendation"],
      ),
    },
    sourceIds: ["acsm-exercise-prescription"],
  },
];

export const SPORT_KNOWLEDGE_BY_ID: Record<string, SportKnowledge> = Object.fromEntries(
  SPORT_KNOWLEDGE.map((s) => [s.id, s]),
);

export function getSportKnowledge(sportId: string | undefined): SportKnowledge | undefined {
  if (!sportId) return undefined;
  return SPORT_KNOWLEDGE_BY_ID[sportId];
}

export const SPORT_KNOWLEDGE_RULES: KnowledgeRule[] = [
  {
    id: "sport-knowledge-foundation",
    description: "Training decisions use sport-specific scientific knowledge when a primary sport is selected.",
    evidenceLevel: "moderate",
    sourceCategory: "resistance_training_guidelines",
    recommendation:
      "Apply the selected sport's principles, energy demands, recovery needs, and session rotation — not generic fixed workouts.",
    sourceIds: ["acsm-exercise-prescription"],
  },
  {
    id: "sport-session-personalization",
    description: "Session length and exercise count adapt to user preferences within sport science bounds.",
    evidenceLevel: "moderate",
    sourceCategory: "resistance_training_guidelines",
    recommendation:
      "Trim or extend sessions using available training time and preferred exercise count without violating recovery rules.",
    sourceIds: ["acsm-exercise-prescription", "acsm-recovery-training"],
  },
];
