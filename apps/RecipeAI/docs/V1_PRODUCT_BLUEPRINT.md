# Recipe AI — V1 Executable Product Blueprint

> **Platform product direction (overrides UI/onboarding):** [`../../products/recipeai.md`](../../products/recipeai.md)  
> **Ecosystem principles:** [`../../philosophy/PRINCIPLES.md`](../../philosophy/PRINCIPLES.md)  
> **Figma gate — no consumer UI until approved:** [`../../design/FIGMA.md`](../../design/FIGMA.md)  
> This file is the **logic implementation spec**. UI scope follows platform + Figma, not all sections below.

**Status:** Build specification (no UI design)  
**Scope:** V1 only — *“Plan and cook this week’s dinners for my household — and shop for what’s missing.”*  
**Aligned with:** Smart Shop `@smart-shop/core` contracts, `RecipeInventoryBridge`, `FamilyPreferenceProfile`, `HiddenInventoryProjection`

---

## 0. System boundaries

| Owns Recipe AI | Consumes from Smart Shop | Does not ship in V1 |
|----------------|--------------------------|---------------------|
| Meal horizon (tonight + 5 dinners) | `HouseholdSetupSnapshot` (city, stores, budget, family size) | Full pantry UI |
| Tonight decision engine | `HiddenInventoryProjection` / `FamilyInventoryMemory` (read + deduct) | Fitness integration |
| Recipe library + cook mode | `OfferView[]` (read-only, optional ranking input) | Social / community recipes |
| Cooked meal ledger | Basket handoff → Smart Shop plan/basket | Chat-first AI UI |
| Allergen safety gate | Purchase completion events (inventory restock) | Micronutrient depth |
| Inferred nutrition per meal | Shared `householdId` / `familyId` | Gamification / streaks |
| Meal → shopping gap list | | OCR / flyer import |
| Household member allergies | | Restaurant / delivery |

**Shared identifier:** `householdId` (Recipe AI) === `familyId` (Smart Shop ecosystem models).

---

## 1. Household onboarding

### 1.1 Job

Collect the minimum data to run Tonight + Week decisions in **≤ 90 seconds**, without asking users to “manage a database.”

### 1.2 Onboarding steps (ordered, skippable only where noted)

| Step | ID | Question / input | Required | Maps to |
|------|----|------------------|----------|---------|
| 1 | `link_or_create` | Use existing Smart Shop household or create new | Yes | `householdId` |
| 2 | `members` | Who eats here? (name, role, optional age band) | Yes (≥1) | `HouseholdMember[]` |
| 3 | `allergies` | Hard allergies per member (multi-select + free text) | Yes (confirm “none”) | `MemberAllergy[]` |
| 4 | `restrictions` | Household dietary rules (halal, vegan, etc.) | No | `DietaryRestriction[]` from `@smart-shop/core` |
| 5 | `liked_meals` | Pick 5 dinners you already cook & love | Yes (min 3) | `LikedMealSeed[]` |
| 6 | `stores_budget` | Confirm city + favourite stores + weekly food budget | Yes if not from Smart Shop | `HouseholdSetupSnapshot` fields |
| 7 | `tonight_eaters` | Who’s eating tonight? (default: all members) | Auto after step 2 | `TonightEatersSnapshot` |

**Skip rule:** If Smart Shop onboarding already completed (`householdSetupCompleted === true`), steps 6 pre-fill from `HouseholdSetupSnapshot`; user only confirms.

### 1.3 Validation rules

```text
members.length >= 1
each member.displayName non-empty
each member.allergies[] uses canonical allergen codes OR freeText flagged requiresReview
liked_meals.length >= 3 (target 5)
city non-empty
favouriteSupermarkets.length >= 1
weeklyFoodBudget > 0 OR inherit monthlyBudget / 4.33 from Smart Shop
```

### 1.4 Cold-start taste model (derived at onboarding end)

From `liked_meals`, compute initial `HouseholdTasteProfile`:

| Signal | Source | Initial weight |
|--------|--------|----------------|
| Cuisine affinity | Tags on liked meals | 0.6 confidence |
| Protein preference | Ingredient tags | 0.5 |
| Complexity tolerance | Max prep time among liked meals | 0.5 |
| Spice tolerance | User pick (mild / medium / bold) | 0.7 |
| Kid-friendly bias | `childrenCount > 0` → default true | 0.6 |

No LLM required for onboarding completion. LLM may enrich tags offline (Premium) but **must not block** onboarding.

### 1.5 Onboarding output event

```typescript
type HouseholdOnboardingCompletedEvent = {
  householdId: string;
  completedAt: string;
  memberCount: number;
  allergenCodesPresent: string[];
  likedMealCount: number;
  smartShopLinked: boolean;
};
```

