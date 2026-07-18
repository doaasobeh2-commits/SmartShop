# ShareYum (RecipeAI codebase) — Current State Audit

> **Audit date:** 2026-07-18  
> **Scope:** Read-only assessment of `apps/RecipeAI/` and related platform docs.  
> **Status:** Baseline before Phase A1. No product code changed during this audit.

---

## Approved decisions (locked)

| Decision | Detail |
|----------|--------|
| **Product working name** | **ShareYum** |
| **Legacy codebase name** | **Recipe AI** — may remain temporarily in package names, paths, and internal identifiers (`recipe-ai`, `@recipe-ai/*`, `apps/RecipeAI/`) until a controlled rename |
| **Visual direction** | **The Living Kitchen** — see [`MASTER_PRODUCT_VISION.md`](MASTER_PRODUCT_VISION.md) |
| **FadiCore scope** | Shared identity, household, membership, enrollment, permissions, and shared platform concerns **only** |
| **ShareYum domain scope** | Recommendation logic, recipes, scoring, meal planning, allergen logic, feedback intelligence, and food-domain algorithms **must live in ShareYum server-side/backend** — not in browser bundles, not inside FadiCore |
| **Legacy data files** | `worldKitchens.ts`, `cuisines.ts` — **do not remove or refactor yet**; mark as legacy / non-authoritative pending review |
| **Next phase** | **Phase A1** — ShareYum identity + onboarding/navigation cleanup **only** (not started; awaiting approval) |

### Phase A1 scope (planned, not approved to implement)

- Align user-facing identity to ShareYum where appropriate
- Fix onboarding/navigation wiring (e.g. Food Preferences reachability, flow order)
- **Out of scope for A1:** engine implementation, visual asset overhaul, FadiCore domain APIs, worldKitchens/cuisines refactor

---

## Executive summary

ShareYum (implemented in the `apps/RecipeAI/` monorepo) is an **alpha Vite + React SPA** with premium UI shells, **FadiCore auth/household integration**, and **hardcoded demo meal data**. The blueprint decision engines (`decideTonight`, allergen gate, KRS, SmartShop bridge) are **spec-only**. Visual backgrounds use **CSS gradient placeholders**; photography and Living Kitchen continuity are **not wired**. Several data modules exist but are **unused and non-authoritative**.

---

## Product / app name & branding

| Item | Current state |
|------|---------------|
| **Approved working name** | **ShareYum** |
| **UI title today** | "Recipe AI" (`WelcomeScreen`, `index.html`) |
| **ShareYum in repo** | Not present in code — rename pending (Phase A1) |
| **Package names** | `recipe-ai`, `@recipe-ai/app`, `@recipe-ai/core`, `@recipe-ai/shared` |
| **Folder path** | `apps/RecipeAI/` |
| **Registry** | `recipeai` · maturity `alpha` |

---

## Routes / screens & navigation flow

**Architecture:** Stack-based `FlowScreen` navigation (`useAppState`) + auth/household gates (`AuthContext`, `App.tsx`).

```text
[Anonymous]
  Welcome → Auth (login/register)

[Authenticated — gates]
  loading → error
  → no household → HouseholdOnboardingFlow
       (hub → create | discover → pending)
  → household but recipe not enrolled → RecipeNotEnabledScreen
  → ready → main flow

[Main flow — actual today]
  weekly-plan-opt-in → (Yes → weekly-plan | Not now → tonight)
  tonight ↔ recipe-preview ↔ cook-mode → feedback
  tonight → cook-with-what-i-have (secondary)
  tonight → weekly-plan (if opted in)

[NOT in active flow]
  food-preferences, language-location → App.tsx routes both to WeeklyPlanOptInScreen (miswire)
  ProfileSetupScreen, PreferencesPage → stubs, deferred
```

**Note:** `FoodPreferencesScreen` is built but **not reachable**. Post-auth flow skips allergy UI and goes to weekly-plan-opt-in.

---

## Implemented vs placeholder screens

| Screen | Status | Notes |
|--------|--------|-------|
| Welcome | Implemented | Gradient atmosphere; "Recipe AI" title |
| Auth | Implemented | FadiCore login/register |
| Household onboarding (4 sub-screens) | Implemented | Create/join/discover/pending |
| RecipeNotEnabled | Implemented | Enrollment gate |
| Weekly Plan opt-in | Implemented | Yes / Not now |
| Tonight | Implemented | Mock meal; `onNotTonight` no-op |
| Recipe Preview | Implemented | Mock inventory rows |
| Cook Mode | Implemented | Mock steps; dark gradient |
| Feedback | Implemented | Rating type not persisted |
| Weekly Plan | Implemented | Local list; Save → tonight |
| Cook With What I Have | UI shell | No search logic |
| Food Preferences | Built, not wired | Not in navigation |
| ProfileSetup / Preferences | Placeholder stubs | Deferred message only |

