export type {
  FoodSourceCategory,
  FoodConfidenceLevel,
  FoodKnowledgeItem,
  NormalizedNutritionPer100,
  FoodSearchQuery,
  FoodSearchResult,
  BarcodeLookupResult,
  UserCustomFoodInput,
  EstimatedFoodInput,
  ManualFoodEntryInput,
  FoodLogEntry,
  ScalePortionInput,
  ScaledFoodPortion,
} from "./foodTypes";

export {
  computeFoodConfidence,
  isEstimatedSource,
  mustShowEstimateDisclaimer,
  getConfidenceLabel,
  formatNutritionValue,
  countPresentMacroFields,
  buildConfidenceContextFromItem,
  getNutritionDisclaimer,
} from "./foodConfidence";

export type { ConfidenceContext } from "./foodConfidence";

export {
  normalizeFromOpenFoodFacts,
  normalizeFromUsda,
  normalizeUserCustomFood,
  normalizeEstimatedFood,
  normalizeManualEntry,
  scaleFoodPortion,
  buildFromPer100,
  servingToPer100,
  per100ToServing,
  buildItemId,
} from "./foodNutritionNormalizer";

export type {
  OpenFoodFactsMockRecord,
  UsdaFoodDataMockRecord,
} from "./foodNutritionNormalizer";

export {
  FOOD_SOURCE_DEFINITIONS,
  FOOD_DATASET_RELEASE,
  FOOD_SOURCE_ADAPTERS,
  USER_CUSTOM_FOODS_STORAGE_KEY,
  usdaMockAdapter,
  openFoodFactsMockAdapter,
  userCustomFoodAdapter,
  getSourceDefinition,
  getAdaptersForCategories,
  getSeedCatalog,
  loadUserCustomFoods,
  saveUserCustomFood,
  deleteUserCustomFood,
  resolveFoodByCanonicalId,
  resolveLegacyFoodId,
  MOCK_USDA_RECORDS,
  MOCK_OFF_RECORDS,
} from "./foodSources";

export type { FoodSourceDefinition, FoodSourceAdapter } from "./foodSources";

export {
  searchFoods,
  getFoodById,
  lookupBarcode,
  computePortionFromFoodId,
  listAllKnownFoods,
  buildFoodLogEntry,
  foodKnowledgeEngine,
} from "./foodSearchEngine";

export type { FoodKnowledgeEngine } from "./foodSearchEngine";
