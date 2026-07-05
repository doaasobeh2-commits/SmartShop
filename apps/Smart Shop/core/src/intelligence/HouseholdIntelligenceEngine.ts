/**
 * Household Intelligence Engine (HIE).
 * Hidden future orchestration layer — not a screen, backend, or AI runtime.
 */
export type HouseholdIntelligenceEngine = {
  readonly family: FamilyEngineContract;
  readonly shopping: ShoppingEngineContract;
  readonly offer: OfferEngineContract;
  readonly inventory: InventoryEngineContract;
  readonly consumption: ConsumptionEngineContract;
  readonly budget: BudgetEngineContract;
  readonly recommendation: RecommendationEngineContract;
  readonly nutrition: NutritionEngineContract;
  readonly learning: LearningEngineContract;
  readonly decision: DecisionEngineContract;
};

export type FamilyEngineContract = {
  getFamilyContext(familyId: string): Promise<unknown>;
};

export type ShoppingEngineContract = {
  buildRuleBasedBasket(input: unknown): Promise<unknown>;
  buildPremiumBasket(input: unknown): Promise<unknown>;
};

export type OfferEngineContract = {
  findLocalOffers(input: unknown): Promise<unknown>;
  rankOffers(input: unknown): Promise<unknown>;
};

export type InventoryEngineContract = {
  getInventoryMemory(familyId: string): Promise<unknown>;
  applyAdjustment(input: unknown): Promise<unknown>;
};

export type ConsumptionEngineContract = {
  predictConsumption(input: unknown): Promise<unknown>;
  recordConsumption(input: unknown): Promise<unknown>;
};

export type BudgetEngineContract = {
  evaluateBudget(input: unknown): Promise<unknown>;
  trackSpending(input: unknown): Promise<unknown>;
};

export type RecommendationEngineContract = {
  recommendProducts(input: unknown): Promise<unknown>;
  recommendStores(input: unknown): Promise<unknown>;
};

export type NutritionEngineContract = {
  evaluateNutritionNeeds(input: unknown): Promise<unknown>;
};

export type LearningEngineContract = {
  learnFromTimeline(input: unknown): Promise<unknown>;
  updateBehaviourProfile(input: unknown): Promise<unknown>;
};

export type DecisionEngineContract = {
  decideBasketStrategy(input: unknown): Promise<unknown>;
  explainDecision(input: unknown): Promise<unknown>;
};

export type HouseholdIntelligenceEngineStatus = {
  enabled: boolean;
  requiresPremium: boolean;
  enginesReady: Record<keyof Omit<HouseholdIntelligenceEngine, never>, boolean>;
};