**Side effects on completion:**

1. Persist `RecipeHouseholdGraph` (see §6).
2. If Smart Shop linked → merge allergies/restrictions into `FamilyPreferenceProfile.allergies` + `dietaryRestrictions` (Smart Shop remains canonical for shopping).
3. Trigger initial `generateWeekPlan()` (5 dinners, starting tonight).
4. Emit analytics: `onboarding_completed`, target `time_to_first_meal_suggestion < 60s`.

### 1.6 Member roles (V1 enum)

```typescript
type HouseholdMemberRole = "adult" | "child" | "guest_template";
type AgeBand = "toddler" | "child" | "teen" | "adult";
```

Guests are not created at onboarding — `guest_template` exists only for Tonight toggles (Guest Mode uses count, not profiles).

---

## 2. Tonight decision algorithm

### 2.1 Purpose

Select **1 primary dinner** + **2 alternates** for tonight that maximize probability of actually being cooked.

**North star alignment:** suggestion acceptance → cook started → cook completed.

### 2.2 Inputs (snapshot at decision time)

```typescript
type TonightDecisionInput = {
  householdId: string;
  at: string; // ISO datetime
  eatersTonight: string[]; // member IDs
  guestCount: number;
  timeBudgetMinutes: number; // default 45; user-adjustable 20 | 45 | 60+
  energyLevel?: "low" | "normal" | "high"; // optional
  household: RecipeHouseholdGraph;
  inventory: PantryAvailabilitySnapshot; // from hidden inventory
  weekPlan: WeekMealPlan;
  offers: OfferHint[]; // optional, lightweight
  recentFeedback: MealFeedback[]; // last 14 days
};
```

### 2.3 Pipeline (strict order)

```text
CANDIDATES ← recipe pool (week plan slot + taste-matched library)
    ↓
[1] ALLERGEN HARD FILTER          → remove unsafe (see §4)
    ↓
[2] DIETARY HARD FILTER           → halal, vegan, etc.
    ↓
[3] REALITY GATE (Kitchen Reality Score) → score ≥ threshold
    ↓
[4] PANTRY & EXPIRATION BOOST     → rank, don't filter (except unusable)
    ↓
[5] PREFERENCE & FEEDBACK RANK    → taste + regret signals
    ↓
[6] BUDGET CHECK                  → demote over-budget; swap suggestion in copy
    ↓
[7] OFFER NUDGE (V1 light)        → tie-break only
    ↓
OUTPUT: primary + alternateA + alternateB (must differ by main protein OR cuisine)
```

### 2.4 Kitchen Reality Score (KRS)

Each candidate meal receives `krsScore` 0–100. **Threshold: ≥ 55** to appear as primary; alternates may be ≥ 45.

| Factor | Weight | Calculation |
|--------|--------|-------------|
| Time fit | 30% | `100 if prep+ cook ≤ timeBudget`; linear decay to 0 at +30 min over |
| Eater coverage | 20% | All eaters have plate variant possible (allergy-safe child split, etc.) |
| Pantry match | 20% | `% required ingredients likely in stock` from `PantryAvailabilitySnapshot` |
| Expiration use | 15% | Bonus if meal uses ≥1 item with `estimatedDaysRemaining ≤ 2` |
| Skill fit | 10% | Compare recipe difficulty to household `skillLevel` from cooked history |
| Energy fit | 5% | If `energyLevel === "low"`, penalize recipes with `stepCount > 8` or active cook techniques |

```typescript
type KitchenRealityBreakdown = {
  timeFit: number;
  eaterCoverage: number;
  pantryMatch: number;
  expirationUse: number;
  skillFit: number;
  energyFit: number;
  total: number;
};
```

### 2.5 Week-plan precedence

```text
IF weekPlan has assigned meal for today AND status in ("planned", "suggested"):
  candidates = [that meal] + 2 alternates from same cuisine family OR same main ingredient
ELSE:
  candidates = top 12 from taste-ranked library filtered by steps 1–2
```

User accepting week plan meal for tonight **skips re-generation** unless they tap “Swap.”

### 2.6 Explanation contract (required on every suggestion)

Every surfaced meal includes exactly **one plain sentence** from template + facts:

```typescript
type MealSuggestionReason = {
  template:
    | "uses_expiring"
    | "matches_time"
    | "uses_pantry"
    | "family_favorite"
    | "kid_friendly"
    | "budget_friendly"
    | "week_plan";
  fact: string; // e.g. "yogurt expires tomorrow"
  sentence: string; // rendered, ≤ 120 chars
};
```

**Rule:** No suggestion without `reason.sentence`. No LLM-only reasons — template must match deterministic factor.

