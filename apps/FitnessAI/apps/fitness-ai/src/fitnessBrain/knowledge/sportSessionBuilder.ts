/**

 * Builds today's training session from sport knowledge + user context.

 * Used by trainingEngine — not a separate engine.

 * No primary sport → lifestyle mode. Unknown experience → no sport rotation invented.

 */



import type { NextDayRecommendation } from "../activityRequirements/activityRequirementTypes";

import { EXERCISE_BY_ID } from "./exercises/catalog";

import {

  getSportKnowledge,

  type SportKnowledge,

  type SportSessionDefinition,

  type SportSessionItem,

} from "./sportKnowledge";

import type {

  BrainValidationClock,

  NormalizedUserProfile,

  RecoveryLevel,

  TrainingRecommendation,

  TrainingSessionExercise,

} from "../types";



export type SportSessionInput = {

  primarySportId?: string;

  profile: NormalizedUserProfile;

  isTrainingDay: boolean;

  recoveryLevel: RecoveryLevel;

  recoveryScore: number;

  yesterdayNextDay?: NextDayRecommendation | null;

  clock?: BrainValidationClock;

  availableTrainingMinutes?: number;

  preferredExerciseCount?: number;

};



const DEFAULT_MINUTES = 45;

const DEFAULT_EXERCISE_COUNT = 5;

const MIN_EXERCISES = 2;

const MAX_EXERCISES = 8;



function resolveItemName(item: SportSessionItem): string {

  if (item.catalogExerciseId && EXERCISE_BY_ID[item.catalogExerciseId]) {

    return EXERCISE_BY_ID[item.catalogExerciseId].name;

  }

  return item.name;

}



function mapItemToExercise(item: SportSessionItem): TrainingSessionExercise {

  const catalog = item.catalogExerciseId ? EXERCISE_BY_ID[item.catalogExerciseId] : undefined;

  return {

    id: item.catalogExerciseId ?? item.id,

    name: resolveItemName(item),

    detail: catalog ? `${catalog.defaultSets} × ${catalog.defaultReps}` : item.detail,

    estMinutes: item.estMinutes ?? catalog?.estMinutes,

  };

}



function trimExercises(

  items: SportSessionItem[],

  preferredCount: number,

  availableMinutes: number,

): TrainingSessionExercise[] {

  const mapped = items.map(mapItemToExercise);

  let selected = mapped.slice(0, Math.min(Math.max(preferredCount, MIN_EXERCISES), MAX_EXERCISES));



  let totalMinutes = selected.reduce((s, e) => s + (e.estMinutes ?? 8), 0);

  while (totalMinutes > availableMinutes && selected.length > MIN_EXERCISES) {

    selected = selected.slice(0, -1);

    totalMinutes = selected.reduce((s, e) => s + (e.estMinutes ?? 8), 0);

  }



  return selected;

}



function sessionFromNextDay(

  nextDay: NextDayRecommendation,

  sportSessions: Record<string, SportSessionDefinition>,

): SportSessionDefinition | undefined {

  switch (nextDay) {

    case "rest_recommended":

      return sportSessions.rest;

    case "light_activity":

      return sportSessions.mobility ?? sportSessions.active_recovery_walk;

    case "avoid_same_muscle_group":

      return sportSessions.mobility ?? sportSessions.active_recovery_walk;

    case "train_normally":

    default:

      return undefined;

  }

}



function pickRestSession(

  profile: NormalizedUserProfile,

  sportSessions: Record<string, SportSessionDefinition>,

): SportSessionDefinition {

  if (profile.goal === "fat_loss") {

    return sportSessions.active_recovery_walk ?? sportSessions.rest;

  }

  if (profile.activityLevel === "sedentary") {

    return sportSessions.active_recovery_walk ?? sportSessions.rest;

  }

  return sportSessions.mobility ?? sportSessions.active_recovery_walk ?? sportSessions.rest;

}



function pickRecoveryDowngrade(

  recoveryLevel: RecoveryLevel,

  sportSessions: Record<string, SportSessionDefinition>,

): SportSessionDefinition | undefined {

  if (recoveryLevel === "overtraining_risk") {

    return sportSessions.rest;

  }

  if (recoveryLevel === "low_recovery") {

    return sportSessions.mobility ?? sportSessions.active_recovery_walk;

  }

  return undefined;

}



