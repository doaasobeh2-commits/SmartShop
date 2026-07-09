# Ecosystem Principles

The constitution of the Fadi household platform. All applications must follow this document.

## North star

**One household, understood quietly** — shopping, meals, and health handled with invisible intelligence so daily life takes less thinking, not more administration.

Three independent apps are **lenses** on one household:

| Lens | Job |
|------|-----|
| SmartShop | What to buy — household hub |
| RecipeAI | What to cook tonight |
| FitnessAI | What matters for your body today |

## Ten non-negotiable principles

1. **Simplicity before complexity** — minimal surface; depth is earned
2. **Daily usefulness first** — if it does not help *today*, defer it
3. **Invisible intelligence** — outcomes visible; engines, scores, hypotheses hidden
4. **One question per screen** — declare it before building
5. **Behavior over forms** — infer taste, habits, activity from actions; ask only for safety and cold-start
6. **Reduce thinking** — fewer taps, forms, and admin burden
7. **Deterministic before AI** — rules ship first; AI explains later, never decides
8. **No chat-as-product** — guidance is cards and inline "why," not conversation
9. **Household coherence** — SmartShop owns the graph; satellites consume via bridges
10. **Quality over quantity** — improve existing screens before adding features

## Invisible intelligence

Hide complexity inside the intelligence. Keep the interface simple.

Users should feel the system understands the household — **without** questionnaires about cuisine, ingredients, cooking style, or food personality.

```
App UIs (simple) → behavioral signals → HIE → hypotheses (never in UI)
                                              → Derived Preference View (engines only)
```

**Never ask:** favorite cuisine, ingredients, cooking style, food personality.  
**Infer from:** shopping trips, recipe accept/reject, meals cooked, locale, budget behavior.

## One question per screen

| App | Home question |
|-----|---------------|
| SmartShop | What matters today? |
| FitnessAI | What matters today? |
| RecipeAI | What should we cook tonight? |

Before any screen ships: state its one question. If you cannot, split or cut.

## Anti-patterns — do not build

- Macro/calorie dashboards as home
- Long onboarding questionnaires
- AI chat as coach
- Analytics/progress tabs by default
- Feature grids · competitor pixel-copying
- Premium interrupting free daily loop
- Duplicate household profiles per app
- "AI" branding on deterministic free tier
- Brain completeness gamification
- Pantry management UI in v1
- Coach/Analytics as permanent tabs

## Feature review process

1. Study leaders — what do users *actually* love?
2. Extract one idea, not the whole product
3. Remove complexity users tolerate but do not enjoy
4. Redesign for one-question-per-screen
5. Validate: does it help daily life?

## Decision filter

> Does this reduce work for the user today, or add another thing to maintain?

## Competitive lens (summary)

Study MFP, WHOOP, Google Photos, Perplexity, Cursor — extract *why* users stay, never copy surfaces. Full critique: [`reviews/2026-07-ecosystem-architecture-critique.md`](../reviews/2026-07-ecosystem-architecture-critique.md).