### 2.7 Output

```typescript
type TonightDecisionResult = {
  decidedAt: string;
  primary: RankedMealSuggestion;
  alternates: [RankedMealSuggestion, RankedMealSuggestion];
  rejectedCount: number; // for diagnostics
};

type RankedMealSuggestion = {
  recipeId: string;
  recipeVersion: string;
  krsScore: number;
  krsBreakdown: KitchenRealityBreakdown;
  reason: MealSuggestionReason;
  estimatedCost: number;
  missingIngredientCount: number;
  nutritionSummary: MealNutritionSummary;
};
```

### 2.8 Re-decision triggers

Regenerate Tonight when:

- User changes `eatersTonight` or `guestCount`
- User changes `timeBudgetMinutes` or `energyLevel`
- User completes a shopping trip that updates pantry (Smart Shop event)
- User marks week-plan meal “skipped”
- Local time passes `17:00` and primary was not accepted (soft refresh — same meal if still best)

**Do not** regenerate on every app open if input hash unchanged.

### 2.9 Free vs Premium (V1)

| Capability | Free | Premium |
|------------|------|---------|
| Candidate pool | Rule-based match on liked meals + curated pilot catalog | + LLM adaptation for swaps/explanations |
| Week plan generation | Rotating 5 dinners from catalog + taste tags | Adaptive re-plan on feedback |
| KRS threshold | Fixed 55 / 45 | Same thresholds (safety parity) |
| Offer tie-break | Off | On |

**Safety parity:** Allergen and dietary filters identical across tiers.

---

## 3. Recipe AI ↔ SmartShop API contract

Hidden contracts only in pilot — no duplicate shopping UI in Recipe AI.

### 3.1 Transport (V1 pilot)

In-process module boundary within monorepo:

- Package: `@smart-shop/ecosystem` bridges
- Recipe AI app imports bridge interfaces; Smart Shop app hosts implementations

Future: HTTP/gRPC with shared auth — types remain identical.

### 3.2 Shared types (import from `@smart-shop/core`)

Already defined — Recipe AI **must not redefine**:

- `HouseholdSetupSnapshot`
- `FamilyPreferenceProfile`
- `HiddenInventoryProjection` / `FamilyInventoryMemory`
- `OfferView`
- `PlanLine`, `PurchaseLine`, `ShoppingBasket`
- `FutureMealSelectionEvent`, `MealIngredientDeduction`
- `GenerateSmartShoppingBasketInput`

### 3.3 Recipe AI → Smart Shop

#### 3.3.1 `getHouseholdContext`

```typescript
type GetHouseholdContextRequest = { householdId: string };

type GetHouseholdContextResponse = {
  setup: HouseholdSetupSnapshot;
  preferences: FamilyPreferenceProfile;
  inventory: HiddenInventoryProjection;
  offers: OfferView[]; // filtered by city + favouriteSupermarkets
  memoryLastUpdatedAt?: string;
};
```

**Use:** onboarding pre-fill, Tonight algorithm, shop gap generation.

#### 3.3.2 `pushMealShoppingGaps`

Creates or merges shopping need lines from a meal’s missing ingredients.

```typescript
type MealShoppingGapItem = {
  ingredientName: string;
  normalizedName: string;
  quantity: number;
  unit: string;
  category: string; // maps to PlanLine.category
  reason: "meal_tonight" | "meal_week" | "substitution";
  recipeId: string;
  mealSlotId?: string;
};

type PushMealShoppingGapsRequest = {
  householdId: string;
  source: "recipe_ai";
  items: MealShoppingGapItem[];
  mergePolicy: "append_uncheck_existing" | "replace_meal_scope";
  mealScopeId: string; // idempotency key per meal plan slot
};

type PushMealShoppingGapsResponse = {
  planLineIds: string[];
  mergedCount: number;
  estimatedTotal: number;
};
```

**Smart Shop behavior:** Convert to `PlanLine[]` entries on household weekly plan; unchecked; priced via rule-based estimate (Free) or offer-aware estimate (Premium).

#### 3.3.3 `handoffToBasket`

One-tap “Shop this week” / “Shop missing for tonight.”

```typescript
type HandoffToBasketRequest = {
  householdId: string;
  scope: "tonight" | "week";
  mealScopeId?: string;
  planLineIds?: string[]; // if omitted, all unchecked gap lines in scope
};

type HandoffToBasketResponse = {
  basketId: string;
  basketLineCount: number;
  deepLink: string; // Smart Shop screen route, e.g. "14-shopping-basket"
  estimatedTotal: number;
};
```

**Smart Shop behavior:** Run `generateBasketFromPlan` (Free) or `GenerateSmartShoppingBasket` (Premium) with `nutritionContextRef = mealScopeId`.

