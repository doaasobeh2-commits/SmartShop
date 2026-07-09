# Fitness Brain

> **Platform principles:** [`../../../philosophy/PRINCIPLES.md`](../../../philosophy/PRINCIPLES.md) · [`../../../ai/PRINCIPLES.md`](../../../ai/PRINCIPLES.md)  
> **Product direction:** [`../../../products/fitnessai.md`](../../../products/fitnessai.md)  
> This file is the **implementation spec** for Fitness Brain. Ecosystem philosophy is canonical in Fadi-Core-Platform.

**FITNESS BRAIN** is the scientific decision engine of FitnessAI. It is **not AI** — it is a modular, rule-based system that produces explainable targets and recommendations.

The UI is presentation only. All calculations flow through the Brain.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     UI (presentation)                    │
└───────────────────────────┬─────────────────────────────┘
                            │ services (thin)
┌───────────────────────────▼─────────────────────────────┐
│                   FITNESS BRAIN                          │
│         engines · rules · fitnessBrain.ts                │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│            SCIENTIFIC KNOWLEDGE BASE                     │
│  evidence/ · formulas/ · guidelines/ · trees/            │
│  + food & exercise catalogs                              │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│                   USER DATA                              │
│         profile · meals · workouts · hydration           │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│              FUTURE AI (communication only)              │
└─────────────────────────────────────────────────────────┘
```

**Build order:** Knowledge Base → Brain engines → User data wiring → UI last.  
See **`docs/DEVELOPMENT_PRINCIPLE.md`**.

**Location:** `apps/fitness-ai/src/brain/`

---

## Engines

| Engine | Responsibility |
|--------|----------------|
| **Profile** | Validates baseline inputs (age, weight, height, activity) |
| **Goal** | Goal-specific energy and protein coefficients |
| **Calories** | BMR (Mifflin–St Jeor) → TDEE → daily kcal target |
| **Nutrition** | Macro targets (protein, fat, carbs, fibre) |
| **Food Knowledge** | Structured foods, servings, macro/micro per 100 g |
| **Workout** | Exercise catalog, templates, session assembly |
| **Habit** | Hydration targets, streak insights |
| **Recommendation** | Rule-based insights (never random) |

Each engine returns `Explainable<T>` where reasoning must be shown on demand.

---

## Scientific foundation

| Calculation | Formula / source |
|-------------|------------------|
| BMR | Mifflin–St Jeor (1990) |
| TDEE | BMR × activity multiplier |
| Fat loss adjustment | −500 kcal/day (~0.5 kg/week) |
| Protein | g/kg by goal (ISSN bands) |
| Fat | ~28% of kcal (AMDR heuristic) |
| Carbs | Remaining kcal ÷ 4 |
| Fibre | 14 g / 1000 kcal |
| Water | 35 ml/kg (min 2 L) |

References: `brain/knowledge/science/evidence/catalog.ts` · `FORMULA_REGISTRY`

---

## Knowledge layers

### Food (`brain/knowledge/foods/`)

Structured `FoodItem`: macros, optional micros, default serving, tags.  
Used for portion math and meal suggestions.

### Exercises (`brain/knowledge/exercises/`)

Structured `ExerciseItem`: muscles, equipment, difficulty, type, sets/reps.  
`WorkoutTemplate` groups exercises into sessions.

---

## Recommendation rules

Recommendations are produced by `recommendationEngine` from explicit rules, e.g.:

- Protein remaining in the evening → protein-focused dinner
- Calories near limit → nutrient-dense guidance
- Hydration below 50% after noon → water reminder
- Workout incomplete → today's session prompt
- Workout complete → recovery stretch rule

Every recommendation includes `ruleId` + `BrainExplanation`.

---

## AI boundary

| Layer | Responsibility |
|-------|----------------|
| **Fitness Brain** | All numbers, targets, rules, recommendations |
| **AI (future)** | Explain · motivate · educate · personalise **copy only** |

See `src/ai/config.ts`. AI must never replace Brain calculations.

---

## Usage

```typescript
import { fitnessBrain } from "./brain";
import { getBrainInput } from "./data/repositories/mockRepositories";

const input = await getBrainInput();
const plan = fitnessBrain.composeDailyPlan(input);      // → DailyPlan for UI
const snapshot = fitnessBrain.analyze(input);           // full trace
const recs = fitnessBrain.getRecommendations(input);      // all rules fired
const why = fitnessBrain.getExplanation(input, "calories");
```

---

## Growth path

1. Replace mock repositories with persisted logs (meals, water, workout state).
2. Expand food/exercise catalogs or import datasets.
3. Add future engines (sleep, recovery) without changing tab structure.
4. Optional AI layer rephrases `BrainExplanation` for the user — never edits targets.

---

*Trust comes from transparent logic. The app should feel intelligent with zero ML connected.*
