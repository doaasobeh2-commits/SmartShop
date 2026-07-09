/**
 * Canonical scientific source registry for Fitness Brain rule-based calculations.
 * Every important constant or formula in knowledge modules should reference an ID here.
 * No AI-generated values — expand only from published guidelines and databases.
 */

export type ScientificSource = {
  id: string;
  name: string;
  /** Short citation suitable for explainability cards. */
  citation: string;
  /** Official documentation or publication URL when available. */
  url?: string;
  /** Dataset release, publication year, or guideline version. */
  versionOrDate?: string;
  /** How this source is used inside Fitness Brain. */
  usedFor: string;
};

/** Trusted sources referenced by metabolism, nutrition, activity, food, and recovery rules. */
export const SCIENTIFIC_SOURCES: ScientificSource[] = [
  {
    id: "mifflin-st-jeor-1990",
    name: "Mifflin–St Jeor equation",
    citation: "Mifflin MD, St Jeor ST, Hill LA, et al. A new predictive equation for resting energy expenditure in healthy individuals. Am J Clin Nutr. 1990;51(2):241-247.",
    url: "https://pubmed.ncbi.nlm.nih.gov/2305711/",
    versionOrDate: "1990",
    usedFor: "BMR / resting metabolism in metabolismEngine (10×kg + 6.25×cm − 5×age + sex offset).",
  },
  {
    id: "fao-who-pal-2001",
    name: "FAO/WHO/UNU human energy requirements — physical activity level",
    citation: "FAO/WHO/UNU Expert Consultation. Human energy requirements. Rome: FAO; 2001.",
    url: "https://www.fao.org/3/y5689e/y5689e00.htm",
    versionOrDate: "2001",
    usedFor: "PAL multipliers applied to BMR for TDEE (sedentary 1.2 through very active ~1.9).",
  },
  {
    id: "issn-protein-2017",
    name: "ISSN position stand — protein and exercise",
    citation: "Jäger R, Kerksick CM, Campbell BI, et al. International Society of Sports Nutrition position stand: protein and exercise. J Int Soc Sports Nutr. 2017;14:20.",
    url: "https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0177-8",
    versionOrDate: "2017",
    usedFor: "Protein targets 1.6–2.0 g/kg by goal in nutritionEngine.",
  },
  {
    id: "efsa-water-2010",
    name: "EFSA dietary reference values — water",
    citation: "EFSA Panel on Dietetic Products, Nutrition and Allergies. Scientific Opinion on Dietary Reference Values for water. EFSA Journal. 2010;8(3):1459.",
    url: "https://www.efsa.europa.eu/en/efsajournal/pub/1459",
    versionOrDate: "2010",
    usedFor: "Hydration planning heuristic (35 ml/kg, minimum 2.0 L) aligned with adequate intake principles.",
  },
  {
    id: "iom-amdr-fat-2005",
    name: "Institute of Medicine — Acceptable Macronutrient Distribution Range (fat)",
    citation: "Institute of Medicine. Dietary Reference Intakes for Energy, Carbohydrate, Fiber, Fat, Fatty Acids, Cholesterol, Protein, and Amino Acids. Washington, DC: National Academies Press; 2005.",
    url: "https://nap.nationalacademies.org/catalog/10490",
    versionOrDate: "2005",
    usedFor: "Fat target ~28% of daily calories (within 20–35% AMDR) in nutritionEngine.",
  },
  {
    id: "usda-dga-fibre",
    name: "USDA/HHS Dietary Guidelines — dietary fibre density",
    citation: "U.S. Department of Agriculture and U.S. Department of Health and Human Services. Dietary Guidelines for Americans.",
    url: "https://www.dietaryguidelines.gov/",
    versionOrDate: "2020-2025 edition",
    usedFor: "Fibre target 14 g per 1000 kcal in nutritionEngine.",
  },
  {
    id: "nice-weight-loss-deficit",
    name: "NICE / ACSM — moderate energy deficit for fat loss",
    citation: "NICE CG43 Obesity; ACSM position stands on weight management (~500 kcal/day deficit for ~0.5 kg/week).",
    url: "https://www.nice.org.uk/guidance/cg43",
    versionOrDate: "NICE CG43",
    usedFor: "Goal-adjusted calorie target −500 kcal below TDEE for fat_loss.",
  },
  {
    id: "issn-muscle-gain-surplus",
    name: "Sports nutrition consensus — lean mass gain surplus",
    citation: "Helms ER, Aragon AA, Fitschen PJ. Evidence-based recommendations for natural bodybuilding contest preparation. J Int Soc Sports Nutr. 2014;11:20.",
    url: "https://jissn.biomedcentral.com/articles/10.1186/1550-2783-11-20",
    versionOrDate: "2014",
    usedFor: "Goal-adjusted calorie target +300 kcal above TDEE for muscle_gain (conservative surplus).",
  },
  {
    id: "who-min-energy-intake",
    name: "WHO / public health — minimum planning calorie floor",
    citation: "General public-health practice: avoid very low calorie targets in non-clinical fitness apps; 1200 kcal commonly cited as planning floor for adult women.",
    url: "https://www.who.int/news-room/fact-sheets/detail/healthy-diet",
    versionOrDate: "general guidance",
    usedFor: "Minimum dailyCalorieTarget 1200 kcal in metabolismEngine.",
  },
  {
    id: "compendium-met-2011",
    name: "Compendium of Physical Activities",
    citation: "Ainsworth BE, et al. 2011 Compendium of Physical Activities: a second update of codes and MET values. Med Sci Sports Exerc. 2011;43(8):1575-1581.",
    url: "https://pacompendium.com/",
    versionOrDate: "2011 update",
    usedFor: "MET ranges per sport/activity in activityLibrary and activityLogEngine calorie estimation.",
  },
  {
    id: "compendium-met-formula",
    name: "Compendium energy expenditure formula",
    citation: "Energy (kcal) = MET × body mass (kg) × duration (h). Documented in Compendium of Physical Activities user guide.",
    url: "https://pacompendium.com/met-compendium",
    versionOrDate: "2011",
    usedFor: "estimatedCalories in activityLogEngine: MET × weightKg × (minutes/60).",
  },
  {
    id: "acsm-hydration-exercise",
    name: "ACSM — fluid replacement for active individuals",
    citation: "American College of Sports Medicine. Exercise and fluid replacement. Med Sci Sports Exerc. 2007;39(2):377-390.",
    url: "https://journals.lww.com/acsm-msse/fulltext/2007/02000/exercise_and_fluid_replacement.22.aspx",
    versionOrDate: "2007",
    usedFor: "Hydration priority after endurance/team sports in activity requirement engines.",
  },
  {
    id: "acsm-endurance-fueling",
    name: "ACSM / ISSN — carbohydrate availability for endurance",
    citation: "Thomas DT, Erdman KA, Burke LM. American College of Sports Medicine Joint Position Statement: nutrition and athletic performance. Med Sci Sports Exerc. 2016;48(3):543-568.",
    url: "https://journals.lww.com/acsm-msse/fulltext/2016/03000/nutrition_and_athletic_performance.25.aspx",
    versionOrDate: "2016",
    usedFor: "Carb-focused fuelling for sessions ≥45 min in activityFuelingEngine.",
  },
  {
    id: "usda-fdc",
    name: "USDA FoodData Central",
    citation: "U.S. Department of Agriculture, Agricultural Research Service. FoodData Central.",
    url: "https://fdc.nal.usda.gov/",
    versionOrDate: "SR Legacy / Foundation Foods (see FOOD_DATASET_RELEASE in foodSources)",
    usedFor: "Per-100g macro and micronutrient values for logged meals via foodKnowledge adapters.",
  },
  {
    id: "aasm-sleep-duration",
    name: "AASM / National Sleep Foundation — adult sleep duration",
    citation: "Watson NF, et al. Recommended amount of sleep for a healthy adult. J Clin Sleep Med. 2015;11(6):591-592.",
    url: "https://aasm.org/resources/pdf/pressroom/adult-sleep-duration-consensus.pdf",
    versionOrDate: "2015",
    usedFor: "Recovery score sleep thresholds (<6 h poor, ≥7 h good) in recoveryRules.",
  },
  {
    id: "acsm-recovery-training",
    name: "ACSM — recovery between training sessions",
    citation: "American College of Sports Medicine. Guidelines for Exercise Testing and Prescription. 11th ed.",
    url: "https://www.acsm.org/education-resources/books/guidelines-exercise-testing-prescription",
    versionOrDate: "11th ed.",
    usedFor: "Consecutive training day penalties and overtraining risk heuristics in recoveryEngine.",
  },
  {
    id: "acsm-exercise-prescription",
    name: "ACSM — exercise prescription for healthy adults",
    citation: "American College of Sports Medicine. Guidelines for Exercise Testing and Prescription. 11th ed.",
    url: "https://www.acsm.org/education-resources/books/guidelines-exercise-testing-prescription",
    versionOrDate: "11th ed.",
    usedFor: "Training frequency, rest days, and session templates in trainingEngine.",
  },
  {
    id: "fitness-safety-boundary",
    name: "Fitness Brain non-clinical safety boundary",
    citation: "Product policy: general fitness and wellness guidance only — not medical advice, diagnosis, or treatment.",
    usedFor: "All SAFETY_RULES and general-fitness disclaimers.",
  },
  {
    id: "product-decision-heuristics",
    name: "Fitness Brain decision thresholds (product heuristics)",
    citation: "Internal rule-based thresholds for daily action prioritisation — not clinical prescriptions.",
    usedFor: "Hour cutoffs and progress percentages in dailyDecisionEngine (DECISION_VALUES, NUTRITION_VALUES thresholds).",
  },
];

