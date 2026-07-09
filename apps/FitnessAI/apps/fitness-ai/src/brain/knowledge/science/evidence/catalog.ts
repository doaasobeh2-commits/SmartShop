import type { EvidenceEntry, FormulaDefinition, GuidelineRule, ScienceDomain } from "../types";

/** Canonical evidence catalog — expand gradually, never overwrite with AI text. */
export const EVIDENCE_CATALOG: EvidenceEntry[] = [
  {
    id: "mifflin-st-jeor-1990",
    domain: "energyExpenditure",
    title: "Mifflin–St Jeor equation",
    summary: "Predictive equation for resting energy expenditure (REE) from weight, height, age, and sex.",
    citation: "Mifflin MD, St Jeor ST, et al. Am J Clin Nutr. 1990;51(2):241-247.",
    year: 1990,
    applicability: "BMR calculation in Calories Engine.",
  },
  {
    id: "issn-protein-2017",
    domain: "protein",
    title: "ISSN protein & exercise position stand",
    summary: "Protein intake of 1.4–2.0 g/kg/day supports muscle protein synthesis for active individuals.",
    citation: "Jäger R, et al. J Int Soc Sports Nutr. 2017;14:20.",
    year: 2017,
    applicability: "Protein g/kg coefficients in Goal and Nutrition engines.",
  },
  {
    id: "amdr-fat",
    domain: "fats",
    title: "Acceptable Macronutrient Distribution Range — fat",
    summary: "20–35% of total energy from fat for adults.",
    citation: "Institute of Medicine. Dietary Reference Intakes for Energy, Carbohydrate, Fiber, Fat, Fatty Acids, Cholesterol, Protein, and Amino Acids.",
    applicability: "Fat target ~28% kcal in Nutrition Engine.",
  },
  {
    id: "fibre-per-1000-kcal",
    domain: "fibre",
    title: "Fibre density guideline",
    summary: "14 g dietary fibre per 1000 kcal consumed.",
    citation: "US Department of Agriculture and HHS. Dietary Guidelines for Americans.",
    applicability: "Fibre target in Nutrition Engine.",
  },
  {
    id: "efsa-water-2010",
    domain: "hydration",
    title: "EFSA adequate intake — water",
    summary: "Total water intake includes fluids and food moisture; individual needs vary with body size and activity.",
    citation: "EFSA Panel on Dietetic Products, Nutrition, and Allergies. EFSA Journal 2010;8(3):1459.",
    year: 2010,
    applicability: "Hydration ml/kg heuristic in Habit Engine.",
  },
  {
    id: "safe-weight-loss-rate",
    domain: "calories",
    title: "Moderate energy deficit for fat loss",
    summary: "Deficit of ~500 kcal/day associated with ~0.5 kg/week loss within commonly cited safe ranges.",
    citation: "NICE CG43; ACSM position stands on weight loss.",
    applicability: "Goal Engine −500 kcal adjustment for lose goal.",
  },
  {
    id: "acsm-exercise-adults",
    domain: "exercise",
    title: "ACSM physical activity guidelines",
    summary: "Adults benefit from combined aerobic and resistance training across the week.",
    citation: "American College of Sports Medicine. Guidelines for Exercise Testing and Prescription.",
    applicability: "Workout template selection and volume heuristics.",
  },
  {
    id: "recovery-stretching",
    domain: "recovery",
    title: "Post-exercise recovery practices",
    summary: "Light mobility and hydration support standard recovery between sessions.",
    citation: "ACSM; sports medicine consensus on active recovery.",
    applicability: "Recovery recommendation rule after workout completion.",
  },
  {
    id: "sleep-duration-adults",
    domain: "sleep",
    title: "Adult sleep duration",
    summary: "7–9 hours per night recommended for most adults for health and recovery.",
    citation: "National Sleep Foundation; AASM sleep duration recommendations.",
    applicability: "Future Sleep Engine (planned).",
  },
  {
    id: "activity-pal-heuristic",
    domain: "activity",
    title: "Physical activity level multipliers",
    summary: "PAL factors applied to BMR estimate daily energy expenditure by activity category.",
    citation: "FAO/WHO/UNU human energy requirements; common fitness app PAL tables.",
    applicability: "Activity multipliers in Calories Engine.",
  },
];

