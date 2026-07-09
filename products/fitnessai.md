# FitnessAI

**Role:** Body lens · **Maturity:** alpha · **Path:** `apps/FitnessAI/`

## One question

**Today:** What matters today?

## Core loop

Today → log (eat/train) → Fitness Brain adapts → optional inline "why"

## Screens

| Screen | Question | Status |
|--------|----------|--------|
| Today | What matters today? | **Redesign** — one card, one metric, one action |
| Eat | What did I eat? | **Redesign** — kill macro grid |
| Train | What am I training? | **Redesign** — session only, drop parallel activity log |
| Coach | Why today? | **Remove tab** → inline on Today |
| You | Who am I? | Strip brain completeness % |
| Onboarding | Personalize? | **Reduce** to 2 steps |

## Brain

Rule-based Fitness Brain — **not AI.** Full implementation spec:

`apps/FitnessAI/docs/FITNESS_BRAIN.md`  
Runtime: `apps/fitness-ai/src/fitnessBrain/`

## Integration

Isolated from HIE today. Future: household restrictions from SmartShop; meals from RecipeAI.

## Packages

`@fitness-ai/app` · `core` · `shared`

## Figma next

Today · Eat · Train · Welcome — before further UI development.
