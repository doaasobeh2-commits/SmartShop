/**
 * Food source registry and mock adapters — architecture for future trusted databases.
 * Mock records mirror USDA FoodData Central nutrient schema; live API integration reserved.
 * @see knowledge/scientificSources — usda-fdc
 */

/** USDA FDC dataset release referenced by mock seed records (update when refreshing food data). */
export const FOOD_DATASET_RELEASE = {
  sourceId: "usda-fdc",
  releaseLabel: "SR Legacy / Foundation Foods sample",
  documentationUrl: "https://fdc.nal.usda.gov/",
  apiDocsUrl: "https://fdc.nal.usda.gov/api-guide.html",
  /** Date mock records were last aligned to FDC sample payloads. */
  lastVerified: "2024-01-15",
} as const;

import {
  readInstallationScoped,
  writeInstallationScoped,
} from "../privacy/brainInstallationStorage";
import {
  buildFromPer100,
  normalizeFromOpenFoodFacts,
  normalizeFromUsda,
  normalizeUserCustomFood,
  type OpenFoodFactsMockRecord,
  type UsdaFoodDataMockRecord,
} from "./foodNutritionNormalizer";
import type { FoodKnowledgeItem, FoodSourceCategory, UserCustomFoodInput } from "./foodTypes";

export type FoodSourceDefinition = {
  id: string;
  category: FoodSourceCategory;
  nameDe: string;
  nameEn: string;
  /** Future public documentation URL — not fetched at runtime. */
  documentationUrl?: string;
  licenseNote: string;
  supportsBarcode: boolean;
  supportsSearch: boolean;
  liveApiEnabled: false;
};

export const FOOD_SOURCE_DEFINITIONS: FoodSourceDefinition[] = [
  {
    id: "usda_fdc",
    category: "verified_database",
    nameDe: "USDA FoodData Central",
    nameEn: "USDA FoodData Central",
    documentationUrl: "https://fdc.nal.usda.gov/",
    licenseNote: "Public domain — US government data. Dataset: see FOOD_DATASET_RELEASE.",
    supportsBarcode: false,
    supportsSearch: true,
    liveApiEnabled: false,
  },
  {
    id: "open_food_facts",
    category: "open_food_database",
    nameDe: "Open Food Facts",
    nameEn: "Open Food Facts",
    documentationUrl: "https://world.openfoodfacts.org/",
    licenseNote: "Open Database License — attribution required (future integration).",
    supportsBarcode: true,
    supportsSearch: true,
    liveApiEnabled: false,
  },
  {
    id: "eu_food_composition",
    category: "verified_database",
    nameDe: "Europäische Lebensmittelzusammensetzung",
    nameEn: "European food composition",
    licenseNote: "Reserved — integrate only when licensing permits.",
    supportsBarcode: false,
    supportsSearch: true,
    liveApiEnabled: false,
  },
  {
    id: "user_custom",
    category: "user_custom_food",
    nameDe: "Eigene Lebensmittel",
    nameEn: "Custom foods",
    licenseNote: "User-provided — marked as user_custom_food.",
    supportsBarcode: false,
    supportsSearch: true,
    liveApiEnabled: false,
  },
  {
    id: "estimated",
    category: "estimated_food",
    nameDe: "Geschätzte Werte",
    nameEn: "Estimated values",
    licenseNote: "Always low confidence — never shown as exact.",
    supportsBarcode: false,
    supportsSearch: false,
    liveApiEnabled: false,
  },
  {
    id: "manual",
    category: "manual_entry",
    nameDe: "Manuelle Eingabe",
    nameEn: "Manual entry",
    licenseNote: "User-typed macros without database match.",
    supportsBarcode: false,
    supportsSearch: false,
    liveApiEnabled: false,
  },
];

export const USER_CUSTOM_FOODS_STORAGE_KEY = "food:user-custom";

