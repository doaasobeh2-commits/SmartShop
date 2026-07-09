import type { CoachInsight } from "../domain/models";
import { buildFitnessBrainUserData } from "../fitnessBrain/buildBrainInput";
import { runBrainPipeline } from "../fitnessBrain/pipeline";
import { generateCoachExplanations } from "../fitnessBrain/presentation";
import { getBrainInput } from "../data/repositories/mockRepositories";

/** Coach UI — explains WHY. Today tells WHAT. No chat, no duplicated action cards. */
export type CoachService = {
  getDailyInsights(): Promise<CoachInsight[]>;
};

export const coachService: CoachService = {
  async getDailyInsights() {
    const input = await getBrainInput();
    const userData = await buildFitnessBrainUserData();
    const { state } = runBrainPipeline(userData, { appProfile: input.profile });
    return generateCoachExplanations(state);
  },
};