---

## Recipe / meal data sources

| Source | Location | Wired? | Authority |
|--------|----------|--------|-----------|
| Active meal | `mockRecommendation.ts` | **Yes** | Demo only |
| `data/recipes/recipes.ts` | 4 starter recipes | No | Legacy / non-authoritative |
| `data/cuisines/cuisines.ts` | 4 cuisines + colors/banners | No | **Legacy / non-authoritative — pending review** |
| `data/worldKitchens.ts` | 8 cuisine kitchens + dish paths | No | **Legacy / non-authoritative — pending review** |
| `data/onboarding/onboardingOptions.ts` | langs, countries, diets | No | Legacy / non-authoritative |
| FadiCore API | auth/household only | Partial | Platform identity only |
| Blueprint engines | `decideTonight()`, allergen, KRS | No | Spec in `V1_PRODUCT_BLUEPRINT.md` |

**Public assets:** No `public/` folder. Paths like `/assets/recipes/*`, `/backgrounds/cuisines/*` referenced in dead data only — files absent.

**Target architecture:** Food-domain data and algorithms on **ShareYum backend**; client consumes APIs. FadiCore does not own recipes or recommendations.

---

## Cuisines & recipe datasets (legacy, unused)

| Dataset | Contents |
|---------|----------|
| `cuisines.ts` | Arabic, Italian, Turkish, Austrian (+ per-cuisine colors, banners) |
| `recipes.ts` | Tabbouleh, Sarma, Wiener Schnitzel, Pasta Pomodoro |
| `worldKitchens.ts` | Arabic, Austrian, Turkish, Romanian, Mexican, Japanese, Healthy, Italian |

Active mock: one meal — "Lemon Herb Roast Chicken" (Mediterranean).

Vision target (~50 recipes × major cuisines) — not started in wired pipeline.

---

## Onboarding / preferences / allergies / dietary logic

| Area | Current |
|------|---------|
| Auth onboarding | FadiCore register → household create/join → recipe enrollment |
| Allergy UI | `FoodPreferencesScreen` exists — **not routed** |
| Allergy persistence | `preferences.allergies` in localStorage — toggle API exists, screen unreachable |
| Diet / cuisines / locale | Fields on `AppPreferences` — defaults only, no UI |
| Blueprint allergen gate | Spec only — **must ship ShareYum-side per approved decision** |
| FadiCore | No recipe profile; recipe profiles explicitly deferred in FadiCore Phase 4 |

---

## Tonight recommendation logic

**Not implemented.** `useAppState` uses static `mockRecommendation`. `onNotTonight` is empty. No KRS, swap, or server-side decision API.

**Gap:** `decideTonight()` and scoring belong on **ShareYum backend**, not client bundle.

---

## Weekly planning

| Aspect | Current |
|--------|---------|
| Opt-in | localStorage `weeklyPlanningEnabled` / `weeklyPlanOptInAsked` |
| Planner UI | 7-day editable text list (hardcoded defaults) |
| Save | Navigates to tonight — no API |
| Vision | Optional, non-linear branch — aligned in master vision |

---

## Cook With What I Have

UI only. `onFindMeal` returns to tonight with same mock meal. Search/ranking not implemented (future ShareYum backend).

---

## Cook Mode

Dark UI with step progress from mock data. No running timers, no Premium contextual assistant. Cook Mode visual direction (charcoal + texture + restrained blur) not implemented.

---

## Feedback / memory behavior

| Aspect | Current |
|--------|---------|
| UI | Loved it / It was good / Not for us |
| Storage | `feedbackGivenRecipeIds[]` in localStorage only |
| Rating value | Not stored by type (`void rating` in handler) |
| Re-ask rule | `shouldAskFeedback` computed but unused |
| Engine impact | None |
| Target | Persist and rank via **ShareYum backend** |

---

## Inventory / household assumptions

Inventory rows hardcoded in mock. SmartShop bridge not wired. FadiCore `householdId` / `memberId` available after onboarding but not passed to meal logic.

---

## Authentication & persistence

| Layer | Mechanism |
|-------|-----------|
| Auth | FadiCore `@ VITE_FADI_CORE_API_URL` (default `http://localhost:8787`), cookie session |
| Session | `GET /auth/me` |
| Household | Phase 4b create/join flows |
| Recipe access | `member_app_enrollments` with `applicationKey: "recipe"` |
| Local prefs | `localStorage` `recipeai.preferences.v1` |

