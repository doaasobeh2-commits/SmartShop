# ShareYum — Future Information Architecture

> Logic-only reference for the approved UX + household foundation pass.  
> Platform boundaries: FadiCore owns identity; ShareYum owns food domain.

## Ecosystem boundaries

| Layer | Owns |
|-------|------|
| **FadiCore** | Household identity, members, roles, invitations, permissions, shared identity context, preferred locale |
| **ShareYum** | Food safety/preferences, cuisine affinity, recipes, meal decisions, cooking history, feedback, meal participation, serving decisions |
| **ShareCart** (future) | Pantry/inventory, basket, stores, offers, shopping optimization |
| **ShareFit** (future) | Health/fitness goals, nutritional requirements |

Do not duplicate household members between apps. Satellites consume FadiCore household context via bridges.

## Household membership ≠ meal participation

### A. Household membership (FadiCore)

Long-lived identity:

- owner, adults, teens, children, caregivers
- invitations, permissions, claim flows

Managed profiles (this pass): `child`, `teen`, `caregiver` only.  
Adult/spouse joining remains invitation/claim-based — deferred from onboarding UI.

### B. Meal participation (ShareYum — future)

Temporary, per meal:

> “Who is eating tonight?”

Example: Tonight — 4 people → Fadi, Partner, Ahmad, Sara.  
If one person is away, recipe quantities derive from **participating eaters**, not a static `familySize`.

**Not implemented in this pass.** Architecture must not lock to a single static headcount.

## Member food profiles (ShareYum — future)

```
FadiCore memberId
  → ShareYum MemberFoodProfile
      → allergies
      → dietary restrictions
      → cuisine/taste affinity
      → dislikes
      → food feedback/preferences
```

- Member-level food profiles belong to ShareYum, keyed to FadiCore `memberId`.
- Do not put food-domain data into FadiCore unnecessarily.
- **This pass:** household-level allergy onboarding only. No fake member-level safety.

When implemented: if any participating eater has a safety restriction, that restriction must constrain the meal decision.

## Meal decision engine (ShareYum — future)

> **Deep intelligence principles:** [`FUTURE_FOOD_INTELLIGENCE.md`](FUTURE_FOOD_INTELLIGENCE.md) — simple UX, culinary compatibility, adaptation levels, anti-stereotyping, feedback granularity.

ShareYum is a **Household Meal Decision Engine**, not primarily a recipe browser.

Conceptual decision order:

1. **SAFETY** — household/member constraints
2. **WHO IS EATING** — meal participation
3. Meal intent/context
4. Cuisine affinity
5. Time
6. Budget
7. Inventory/availability
8. Cooking skill
9. Cooking history
10. Feedback
11. Variety/repetition
12. Final recommendation

### Meal intents (future)

- economical, healthy, quick, everyday family meal, comfort food
- premium/luxury, guests, celebration, special occasion
- chosen cuisine, flexible/open budget

Example: “Guests Saturday — impressive even if it costs more” changes scoring (presentation, occasion quality, guest count, premium ingredients, make-ahead, reduced failure risk). This is **not** a normal weekday dinner.

## Guest / cultural hosting context (future)

Part of the same decision engine — **not** a separate app or nationality engine.

The engine may consider:

- guest count, explicitly selected guest cuisine/preferences
- known allergies/dietary restrictions, occasion type
- host cooking skill, recipe difficulty, time, budget
- ingredient availability, make-ahead, presentation
- authenticity vs ease of execution

**Critical rule:** Never infer food preference from nationality or ethnicity.  
The user may explicitly specify cuisine, guest preferences, dietary needs, or “Help me choose.”

Goal: “Help me successfully host this meal” — not “Here are Arab recipes.”

## My Kitchen / My Recipes (future)

**My Kitchen / مطبخي** — cooking history, family favorites, saved recipes, household food memory, personal recipes.

**My Recipes / وصفاتي** — create own recipe, photos, ingredients, steps, private saving, optional publishing when capability enabled.

**Not activated in this pass.**

## Community / creator / selling — keep separate

Future concepts are distinct products with different legal, safety, moderation, payment, and permission models:

- Recipe publishing ≠ cooking teaching ≠ selling prepared food ≠ marketplace

**Not implemented in this pass.**

## Premium / capabilities / entitlements (future)

Centralized capability states: `hidden` → `visible/locked` → `enabled`.

Possible capabilities:

- `advanced_weekly_planning`, `family_food_memory`, `my_kitchen`, `my_recipes`
- `premium_recipe_intelligence`, `creator_tools`, `community_publishing`

Do not scatter `if (isPremium)` through React components.  
**Unfinished features remain hidden** — no empty navigation, no “Coming Soon” pages.

## Current pass (implemented)

1. Visual cuisine cards (2-column, food-forward, no flags)
2. Restrained onboarding food/kitchen imagery
3. “Who are we cooking for?” via FadiCore member APIs
4. Onboarding state/i18n wiring (`householdMembersComplete` flag only — no member duplication in localStorage)
5. This document

## Personalization truth (current)

| Data | Collected | Consumed by engine |
|------|-----------|-------------------|
| `favoriteCuisines[]` | Yes (localStorage) | **No** — static `mockRecommendation` |
| `allergies[]` | Yes (localStorage) | **No** |
| `familySize` | Field exists | **No** |
| FadiCore members | Read in onboarding UI | **No** — not used for Tonight scoring |
| Weekday/recipe/ingredient text | English fixtures | Content layer, not UI i18n |

## Localization truth (current)

- **UI i18n:** Shell screens, onboarding, Tonight chrome — localized in `i18n/t.ts`.
- **Recipe/content:** `mockRecommendation`, `defaultWeekPlan`, ingredient names — English fixture data; belongs in future catalog/content layer, not hardcoded Arabic in React.

Remaining gaps to track: weekday names, recipe titles/descriptions, ingredient names in fixtures when UI locale is Arabic.

## Future intelligence flow

```
FadiCore household → members/context
  → ShareYum meal decision → recipe + quantities
  → ShareCart inventory / ingredients / offers

(later, with permission)
ShareFit requirements → ShareYum constraints/scoring
```

**Not implemented in this pass.**