#### 3.3.4 `notifyMealSelected`

Fires when user **accepts** Tonight meal or starts cook mode.

```typescript
// Wraps FutureMealSelectionEvent
type NotifyMealSelectedRequest = FutureMealSelectionEvent;

type NotifyMealSelectedResponse = {
  deductionsApplied: MealIngredientDeduction[];
  inventoryBridgeStatus: RecipeInventoryBridgeStatus;
};
```

**Smart Shop behavior:** `RecipeInventoryBridge.applyMealSelection` — deduct projected stock; no UI.

#### 3.3.5 `notifyMealCompleted`

Fires after cook mode finished + optional feedback.

```typescript
type NotifyMealCompletedRequest = {
  householdId: string;
  recipeId: string;
  cookedAt: string;
  servingsByMember: Record<string, number>;
  ingredientActuals?: Array<{ name: string; usedQuantity: number; unit: string }>;
  feedback?: MealFeedback;
};

type NotifyMealCompletedResponse = {
  ledgerEntryId: string;
  inventoryAdjustments: number;
};
```

### 3.4 Smart Shop → Recipe AI

#### 3.4.1 `onShoppingTripCompleted`

```typescript
type ShoppingTripCompletedEvent = {
  householdId: string;
  tripId: string;
  purchasedLines: PurchaseLine[];
  completedAt: string;
};
```

**Recipe AI behavior:** Refresh `PantryAvailabilitySnapshot`; re-run Tonight if input hash changes; reduce missing ingredient counts.

#### 3.4.2 `onHouseholdSetupUpdated`

```typescript
type HouseholdSetupUpdatedEvent = {
  householdId: string;
  setup: HouseholdSetupSnapshot;
  preferences: FamilyPreferenceProfile;
};
```

**Recipe AI behavior:** Sync budget, stores, restrictions; invalidate week cost estimates.

### 3.5 Error codes (shared)

| Code | Meaning | Recipe AI UX (logic, not visual) |
|------|---------|-----------------------------------|
| `HOUSEHOLD_NOT_FOUND` | No linked household | Force onboarding step 1 |
| `BRIDGE_DISABLED` | Inventory deductions off | Skip deduct; log; cooking still allowed |
| `ALLERGEN_CONFLICT` | Gap item conflicts with allergy on merge | Drop item; surface in meal missing list |
| `BASKET_HANDOFF_FAILED` | Plan empty | Regenerate gaps first |
| `OFFERS_UNAVAILABLE` | No local offers | Proceed with estimate prices |

### 3.6 Idempotency

- `mealScopeId` + `handoffToBasket` scope → duplicate calls return same `basketId` if plan unchanged.
- `notifyMealSelected` idempotent on `event.id`.

### 3.7 Pilot stub (acceptable in MVP phase 1)

If Smart Shop bridge not wired: local in-memory adapter implementing same types against `localStore` — **must pass contract tests** before cross-app wiring.

---

## 4. Allergen safety rules

**Principle:** Allergen blocks are **deterministic, hard, and pre-LLM**. AI never overrides.

### 4.1 Canonical allergen registry (EU 14 + explicit extensions for pilot)

| Code | Label | Hard block |
|------|-------|------------|
| `celery` | Celery | Yes |
| `cereals_gluten` | Gluten / wheat | Yes |
| `crustaceans` | Crustaceans | Yes |
| `eggs` | Eggs | Yes |
| `fish` | Fish | Yes |
| `lupin` | Lupin | Yes |
| `milk` | Milk | Yes |
| `molluscs` | Molluscs | Yes |
| `mustard` | Mustard | Yes |
| `nuts` | Tree nuts | Yes |
| `peanuts` | Peanuts | Yes |
| `sesame` | Sesame | Yes |
| `soy` | Soy | Yes |
| `sulphites` | Sulphites | Yes |
| `free_text` | User-entered | Yes — treat as keyword block |

Member may have multiple allergens. Household block list = **union** of all members eating tonight.

### 4.2 Recipe allergen metadata (required on every catalog recipe)

```typescript
type RecipeAllergenDeclaration = {
  contains: string[]; // canonical codes
  mayContain: string[]; // cross-contamination — also hard block in V1
  allergenFreeClaims: string[]; // e.g. "gluten_free" — must pass verification
};
```

**Rule:** Recipe without `allergenDeclaration` **cannot be suggested** (fail-closed).

### 4.3 Filtering algorithm

