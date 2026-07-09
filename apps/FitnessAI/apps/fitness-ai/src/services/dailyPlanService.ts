import type { DailyPlan } from "../domain/models";

import { buildFitnessBrainUserData } from "../fitnessBrain/buildBrainInput";

import { runBrainPipeline } from "../fitnessBrain/pipeline";

import { composeDailyPlan } from "../fitnessBrain/presentation";

import {

  getTodayTrainingExercises,

  syncBrainTrainingSession,

} from "../fitnessBrain/storage/trainingSessionStorage";

import { getBrainInput } from "../data/repositories/mockRepositories";



export type DailyPlanService = {

  getToday(): Promise<DailyPlan>;

};



/** Presentation service — delegates all targets and recommendations to canonical Fitness Brain. */

export const dailyPlanService: DailyPlanService = {

  async getToday() {

    const input = await getBrainInput();

    const userData = await buildFitnessBrainUserData();

    const { state } = runBrainPipeline(userData, { appProfile: input.profile });



    const stored = syncBrainTrainingSession(state.training);

    const exercises =

      stored.exercises.length > 0 ? stored.exercises : getTodayTrainingExercises();



    return composeDailyPlan(state, {

      profile: input.profile,

      meals: input.meals,

      exercises,

      waterLiters: input.waterLiters ?? undefined,

      userData,

    });

  },

};