---

## Frontend vs backend architecture

```text
ShareYum client (apps/RecipeAI/)
├── apps/recipe-ai/     Vite + React SPA
├── shared/             Design tokens, AtmosphereScreen
└── core/               TypeScript types only (no engines)

FadiCore (apps/FadiCore/) — PLATFORM ONLY
└── core-api            Auth, household, membership, enrollment, permissions

ShareYum backend — PLANNED / NOT IN REPO
└── Recipes, decideTonight, allergen gate, scoring, feedback, meal planning

SmartShop bridges — stubs (INTEGRATION.md)
```

---

## Sensitive logic exposed client-side

| Risk | Assessment |
|------|------------|
| KRS / scoring / allergen filters | Not present today |
| Future risk | **Must not** ship recommendation/scoring/allergen decision logic in browser bundles |

---

## FadiCore integration (current)

| Integrated | Not integrated (ShareYum domain) |
|------------|----------------------------------|
| Register / login / logout | Recipe catalog |
| `/auth/me` | Tonight / recommendations |
| Household create/join | Inventory / pantry |
| Address discover + join requests | Feedback persistence |
| Member enrollment (`recipe`) | Meal planning engine |

---

## Deployment / configuration

| Item | Status |
|------|--------|
| `vercel.json` | Build → `apps/recipe-ai/dist` |
| `.vercel/` | Project metadata present |
| Build | Passes (Vite) |

No deployment changes made during this audit.

---

## Visual assets vs The Living Kitchen

| Asset system | Status | Living Kitchen alignment |
|--------------|--------|-------------------------|
| `atmosphere.ts` gradients | Active placeholders | OK short-term; not photography |
| `AtmosphereScreen.imageUrl` | Supported, never passed | Gap |
| `worldKitchens.ts` | Unused, legacy | **Conflicts** — cuisine tourism; pending review |
| `cuisines.ts` | Unused, legacy | **Conflicts** — per-cuisine color themes; pending review |
| Separate meal-evening vs meal-preview gradients | Active | **Conflicts** — breaks meal continuity |
| Cook Mode | Flat charcoal gradient | Partial — missing texture/blur |
| `/public` photography | Missing | All image paths broken |

Approved direction: **The Living Kitchen** — one home, meal continuity Tonight→Preview→Feedback, no cuisine tourism, scales via canonical library + meal slot (not bespoke photo per dynamic recipe). No real-time-of-day switching in V1.

---

## Dead / demo / hardcoded data (remove eventually)

- `mockRecommendation.ts` (until ShareYum API wired)
- `defaultWeekPlan` hardcoded titles
- Miswired `food-preferences` / `language-location` in `App.tsx`
- Placeholder `PreferencesPage` / `ProfileSetupScreen`
- Empty `onNotTonight` handler
- Feedback rating discarded in handler

**Do not remove yet:** `worldKitchens.ts`, `cuisines.ts` (legacy pending review).

---

## Current State → Gap → Recommended next step

| Capability | Current | Target | Gap |
|------------|---------|--------|-----|
| Product identity | Recipe AI in UI | ShareYum | Phase A1 |
| Onboarding flow | Skips allergies | Preferences + optional weekly | Phase A1 |
| Tonight engine | Mock | ShareYum backend `decideTonight` | Post A1 |
| Domain logic location | Client types only | ShareYum server | Architecture not built |
| Living Kitchen visuals | Gradients | Canonical home + meal slot | Post engine |
| FadiCore boundary | Auth/household OK | No food domain in FadiCore | Aligned by decision |
| Legacy cuisine assets | Dead files | Review then deprecate | Pending review |

### Recommended sequence (awaiting approval)

1. **Phase A1** — ShareYum identity + onboarding/navigation cleanup only  
2. **Phase B** — ShareYum backend scaffold + `decideTonight` + allergen gate (server-side)  
3. **Phase C** — Wire client to ShareYum APIs; remove mock from hot path  
4. **Phase D** — Living Kitchen asset system + meal continuity  
5. **Legacy review** — `worldKitchens.ts` / `cuisines.ts` fate after visual + catalog strategy confirmed  

---

## References

- Master vision: [`MASTER_PRODUCT_VISION.md`](MASTER_PRODUCT_VISION.md)
- Logic spec: [`V1_PRODUCT_BLUEPRINT.md`](V1_PRODUCT_BLUEPRINT.md)
- Platform product: [`../../../products/recipeai.md`](../../../products/recipeai.md)
- FadiCore: `apps/FadiCore/README.md`