```text
FOR each candidate recipe R:
  FOR each allergen A in tonightBlockList:
    IF A in R.allergenDeclaration.contains OR A in R.allergenDeclaration.mayContain:
      REJECT R (reason: ALLERGEN_HARD_BLOCK)
    IF A is free_text keyword K:
      IF any ingredient name or alias matches K (normalized):
        REJECT R
  FOR each substitution S proposed:
    APPLY same check before surfacing
```

### 4.4 Substitution safety

- Allowed substitutions come from **curated table** keyed by ingredient + allergen context.
- LLM-generated substitutions **disabled in V1 Free**; Premium may suggest but **must pass same filter** before display.
- If no safe substitution exists: ingredient stays on “need to buy” list; never swap to unverified alternative.

### 4.5 “Allergen-free claim” verification

If recipe tagged `gluten_free` but `contains` includes `cereals_gluten` → **catalog error**, exclude recipe globally.

### 4.6 Audit log (internal)

```typescript
type AllergenBlockLogEntry = {
  at: string;
  householdId: string;
  recipeId: string;
  blockedForMemberIds: string[];
  allergenCodes: string[];
  stage: "tonight" | "week_plan" | "substitution";
};
```

### 4.7 User-facing logic messages (copy templates, not UI)

- Block: `"Not suggested: contains {allergen} for {memberName}."`
- Never expose probabilistic language (“might contain”) for blocked meals — only deterministic fact.

### 4.8 Pilot locale notes (St. Pölten)

- Support Arabic/Turkish **ingredient alias map** for keyword matching (same canonical codes).
- Halal restriction uses **deterministic rule set** (no pork, no alcohol in ingredients) — separate from allergen pipeline but same stage [2].

---

## 5. V1 screen map

Logical screens only — **no layout, components, or visual design.**

Each screen defines: **purpose, entry conditions, primary actions, data read/written, exit states.**

### 5.1 Screen index

| ID | Screen | Purpose |
|----|--------|---------|
| S0 | Auth / App entry | Reuse Smart Shop session or standalone Recipe AI auth (pilot: shared local session) |
| S1 | Onboarding wizard | Execute §1 flow |
| S2 | Home — Tonight | Primary job: see tonight’s meal + 2 alternates |
| S3 | Home — This week | 5 dinner slots, accept / swap / skip |
| S4 | Recipe detail | Why this fits, ingredients have/need, actions |
| S5 | Cook mode | Step-by-step execution |
| S6 | After cook | Light feedback + ledger write |
| S7 | Shop handoff | Missing items → confirm → Smart Shop basket |
| S8 | Family eating tonight | Toggle eaters + guest count |
| S9 | Settings (minimal) | Taste, restrictions, budget, stores — 4 cards |
| S10 | Cooked history | Private ledger of meals actually cooked |

**Explicitly excluded:** pantry management UI, nutrition dashboard, chat, discovery feed, fitness, social.

### 5.2 Navigation graph

```text
S0 → (no household?) S1 → S2
S0 → (household ok) S2

S2 ↔ S8
S2 → S4 → S5 → S6 → S2
S4 → S7 → [Smart Shop deep link]
S2 → S3
S3 → S4
S2 → S10
S2 → S9
```

### 5.3 Screen specs

#### S1 — Onboarding wizard

| | |
|--|--|
| **Entry** | No `RecipeHouseholdGraph` or incomplete onboarding |
| **Reads** | Smart Shop `getHouseholdContext` if linked |
| **Writes** | `RecipeHouseholdGraph`, `HouseholdTasteProfile`, initial `WeekMealPlan` |
| **Primary actions** | Next step, Confirm allergies (none), Finish |
| **Exit** | `onboarding_completed` → S2 |

#### S2 — Home (Tonight)

| | |
|--|--|
| **Entry** | Onboarding complete |
| **Reads** | `TonightDecisionResult`, `TonightEatersSnapshot`, week summary strip |
| **Writes** | Accept tonight meal → `WeekMealPlan.slots[today].status = accepted` |
| **Primary actions** | Accept, Swap (→ alternates), View recipe, Who’s eating (S8), This week (S3) |
| **Exit** | Accept → S4 or stay; Swap → re-rank alternates |

#### S3 — This week

| | |
|--|--|
| **Entry** | From S2 |
| **Reads** | `WeekMealPlan` (5 slots), cost estimate |
| **Writes** | Swap slot, skip slot, regenerate single slot |
| **Primary actions** | Accept week, Swap meal, Shop week (S7) |
| **Exit** | Slot tap → S4 |

#### S4 — Recipe detail

| | |
|--|--|
| **Entry** | Meal selected from S2/S3/S10 |
| **Reads** | Recipe, `MealSuggestionReason`, ingredients split have/need, `MealNutritionSummary` |
| **Writes** | Optional scale factor, substitution selection |
| **Primary actions** | Start cook (S5), Shop missing (S7), Swap substitution |
| **Exit** | Start cook → S5 |

