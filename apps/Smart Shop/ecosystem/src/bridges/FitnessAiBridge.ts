/**
 * Future bridge to Fitness AI.
 * Not implemented in v1.
 */
export type FitnessAiBridge = {
  getNutritionGoals(familyId: string): Promise<unknown>;
  syncShoppingWithFitness(familyId: string): Promise<unknown>;
};

export type FitnessAiBridgeStatus = {
  connected: boolean;
};

export const DEFAULT_FITNESS_AI_BRIDGE_STATUS: FitnessAiBridgeStatus = {
  connected: false,
};
