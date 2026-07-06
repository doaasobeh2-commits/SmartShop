# Invisible Household Intelligence

## Golden Principle

**Hide complexity inside the intelligence. Keep the interface simple.**

Users should feel that the application naturally understands the household — without questionnaires about cuisine, ingredients, cooking style, or food personality.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  SmartShop UI          Recipe AI UI         Fitness AI UI       │
│  (simple)              (simple)             (simple)          │
└────────────┬──────────────────┬──────────────────┬────────────┘
             │ behavioral       │ behavioral       │ behavioral
             │ signals          │ signals          │ signals
             ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│              Household Intelligence Engine (HIE)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │ Signal       │  │ Inference    │  │ Hypothesis Store     │ │
│  │ Ingestion    │→ │ Pipeline     │→ │ (confidence-based)   │ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
│         ▲                                    │                  │
│         │                                    ▼                  │
│  ┌──────────────┐              ┌──────────────────────────────┐ │
│  │ Memory       │              │ Derived Preference View      │ │
│  │ Knowledge    │              │ (engines only — never UI)    │ │
│  └──────────────┘              └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Core Concepts

### Behavioral Signals (inputs)

Raw observations from user behavior. Never shown to users.

| Category | Source | Example |
|----------|--------|---------|
| `purchase` | SmartShop trip | Bought olive oil, labneh, za'atar |
| `ingredient_repeat` | Memory aggregation | Chickpeas purchased 4× in 30 days |
| `locale_context` | System | Country: AT, Language: de, City: St. Pölten |
| `recipe_accepted` | Recipe AI | User saved a Turkish lentil soup |
| `recipe_rejected` | Recipe AI | User dismissed pasta carbonara |
| `meal_cooked` | Recipe AI | Cooked shakshuka twice this week |

Signals live in `core/src/intelligence/signals/`.

### Hypotheses (internal beliefs)

Confidence-based beliefs — **never facts**, **never exposed in UI**.

```typescript
{
  domain: "cuisine_affinity",
  label: "levantine_cuisine",
  confidence: 0.87,
  status: "active",
  evidenceCount: 12,
}
```

Hypotheses decay when not reinforced. They adapt as household behavior changes.

Stored in `smartshop.hypotheses` (local) / future cloud sync.

### Inference Pipeline

Rule-based v1 inference in `core/src/intelligence/inference/`:

- Purchase keywords → cuisine affinity (olive oil + labneh → Levantine)
- Locale boosts (DE + TR language → Turkish + German cuisine affinity)
- Dietary tendency from ingredient patterns (tofu, lentils → vegetarian tendency)

Runs automatically after each completed shopping trip via `TripCompletionPipeline`.

## What We Do NOT Ask Users

- Favorite cuisine
- Favorite ingredients
- Preferred meals
- Cooking style
- Food personality

These are inferred from shopping history, meal history, recipe acceptance, seasonal and budget behavior, family size, preferred stores, and locale.

## Platform Integration

### SmartShop (implemented)

1. User completes shopping trip
2. `processTripCompletion()` updates memory + knowledge
3. Purchase signals extracted from trip lines
4. Locale context signals from household city/country/language
5. `runInferencePipeline()` updates hypothesis store

### Recipe AI (signal foundation — ready for app integration)

Recipe AI will contribute behavioral signals through `RecipeAiIntelligenceService` once the app is designed and built:

| Action | Signal category | Effect |
|--------|-----------------|--------|
| User saves a recipe | `recipe_accepted` | Reinforces cuisine affinity hypotheses |
| User dismisses a recipe | `recipe_rejected` | Weakens matching cuisine hypotheses |
| User cooks a meal | `meal_cooked` | Stronger cuisine reinforcement |

```typescript
import { recordRecipeAccepted, recordMealCooked } from "../services/intelligenceService";

await recordRecipeAccepted({
  recipeId: "rec-001",
  recipeName: "Mercimek Çorbası",
  cuisineTags: ["turkish"],
});
```

No Recipe AI UI ships until Figma design is approved. Implementation resumes from `RecipeAI/docs/V1_PRODUCT_BLUEPRINT.md`.

### Recipe AI / Fitness AI (future apps)

Use `ecosystem/src/intelligence/PlatformIntelligenceBridge` to contribute signals and read hypotheses.

### Engine consumption

Engines use `buildDerivedPreferenceView()` — a read-only projection. Never render hypothesis labels or confidence scores to users.

## Deprecated Fields

`HouseholdSetupSnapshot.shoppingPreferences` is deprecated. Profile UI no longer collects shopping preferences.

## File Map

| Path | Role |
|------|------|
| `core/src/intelligence/signals/` | Signal types and extractors |
| `core/src/intelligence/hypotheses/` | Hypothesis model and mutations |
| `core/src/intelligence/inference/` | Inference pipeline and rules |
| `core/src/intelligence/projections/` | Engine-facing read projections |
| `core/src/intelligence/HouseholdIntelligenceEngine.ts` | HIE contracts |
| `core/src/services/TripCompletionPipeline.ts` | Trip → signals → hypotheses |
| `ecosystem/src/intelligence/PlatformIntelligenceBridge.ts` | Cross-app bridge |
| `apps/smart-shop/src/state/localStore.ts` | `smartshop.hypotheses` persistence |