#### S5 — Cook mode

| | |
|--|--|
| **Entry** | User started cook from S4 |
| **Reads** | Recipe steps, timers, scaled ingredients |
| **Writes** | `CookSession` progress, `notifyMealSelected` on start |
| **Primary actions** | Next step, Previous, Timer start, Substitute step (curated only) |
| **Exit** | Complete → S6; Abandon → S4 (partial session discarded) |

#### S6 — After cook

| | |
|--|--|
| **Entry** | Cook session complete |
| **Reads** | Recipe summary |
| **Writes** | `CookedMealLedgerEntry`, `MealFeedback`, `notifyMealCompleted` |
| **Primary actions** | Rate (optional 1-tap), Add to family cookbook (auto), Done |
| **Exit** | Done → S2 |

#### S7 — Shop handoff

| | |
|--|--|
| **Entry** | From S4 (tonight) or S3 (week) |
| **Reads** | Missing ingredients list with reasons |
| **Writes** | `pushMealShoppingGaps`, `handoffToBasket` |
| **Primary actions** | Confirm handoff → open Smart Shop via `deepLink` |
| **Exit** | Return from Smart Shop → refresh S2/S4 pantry state |

#### S8 — Family eating tonight

| | |
|--|--|
| **Entry** | S2 action |
| **Reads** | `HouseholdMember[]` |
| **Writes** | `TonightEatersSnapshot`, triggers Tonight re-decision |
| **Primary actions** | Toggle member, Set guest count |
| **Exit** | Apply → S2 |

#### S9 — Settings (minimal)

| | |
|--|--|
| **Cards** | Taste & spice, Restrictions & allergies, Budget, Stores & city |
| **Writes** | `RecipeHouseholdGraph`, sync `onHouseholdSetupUpdated` to Smart Shop |
| **Exit** | Back → S2 |

#### S10 — Cooked history

| | |
|--|--|
| **Reads** | `CookedMealLedgerEntry[]` reverse chronological |
| **Primary actions** | Cook again, View recipe |
| **Exit** | → S4 |

### 5.4 Global state subscriptions

| Event | Screens affected |
|-------|------------------|
| `TonightDecisionResult` updated | S2 |
| `WeekMealPlan` updated | S2, S3 |
| `onShoppingTripCompleted` | S2, S4, S7 |
| `PantryAvailabilitySnapshot` updated | S2, S4 |

---

## 6. Data models

Types below are **Recipe AI domain** unless noted as imported from `@smart-shop/core`.

### 6.1 Core graph

```typescript
type RecipeHouseholdGraph = {
  householdId: string;
  createdAt: string;
  updatedAt: string;
  members: HouseholdMember[];
  taste: HouseholdTasteProfile;
  setup: HouseholdSetupSnapshot; // imported
  preferences: FamilyPreferenceProfile; // imported — Recipe AI extends allergies here
  onboarding: {
    completed: boolean;
    completedAt?: string;
    likedMealsSeed: LikedMealSeed[];
  };
  skillLevel: "beginner" | "intermediate" | "confident"; // derived from cook history
};
```

### 6.2 Members & tonight

```typescript
type HouseholdMember = {
  id: string;
  displayName: string;
  role: HouseholdMemberRole;
  ageBand?: AgeBand;
  allergies: MemberAllergy[];
  portionFactor: number; // default 1.0; child 0.6–0.8
};

type MemberAllergy = {
  code: string; // canonical or "free_text"
  label: string;
  severity: "avoid" | "strict"; // V1: both hard block
};

type TonightEatersSnapshot = {
  date: string; // YYYY-MM-DD local
  memberIds: string[];
  guestCount: number;
  timeBudgetMinutes: number;
  energyLevel?: "low" | "normal" | "high";
};
```

### 6.3 Taste & seeds

```typescript
type LikedMealSeed = {
  id: string;
  label: string; // user text or picked catalog name
  catalogRecipeId?: string;
  cuisineTag?: string;
};

type HouseholdTasteProfile = {
  cuisineAffinities: Record<string, number>; // 0–1
  proteinAffinities: Record<string, number>;
  maxPreferredPrepMinutes: number;
  spiceTolerance: "mild" | "medium" | "bold";
  kidFriendlyBias: boolean;
};
```

### 6.4 Recipes & catalog