export const SCIENTIFIC_SOURCES_BY_ID: Record<string, ScientificSource> = Object.fromEntries(
  SCIENTIFIC_SOURCES.map((s) => [s.id, s]),
);

export function getScientificSource(id: string): ScientificSource | undefined {
  return SCIENTIFIC_SOURCES_BY_ID[id];
}

/** Formula registry — links engine calculations to source IDs. */
export type FormulaRegistryEntry = {
  id: string;
  name: string;
  expression: string;
  engine: string;
  sourceIds: string[];
};

export const FORMULA_REGISTRY: FormulaRegistryEntry[] = [
  {
    id: "bmr-mifflin-st-jeor",
    name: "Basal metabolic rate (BMR)",
    expression: "10×weight(kg) + 6.25×height(cm) − 5×age + genderOffset",
    engine: "metabolismEngine",
    sourceIds: ["mifflin-st-jeor-1990"],
  },
  {
    id: "tdee-pal",
    name: "Total daily energy expenditure (TDEE)",
    expression: "BMR × activityLevelMultiplier",
    engine: "metabolismEngine",
    sourceIds: ["mifflin-st-jeor-1990", "fao-who-pal-2001"],
  },
  {
    id: "goal-calorie-target",
    name: "Goal-adjusted daily calorie target",
    expression: "max(TDEE + goalAdjustment, minDailyKcal)",
    engine: "metabolismEngine",
    sourceIds: ["nice-weight-loss-deficit", "issn-muscle-gain-surplus", "who-min-energy-intake"],
  },
  {
    id: "protein-target",
    name: "Daily protein target",
    expression: "weight(kg) × gPerKg(goal)",
    engine: "nutritionEngine",
    sourceIds: ["issn-protein-2017"],
  },
  {
    id: "fat-target",
    name: "Daily fat target",
    expression: "(dailyKcal × fatKcalPercent) / 9",
    engine: "nutritionEngine",
    sourceIds: ["iom-amdr-fat-2005"],
  },
  {
    id: "carb-target",
    name: "Daily carbohydrate target",
    expression: "(dailyKcal − protein×4 − fat×9) / 4",
    engine: "nutritionEngine",
    sourceIds: ["iom-amdr-fat-2005", "issn-protein-2017"],
  },
  {
    id: "hydration-target",
    name: "Daily hydration target",
    expression: "max(weight(kg) × 35 ml/kg / 1000, 2.0 L)",
    engine: "nutritionEngine",
    sourceIds: ["efsa-water-2010"],
  },
  {
    id: "fibre-target",
    name: "Daily fibre target",
    expression: "(dailyKcal / 1000) × 14 g",
    engine: "nutritionEngine",
    sourceIds: ["usda-dga-fibre"],
  },
  {
    id: "activity-calories-met",
    name: "Activity energy expenditure",
    expression: "MET × weight(kg) × duration(h)",
    engine: "activityLogEngine",
    sourceIds: ["compendium-met-2011", "compendium-met-formula"],
  },
  {
    id: "recovery-score",
    name: "Recovery readiness score",
    expression: "baseline + sleep/adherence/training-day adjustments (0–100)",
    engine: "recoveryEngine",
    sourceIds: ["aasm-sleep-duration", "acsm-recovery-training", "product-decision-heuristics"],
  },
];

export const FORMULA_REGISTRY_BY_ID: Record<string, FormulaRegistryEntry> = Object.fromEntries(
  FORMULA_REGISTRY.map((f) => [f.id, f]),
);
