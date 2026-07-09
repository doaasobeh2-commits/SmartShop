# Household Intelligence

The ecosystem's learning layer. **Not a UI. Not chatbot AI.**

## HIE overview

Household Intelligence Engine coordinates: family context, shopping, offers, inventory, consumption, budget, nutrition, learning, decisions.

| Engine | Role |
|--------|------|
| Family | Members, pets, location |
| Shopping | Rule basket (free) · AI basket (premium) |
| Offer | Local discovery, ranking |
| Inventory | Hidden stock, deductions |
| Consumption / Budget / Nutrition / Learning / Decision | Premium orchestration |

**Free tier:** rule-based shopping only. **Premium:** full orchestration + cross-app AI.

## Signal → inference → hypothesis

**Signals** (never shown): purchases, ingredient repeats, locale, recipe accepted/rejected, meal cooked.

**Inference** (rule-based v1): purchase keywords → cuisine affinity; locale boosts; dietary patterns.

**Hypotheses** (never in UI): confidence-based beliefs that decay without reinforcement.

**Derived Preference View:** engines read only — never render labels or scores.

Trip completion triggers: memory → signals → inference → hypothesis update.

## Hidden inventory

- Purchases feed private per-family inventory
- RecipeAI meal selection deducts ingredients (when bridge wired)
- Surface only: "running low" (≤3) and have/need on recipes
- **No pantry UI in v1** (ADR-0006)
- One-tap correction when wrong — platform requirement, not built

## Timeline & behaviour (no UI)

Household timeline logs: purchases, trips, meals cooked, inventory adjustments, offers, waste. Behaviour engine learns shopping day, favourite stores, forgotten products — from timeline, never shown directly.

## Code

`apps/Smart Shop/core/src/intelligence/` · `TripCompletionPipeline.ts` · `PlatformIntelligenceBridge.ts`