```typescript
type Recipe = {
  id: string;
  version: string;
  name: string;
  locale: string; // e.g. "de-AT"
  cuisine: string;
  difficulty: "easy" | "medium" | "hard";
  prepMinutes: number;
  cookMinutes: number;
  stepCount: number;
  servingsBase: number;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  allergenDeclaration: RecipeAllergenDeclaration;
  tags: string[];
  nutritionPerServing: MealNutritionSummary;
  substitutions: CuratedSubstitution[]; // curated table
};

type RecipeIngredient = {
  id: string;
  name: string;
  normalizedName: string;
  quantity: number;
  unit: string;
  category: string;
  optional: boolean;
  pantryAliasOf?: string; // maps to inventory normalized name
};

type RecipeStep = {
  order: number;
  instruction: string;
  timerMinutes?: number;
  techniqueTags?: string[];
};

type CuratedSubstitution = {
  ingredientId: string;
  alternativeName: string;
  allergenSafeFor: string[]; // allergen codes cleared
  ratio: number;
};
```

### 6.5 Meal planning

```typescript
type WeekMealPlan = {
  id: string;
  householdId: string;
  weekStart: string; // ISO Monday
  slots: MealPlanSlot[]; // length 5, dinner only
  estimatedWeeklyCost: number;
  generatedAt: string;
};

type MealPlanSlot = {
  id: string;
  date: string;
  slot: "dinner";
  recipeId: string;
  recipeVersion: string;
  status: "suggested" | "accepted" | "cooked" | "skipped";
  reason?: MealSuggestionReason;
};

type MealPlanSlotId = string; // used as mealScopeId in shop contract
```

### 6.6 Pantry (read model — not user-managed UI)

```typescript
type PantryAvailabilitySnapshot = {
  householdId: string;
  asOf: string;
  items: PantryAvailabilityItem[];
};

type PantryAvailabilityItem = {
  normalizedName: string;
  displayName: string;
  likelyHave: boolean;
  confidence: "low" | "medium" | "high";
  estimatedDaysRemaining?: number;
  source: "inventory_projection" | "recent_purchase" | "manual_correction";
};
```

Built from `HiddenInventoryProjection` + decay rules — **no separate pantry DB in V1**.

### 6.7 Cooking & ledger

```typescript
type CookSession = {
  id: string;
  householdId: string;
  recipeId: string;
  recipeVersion: string;
  startedAt: string;
  completedAt?: string;
  currentStep: number;
  scaleFactor: number;
  substitutionsApplied: string[]; // CuratedSubstitution ids
};

type CookedMealLedgerEntry = {
  id: string;
  householdId: string;
  recipeId: string;
  recipeVersion: string;
  cookedAt: string;
  eaterMemberIds: string[];
  guestCount: number;
  feedback?: MealFeedback;
  addedToFamilyCookbook: boolean;
};

type MealFeedback = {
  rating?: "good" | "ok" | "bad";
  tags?: Array<"too_heavy" | "too_long" | "kids_refused" | "too_spicy" | "save_again">;
  recordedAt: string;
};
```

### 6.8 Nutrition (inferred, V1 basic)

```typescript
type MealNutritionSummary = {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  // per serving; scale at display time
};
```

Derived from recipe metadata × portions — **no manual logging**.

### 6.9 Offer hint (lightweight read)

```typescript
type OfferHint = {
  offerId: string;
  productName: string;
  merchantName: string;
  offerPrice: number;
  normalPrice?: number;
  matchedIngredientNormalizedName?: string;
};
```

### 6.10 Persistence map (pilot)

| Entity | Store (pilot) |
|--------|---------------|
| `RecipeHouseholdGraph` | `localStorage: recipeai.household.{id}` |
| `WeekMealPlan` | `localStorage: recipeai.weekPlan.{id}` |
| `TonightEatersSnapshot` | `localStorage: recipeai.tonight.{id}` |
| `CookedMealLedgerEntry[]` | `localStorage: recipeai.ledger.{id}` |
| Recipe catalog | Static JSON bundle (pilot catalog) |
| Allergen alias map | Static JSON bundle |

---

## 7. MVP implementation roadmap

Phases are **sequential**. No phase adds V1-out-of-scope features.

### Phase 0 — Foundation (Week 1)

| Task | Deliverable |
|------|-------------|
| Create `@recipe-ai/core` package | TypeScript types from §6 |
| Import Smart Shop types | Dependency on `@smart-shop/core` |
| Pilot recipe catalog | 30–50 recipes, full allergen declarations, St. Pölten locale |
| Allergen filter module | §4 pure functions + unit tests |
| Contract types for bridge | §3 request/response interfaces |

**Exit criteria:** Allergen tests pass; types compile; catalog loads.

### Phase 1 — Household & planning engine (Week 2)

| Task | Deliverable |
|------|-------------|
| Onboarding state machine | §1 steps + validation |
| `RecipeHouseholdGraph` persistence | localStore |
| `generateWeekPlan()` | 5 dinners, rule-based, allergen-safe |
| `decideTonight()` | §2 pipeline without offers |
| KRS scoring module | §2.4 with tests |
| Explanation templates | §2.6 |