export const EVIDENCE_BY_ID: Record<string, EvidenceEntry> = Object.fromEntries(
  EVIDENCE_CATALOG.map((e) => [e.id, e]),
);

export const FORMULA_REGISTRY: FormulaDefinition[] = [
  {
    id: "bmr-mifflin-st-jeor",
    domain: "energyExpenditure",
    name: "Basal Metabolic Rate",
    expression: "10×kg + 6.25×cm − 5×age ± sex constant",
    description: "Estimated resting energy expenditure before activity.",
    evidenceIds: ["mifflin-st-jeor-1990"],
  },
  {
    id: "tdee-pal",
    domain: "energyExpenditure",
    name: "Total Daily Energy Expenditure",
    expression: "BMR × activity multiplier",
    description: "Estimated maintenance calories before goal adjustment.",
    evidenceIds: ["mifflin-st-jeor-1990", "activity-pal-heuristic"],
  },
  {
    id: "protein-g-per-kg",
    domain: "protein",
    name: "Daily protein target",
    expression: "body weight (kg) × g/kg coefficient",
    description: "Goal-adjusted protein to support muscle and satiety.",
    evidenceIds: ["issn-protein-2017"],
  },
  {
    id: "water-ml-per-kg",
    domain: "hydration",
    name: "Daily water target",
    expression: "35 ml × kg (minimum 2.0 L)",
    description: "Planning heuristic for fluid intake.",
    evidenceIds: ["efsa-water-2010"],
  },
];

export const GUIDELINE_REGISTRY: GuidelineRule[] = [
  {
    id: "activity-sedentary",
    domain: "activity",
    name: "Mostly sedentary",
    rule: "PAL 1.2",
    rationale: "Little structured exercise; desk-based day.",
    evidenceIds: ["activity-pal-heuristic"],
  },
  {
    id: "activity-moderate",
    domain: "activity",
    name: "Moderately active",
    rule: "PAL 1.55",
    rationale: "Exercise 3–5 days per week.",
    evidenceIds: ["activity-pal-heuristic"],
  },
  {
    id: "protein-fat-loss",
    domain: "protein",
    name: "Protein during fat loss",
    rule: "1.8 g/kg",
    rationale: "Higher end supports lean mass retention in deficit.",
    evidenceIds: ["issn-protein-2017"],
  },
];

/** Domains actively used vs planned for expansion tracking. */
export const SCIENCE_DOMAINS: Record<
  ScienceDomain,
  { status: "active" | "planned"; description: string }
> = {
  nutrition: { status: "active", description: "Meal logging and macro aggregation." },
  calories: { status: "active", description: "Energy targets and deficits/surpluses." },
  protein: { status: "active", description: "Protein targets by goal." },
  carbohydrates: { status: "active", description: "Carb allocation after protein and fat." },
  fats: { status: "active", description: "Fat targets from AMDR heuristic." },
  fibre: { status: "active", description: "Fibre density per 1000 kcal." },
  hydration: { status: "active", description: "Daily fluid targets." },
  exercise: { status: "active", description: "Session templates and exercise metadata." },
  recovery: { status: "active", description: "Post-session recovery rules." },
  sleep: { status: "planned", description: "Sleep duration/quality modifiers." },
  activity: { status: "active", description: "PAL multipliers and activity labels." },
  bodyComposition: { status: "planned", description: "Weight trend and composition heuristics." },
  energyExpenditure: { status: "active", description: "BMR and TDEE estimation." },
  healthGuidance: { status: "planned", description: "Condition-aware constraints." },
};

/** Legacy string keys for BrainExplanation.references */
export const SCIENCE_REFERENCES = {
  MIFFLIN_ST_JEOR_1990: EVIDENCE_BY_ID["mifflin-st-jeor-1990"].citation,
  ISSN_PROTEIN_2017: EVIDENCE_BY_ID["issn-protein-2017"].citation,
  AMDR_FAT: EVIDENCE_BY_ID["amdr-fat"].citation,
  FIBRE_PER_1000_KCAL: EVIDENCE_BY_ID["fibre-per-1000-kcal"].citation,
  EFSA_WATER: EVIDENCE_BY_ID["efsa-water-2010"].citation,
  SAFE_WEIGHT_LOSS_RATE: EVIDENCE_BY_ID["safe-weight-loss-rate"].citation,
} as const;

export type ScienceReferenceKey = keyof typeof SCIENCE_REFERENCES;
