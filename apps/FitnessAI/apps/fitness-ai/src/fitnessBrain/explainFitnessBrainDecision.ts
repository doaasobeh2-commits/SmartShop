/**
 * Dev helper — returns full brain state with traceable dailyAction.explanation.
 * For console debugging only; not shown in UI.
 */

import { buildFitnessBrainUserData } from "./buildBrainInput";
import { generateFitnessBrainState } from "./fitnessBrain";
import type { DailyActionExplanation, FitnessBrainState, UserDataInput } from "./types";

export type ExplainedFitnessBrainState = FitnessBrainState & {
  explanation: DailyActionExplanation;
  brainCompleteness: number;
  lifePatterns: FitnessBrainState["lifestyle"]["patterns"];
};

export async function explainFitnessBrainDecision(
  userData?: UserDataInput,
): Promise<ExplainedFitnessBrainState> {
  const data = userData ?? (await buildFitnessBrainUserData());
  const state = generateFitnessBrainState(data);
  return {
    ...state,
    explanation: state.dailyAction.explanation,
    lifePatterns: state.lifestyle.patterns,
  };
}

export function explainFitnessBrainDecisionSync(
  userData: UserDataInput = {},
): ExplainedFitnessBrainState {
  const state = generateFitnessBrainState(userData);
  return {
    ...state,
    explanation: state.dailyAction.explanation,
    lifePatterns: state.lifestyle.patterns,
  };
}