**Exit criteria:** Given fixture household, engine returns primary + 2 alternates with reasons; unsafe recipes never appear.

### Phase 2 — Smart Shop bridge (Week 3)

| Task | Deliverable |
|------|-------------|
| Implement `getHouseholdContext` adapter | Reads Smart Shop localStore |
| `pushMealShoppingGaps` | Merges into `PlanLine[]` |
| `handoffToBasket` | Returns deep link + basket id |
| `notifyMealSelected` / `notifyMealCompleted` | Wire to `RecipeInventoryBridge` |
| Subscribe `onShoppingTripCompleted` | Refresh pantry snapshot |

**Exit criteria:** Contract integration test: meal → gaps → basket → simulated trip → pantry refresh → Tonight updates.

### Phase 3 — Cook loop (Week 4)

| Task | Deliverable |
|------|-------------|
| Cook session state machine | S5 logic |
| Ingredient scaling | `portionFactor` × guests |
| Curated substitutions only | §4.4 |
| Ledger + feedback | S6 writes |
| `CookedMealLedgerEntry` → taste/skill updates | §2 feedback rank inputs |

**Exit criteria:** End-to-end: accept meal → cook → ledger → week slot `cooked` → inventory deduct.

### Phase 4 — App shell & screens (Week 5–6)

| Task | Deliverable |
|------|-------------|
| Screen routes S0–S10 | Logic-only containers (no visual design system) |
| Wire screens to engines | Read/write models per §5.3 |
| Smart Shop deep link handoff | S7 |
| Settings sync | S9 ↔ Smart Shop |

**Exit criteria:** Pilot flow completable without mock data beyond catalog.

### Phase 5 — Pilot hardening (Week 7)

| Task | Deliverable |
|------|-------------|
| Arabic/Turkish ingredient alias map | §4.8 |
| Halal deterministic filter | §4.8 |
| Metrics instrumentation | HCM/W, suggestion acceptance, time-to-first-cook |
| Premium feature flags | LLM paths off by default |

**Exit criteria:** St. Pölten beta success thresholds measurable (see below).

### Pilot success thresholds (V1)

| Metric | Target |
|--------|--------|
| Household Cooked Meals / Week (HCM/W) | ≥ 3 by week 2 |
| Time to first cooked meal after install | < 24 h |
| Week-2 retention | ≥ 40% pilot cohort |
| Suggestion acceptance rate | ≥ 50% |
| Shopping list handoff conversion | ≥ 30% of accepted meals |
| Allergen safety incidents | 0 |

### Dependency graph

```text
Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
              ↑                      │
              └──────────────────────┘ (feedback loop tests in Phase 3)
```

### Team split (suggested)

| Track | Owns |
|-------|------|
| Core engine | §2, §4, §6, catalog |
| Ecosystem | §3 bridge + Smart Shop changes |
| App | §5 screen logic + routing |
| Pilot | Locale content, metrics, family recruitment |

---

## Appendix A — Week plan generation (rule-based V1)

```text
INPUT: RecipeHouseholdGraph, PantryAvailabilitySnapshot, existing ledger (avoid repeat within 7 days)

1. Build safe pool: catalog recipes passing §4 for ALL members
2. Score each recipe with taste affinities + liked meal tag overlap
3. Pick 5 with diversity constraint:
   - no duplicate primary protein on consecutive days
   - at least 2 cuisines in week
   - at least 1 recipe uses expiring pantry item if any expire within 3 days
4. Assign to Mon–Fri dinner slots (pilot) or next 5 days rolling
5. Attach reason per slot
6. Compute estimatedWeeklyCost from ingredient prices (rule estimates)

OUTPUT: WeekMealPlan
```

---

## Appendix B — Input hash for Tonight cache

```typescript
function tonightInputHash(input: TonightDecisionInput): string {
  // hash: date, eater ids sorted, guestCount, timeBudget, energyLevel,
  //       weekPlan slot recipe id for today, pantry snapshot version, feedback count
}
```

---

## Appendix C — File layout (implementation)

```text
apps/RecipeAI/
  core/
    src/
      models/           # §6 types
      allergen/         # §4
      decision/         # §2 tonight + week
      onboarding/       # §1
      catalog/          # pilot recipes JSON
      bridge/           # §3 client interfaces
  app/
    src/
      screens/          # §5 logical screens
      state/
      services/
  docs/
    V1_PRODUCT_BLUEPRINT.md  # this document
```

---

*This blueprint is the single source of truth for V1 build logic. UI/visual design is a separate phase and must not expand scope beyond this document.*
