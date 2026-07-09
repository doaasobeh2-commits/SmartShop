export type { EvidenceLevel, SourceCategory, KnowledgeRule } from "./evidenceLevels";

export { EVIDENCE_LEVEL_ORDER } from "./evidenceLevels";



export {

  SCIENTIFIC_SOURCES,

  SCIENTIFIC_SOURCES_BY_ID,

  FORMULA_REGISTRY,

  FORMULA_REGISTRY_BY_ID,

  getScientificSource,

  type ScientificSource,

  type FormulaRegistryEntry,

} from "./scientificSources";



export {

  ACTIVITY_MET_SOURCES,

  ACTIVITY_MET_SOURCES_BY_ID,

  getActivityMetSource,

  type ActivityMetSource,

} from "./activityMetSources";



export {

  NUTRITION_RULES,

  NUTRITION_VALUES,

  DECISION_VALUES,

  getDecisionPriority,

  getDecisionSortScore,

  getProteinGramsPerKg,

  getWaterLiters,

  getFiberGrams,

  getGoalCalorieAdjustment,

} from "./nutritionRules";



export {

  TRAINING_RULES,

  TRAINING_VALUES,

  SESSION_TEMPLATES,

  getDefaultTrainingDays,

  pickSessionKey,

  type SessionTemplate,

} from "./trainingRules";



export {

  RECOVERY_RULES,

  RECOVERY_VALUES,

  RECOVERY_SUMMARIES,

  hasRecoverySignals,

  computeRecoveryScore,

  isOvertrainingRisk,

  resolveRecoveryLevel,

  type RecoveryLevelId,

  type RecoverySignalInput,

} from "./recoveryRules";



export {

  SAFETY_RULES,

  SAFETY_DISCLAIMERS,

  EXPLAINABILITY_VALUES,

  getEngineDisclaimer,

} from "./safetyRules";



export {

  METABOLISM_VALUES,

  METABOLISM_RULES,

  getActivityMultiplier,

  getGenderBmrOffset,

} from "./metabolismRules";



export { ACTIVITY_REQUIREMENT_VALUES } from "./activityRequirementValues";



export { BRAIN_PHILOSOPHY_RULES, BRAIN_WORKFLOW } from "./brainPhilosophy";

export {
  SPORT_KNOWLEDGE,
  SPORT_KNOWLEDGE_BY_ID,
  SPORT_KNOWLEDGE_RULES,
  PRIMARY_SPORT_IDS,
  getSportKnowledge,
  type SportKnowledge,
  type PrimarySportId,
} from "./sportKnowledge";

export { buildSportTrainingSession } from "./sportSessionBuilder";



export { EXERCISE_CATALOG } from "./exercises/catalog";

export type { ExerciseItem, WorkoutTemplate, MuscleGroup, Difficulty } from "./exercises/types";