/** Sample USDA-shaped records — replace with API adapter later. */
const MOCK_USDA_RECORDS: UsdaFoodDataMockRecord[] = [
  {
    fdcId: 171077,
    description: "Chicken, breast, grilled",
    foodNutrients: [
      { nutrientName: "Energy", value: 165, unitName: "kcal" },
      { nutrientName: "Protein", value: 31, unitName: "g" },
      { nutrientName: "Carbohydrate, by difference", value: 0, unitName: "g" },
      { nutrientName: "Total lipid (fat)", value: 3.6, unitName: "g" },
      { nutrientName: "Fiber, total dietary", value: 0, unitName: "g" },
      { nutrientName: "Sodium, Na", value: 74, unitName: "mg" },
    ],
    servingSize: 100,
    servingSizeUnit: "g",
    publicationDate: "2024-01-15",
  },
  {
    fdcId: 168874,
    description: "Oats, rolled, dry",
    foodNutrients: [
      { nutrientName: "Energy", value: 389, unitName: "kcal" },
      { nutrientName: "Protein", value: 16.9, unitName: "g" },
      { nutrientName: "Carbohydrate, by difference", value: 66.3, unitName: "g" },
      { nutrientName: "Total lipid (fat)", value: 6.9, unitName: "g" },
      { nutrientName: "Fiber, total dietary", value: 10.6, unitName: "g" },
    ],
    servingSize: 100,
    servingSizeUnit: "g",
    publicationDate: "2024-01-15",
  },
  {
    fdcId: 170903,
    description: "Yogurt, Greek, plain",
    foodNutrients: [
      { nutrientName: "Energy", value: 97, unitName: "kcal" },
      { nutrientName: "Protein", value: 9, unitName: "g" },
      { nutrientName: "Carbohydrate, by difference", value: 3.6, unitName: "g" },
      { nutrientName: "Total lipid (fat)", value: 5, unitName: "g" },
    ],
    servingSize: 100,
    servingSizeUnit: "g",
    publicationDate: "2024-01-15",
  },
];

/** Sample Open Food Facts-shaped records — replace with barcode API later. */
const MOCK_OFF_RECORDS: OpenFoodFactsMockRecord[] = [
  {
    code: "4000400110401",
    product_name: "Haferflocken",
    brands: "Kölln",
    nutriments: {
      "energy-kcal_100g": 370,
      proteins_100g: 13,
      carbohydrates_100g: 58,
      fat_100g: 7,
      fiber_100g: 10,
      sugars_100g: 1,
      salt_100g: 0.01,
    },
    last_modified_t: 1700000000,
  },
  {
    code: "5000159484695",
    product_name: "Protein Riegel",
    brands: "Generic Brand",
    nutriments: {
      "energy-kcal_100g": 380,
      proteins_100g: 30,
      carbohydrates_100g: 35,
      fat_100g: 12,
      fiber_100g: 3,
      sugars_100g: 2,
      salt_100g: 0.4,
    },
    last_modified_t: 1700000000,
  },
];

