/**
 * Household Intelligence Engine (HIE).
 * Invisible intelligence layer — UI stays simple; complexity lives here.
 * Applications contribute behavioral signals; engines consume confidence-based hypotheses.
 */
import type { BehavioralSignalBatch } from "./signals/BehavioralSignal";
import type { HouseholdHypothesisStore } from "./hypotheses/HouseholdHypothesis";
import type { HouseholdIntelligenceState } from "./HouseholdIntelligenceState";

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
  readonly signals: SignalIngestionContract;
  readonly hypotheses: HypothesisEngineContract;
};

export type SignalIngestionContract = {
  /** Apps contribute raw behavioral signals — never user preference forms. */
  ingest(batch: BehavioralSignalBatch): Promise<void>;
};

export type HypothesisEngineContract = {
  /** Internal read — for SmartShop, Recipe AI, Fitness AI engines only. */
  getStore(householdId: string): Promise<HouseholdHypothesisStore>;
  /** Re-run inference from accumulated signals and memory. */
  reinfer(householdId: string): Promise<HouseholdHypothesisStore>;
  /** Unified state snapshot for platform services. */
  getState(householdId: string): Promise<HouseholdIntelligenceState>;
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