function pickSessionKey(profile: NormalizedUserProfile, dayOfWeek: number, sport: SportKnowledge): string {

  if (profile.experienceLevel === "unknown") {

    return "mobility";

  }

  const rotation = sport.weeklyStructure.sessionRotation[profile.experienceLevel];

  if (!rotation.length) return "rest";

  if (profile.experienceLevel === "beginner") {

    return rotation[0];

  }

  return rotation[dayOfWeek % rotation.length];

}



function toRecommendation(

  session: SportSessionDefinition,

  sportId: string | undefined,

  input: SportSessionInput,

  rationale: string[],

): TrainingRecommendation {

  const availableMinutes = input.availableTrainingMinutes ?? DEFAULT_MINUTES;

  const preferredCount = input.preferredExerciseCount ?? DEFAULT_EXERCISE_COUNT;

  const exercises =

    session.items.length > 0

      ? trimExercises(session.items, preferredCount, availableMinutes)

      : [];



  const durationMin =

    exercises.length > 0

      ? exercises.reduce((s, e) => s + (e.estMinutes ?? 8), 0)

      : session.targetMinutes;



  return {

    type: session.type,

    title: session.title,

    detail: session.detail,

    isTrainingDay: input.isTrainingDay,

    disclaimer: "",

    sportId,

    sessionId: session.key,

    durationMin: Math.min(durationMin, availableMinutes),

    exercises,

    supportingRuleIds: [...session.supportingRuleIds, "sport-knowledge-foundation"],

    rationale,

  };

}



/** Lifestyle mode — no primary sport selected; no sport identity invented. */

export function buildLifestyleModeSession(_input: SportSessionInput): TrainingRecommendation {

  const rationale = [

    "No primary sport selected — Fitness Brain operates in lifestyle mode until you choose Healthy Lifestyle, Start Training, or Already Practice a Sport.",

  ];

  return {

    type: "walking",

    title: "Lifestyle movement",

    detail: "Light daily movement supports health until a primary sport is chosen.",

    isTrainingDay: false,

    disclaimer: "",

    sessionId: "lifestyle-mode",

    durationMin: 20,

    exercises: [],

    supportingRuleIds: ["light-activity-recommendation", "evidence-before-decision"],

    rationale,

  };

}



/** Generates today's session from sport knowledge and user context. */

export function buildSportTrainingSession(input: SportSessionInput): TrainingRecommendation {

  const sportId = input.primarySportId ?? input.profile.primarySportId;

  if (!sportId) {

    return buildLifestyleModeSession(input);

  }



  const sport = getSportKnowledge(sportId);

  if (!sport) {

    return buildLifestyleModeSession(input);

  }



  const dayOfWeek = input.clock?.dayOfWeek ?? new Date().getDay();

  const rationale: string[] = [`Primary sport: ${sport.name}.`];



  if (input.yesterdayNextDay && input.yesterdayNextDay !== "train_normally") {

    const session = sessionFromNextDay(input.yesterdayNextDay, sport.sessions);

    if (session) {

      rationale.push(`Yesterday's activity requirement: ${input.yesterdayNextDay}.`);

      return toRecommendation(session, sport.id, input, rationale);

    }

  }



  const recoverySession = pickRecoveryDowngrade(input.recoveryLevel, sport.sessions);

  if (recoverySession) {

    rationale.push(`Recovery level ${input.recoveryLevel} — session adjusted accordingly.`);

    return toRecommendation(recoverySession, sport.id, input, rationale);

  }



  if (!input.isTrainingDay) {

    const restSession = pickRestSession(input.profile, sport.sessions);

    rationale.push("Not a planned training day in weekly structure.");

    return toRecommendation(restSession, sport.id, input, rationale);

  }



  if (input.profile.experienceLevel === "unknown") {

    rationale.push(

      "Training experience not set — sport-specific program rotation requires your selected level.",

    );

    const session =

      sport.sessions.mobility ?? sport.sessions.active_recovery_walk ?? sport.sessions.rest;

    return toRecommendation(

      session,

      sport.id,

      { ...input, isTrainingDay: false },

      rationale,

    );

  }



  const sessionKey = pickSessionKey(input.profile, dayOfWeek, sport);

  const session = sport.sessions[sessionKey] ?? sport.sessions.rest;

  rationale.push(

    `Session "${session.key}" from ${sport.name} rotation for ${input.profile.experienceLevel} level.`,

  );



  if (input.profile.goal === "fat_loss" && session.type === "workout" && sport.energyDemand === "very_high") {

    rationale.push("Fat-loss goal — intensity moderated where sport rules allow.");

  }



  return toRecommendation(session, sport.id, input, rationale);

}