/** Local seed catalog bridging legacy app food IDs. */
const SEED_CATALOG: FoodKnowledgeItem[] = [
  buildFromPer100({
    source: "verified_database",
    sourceFoodId: "seed-oats",
    name: "Haferflocken",
    per100: { calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, fiber: 10.6 },
    servingSize: 50,
    servingUnit: "g",
    sourceAttribution: "FitnessAI Seed-Katalog (USDA-basiert, mock)",
  }),
  buildFromPer100({
    source: "verified_database",
    sourceFoodId: "seed-chicken-breast",
    name: "Hähnchenbrust (gegrillt)",
    per100: { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    servingSize: 150,
    servingUnit: "g",
    sourceAttribution: "FitnessAI Seed-Katalog (USDA-basiert, mock)",
  }),
  buildFromPer100({
    source: "verified_database",
    sourceFoodId: "seed-greek-yogurt",
    name: "Griechischer Joghurt (natur)",
    per100: { calories: 97, protein: 9, carbs: 3.6, fat: 5 },
    servingSize: 170,
    servingUnit: "g",
    sourceAttribution: "FitnessAI Seed-Katalog (USDA-basiert, mock)",
  }),
];

export type FoodSourceAdapter = {
  sourceId: string;
  category: FoodSourceCategory;
  search(query: string, limit?: number): FoodKnowledgeItem[];
  getById(sourceFoodId: string): FoodKnowledgeItem | undefined;
  lookupBarcode?(barcode: string): FoodKnowledgeItem | null;
};

function normalizeUsdaCatalog(): FoodKnowledgeItem[] {
  return MOCK_USDA_RECORDS.map((r) => normalizeFromUsda(r)).filter(Boolean) as FoodKnowledgeItem[];
}

function normalizeOffCatalog(): FoodKnowledgeItem[] {
  return MOCK_OFF_RECORDS.map((r) => normalizeFromOpenFoodFacts(r)).filter(Boolean) as FoodKnowledgeItem[];
}

const usdaItems = normalizeUsdaCatalog();
const offItems = normalizeOffCatalog();

/** Mock USDA adapter — swap implementation when API is licensed and enabled. */
export const usdaMockAdapter: FoodSourceAdapter = {
  sourceId: "usda_fdc",
  category: "verified_database",
  search(query, limit = 20) {
    const q = query.trim().toLowerCase();
    if (!q) return usdaItems.slice(0, limit);
    return usdaItems
      .filter((f) => f.name.toLowerCase().includes(q))
      .slice(0, limit);
  },
  getById(sourceFoodId) {
    return usdaItems.find((f) => f.sourceFoodId === sourceFoodId);
  },
};

/** Mock Open Food Facts adapter — swap when barcode API is enabled. */
export const openFoodFactsMockAdapter: FoodSourceAdapter = {
  sourceId: "open_food_facts",
  category: "open_food_database",
  search(query, limit = 20) {
    const q = query.trim().toLowerCase();
    if (!q) return offItems.slice(0, limit);
    return offItems
      .filter((f) => f.name.toLowerCase().includes(q) || f.brand?.toLowerCase().includes(q))
      .slice(0, limit);
  },
  getById(sourceFoodId) {
    return offItems.find((f) => f.sourceFoodId === sourceFoodId);
  },
  lookupBarcode(barcode) {
    const raw = MOCK_OFF_RECORDS.find((r) => r.code === barcode);
    return raw ? normalizeFromOpenFoodFacts(raw) : null;
  },
};

/** User custom foods — installation-scoped, no personal identity. */
export const userCustomFoodAdapter: FoodSourceAdapter = {
  sourceId: "user_custom",
  category: "user_custom_food",
  search(query, limit = 20) {
    const q = query.trim().toLowerCase();
    const foods = loadUserCustomFoods();
    if (!q) return foods.slice(0, limit);
    return foods.filter((f) => f.name.toLowerCase().includes(q)).slice(0, limit);
  },
  getById(sourceFoodId) {
    return loadUserCustomFoods().find((f) => f.sourceFoodId === sourceFoodId);
  },
};

export const FOOD_SOURCE_ADAPTERS: FoodSourceAdapter[] = [
  usdaMockAdapter,
  openFoodFactsMockAdapter,
  userCustomFoodAdapter,
];

export function getSourceDefinition(sourceId: string): FoodSourceDefinition | undefined {
  return FOOD_SOURCE_DEFINITIONS.find((s) => s.id === sourceId);
}

export function getAdaptersForCategories(categories?: FoodSourceCategory[]): FoodSourceAdapter[] {
  if (!categories || categories.length === 0) return FOOD_SOURCE_ADAPTERS;
  return FOOD_SOURCE_ADAPTERS.filter((a) => categories.includes(a.category));
}

export function getSeedCatalog(): FoodKnowledgeItem[] {
  return [...SEED_CATALOG];
}

function newCustomFoodId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `custom-${Date.now()}`;
}

export function loadUserCustomFoods(): FoodKnowledgeItem[] {
  return readInstallationScoped<FoodKnowledgeItem[]>(USER_CUSTOM_FOODS_STORAGE_KEY) ?? [];
}

export function saveUserCustomFood(input: UserCustomFoodInput): FoodKnowledgeItem {
  const sourceFoodId = newCustomFoodId();
  const item = normalizeUserCustomFood(input, sourceFoodId);
  const existing = loadUserCustomFoods();
  writeInstallationScoped(USER_CUSTOM_FOODS_STORAGE_KEY, [...existing, item]);
  return item;
}

export function deleteUserCustomFood(sourceFoodId: string): void {
  const next = loadUserCustomFoods().filter((f) => f.sourceFoodId !== sourceFoodId);
  writeInstallationScoped(USER_CUSTOM_FOODS_STORAGE_KEY, next);
}

/** Resolves canonical id (source:sourceFoodId) across adapters + seed catalog. */
export function resolveFoodByCanonicalId(id: string): FoodKnowledgeItem | undefined {
  const seed = SEED_CATALOG.find((f) => f.id === id);
  if (seed) return seed;

  const [category, ...rest] = id.split(":");
  const sourceFoodId = rest.join(":");
  if (!sourceFoodId) return undefined;

  for (const adapter of FOOD_SOURCE_ADAPTERS) {
    if (adapter.category === category) {
      const hit = adapter.getById(sourceFoodId);
      if (hit) return hit;
    }
  }

  return undefined;
}

/** Maps legacy app food IDs (e.g. oats) to seed catalog entries. */
export function resolveLegacyFoodId(legacyId: string): FoodKnowledgeItem | undefined {
  const map: Record<string, string> = {
    oats: "verified_database:seed-oats",
    "chicken-breast": "verified_database:seed-chicken-breast",
    "greek-yogurt": "verified_database:seed-greek-yogurt",
  };
  const canonical = map[legacyId];
  return canonical ? resolveFoodByCanonicalId(canonical) : undefined;
}

export { MOCK_USDA_RECORDS, MOCK_OFF_RECORDS, SEED_CATALOG };
