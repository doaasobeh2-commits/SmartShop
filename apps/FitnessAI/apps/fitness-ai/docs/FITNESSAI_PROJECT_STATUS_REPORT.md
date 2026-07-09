# FitnessAI — Project Status Report

**Document type:** Master engineering reference  
**Version:** 0.1.0 (application)  
**Last updated:** July 6, 2026  
**Primary codebase:** `apps/fitness-ai/`  
**Stack:** React 19 · TypeScript · Vite · Tailwind CSS  
**Default language:** German (`de`)

---

## Table of Contents

1. [Project Vision](#1-project-vision)
2. [Current Architecture](#2-current-architecture)
3. [Current UI](#3-current-ui)
4. [Hidden Brain Layers](#4-hidden-brain-layers)
5. [Data Flow](#5-data-flow)
6. [Privacy](#6-privacy)
7. [Implemented Features](#7-implemented-features)
8. [Planned Features](#8-planned-features)
9. [Recommended Development Order](#9-recommended-development-order)
10. [Technical Debt](#10-technical-debt)
11. [Risks](#11-risks)
12. [Overall Project Progress](#12-overall-project-progress)

---

## 1. Project Vision

### 1.1 Long-term vision

FitnessAI is a **brain-first fitness application**. The product goal is not to become another calorie counter or workout logger. Instead, FitnessAI aims to build a persistent, explainable, privacy-respecting **Fitness Brain** that learns how a person lives, moves, eats, and recovers — then converts that understanding into **one clear daily action** and simple supporting guidance.

The user experience philosophy is deliberately minimal on the surface:

> **The user teaches Fitness Brain once. Fitness Brain works every day.**

That means:

- The user should not re-enter the same context repeatedly.
- The user should not manage complex dashboards, macros, or medical data.
- The user logs simple real-world actions (a workout, a meal, water) when convenient.
- The Brain absorbs structured signals in the background and improves recommendations over time.

### 1.2 What makes FitnessAI different

| Typical fitness app | FitnessAI |
|---------------------|-----------|
| User manually tracks everything forever | User teaches context once; Brain learns patterns |
| Static calorie targets | Targets derived from profile + behavior + lifestyle |
| Generic workout plans | Training influenced by recovery, habits, and logged activity |
| Opaque “AI coach” chat | Rule-based, explainable decisions with evidence tags |
| Personal account as identity anchor | Anonymous local installation ID for Brain data |
| Medical-adjacent claims | General fitness guidance only; safety guardrails |

FitnessAI’s differentiation is the **invisible intelligence layer**:

- The user thinks: *“I logged today’s workout.”*
- Fitness Brain thinks: *“I learned another piece of this person’s long-term behavior and can adjust fuel, hydration, recovery, and tomorrow’s training context.”*

### 1.3 Product principles (engineering constraints)

These principles are enforced in code today:

1. **No medical claims** — recovery, nutrition, and lifestyle outputs are wellness guidance, not diagnosis.
2. **No unnecessary personal data** — Brain layers avoid name, email, address, diagnoses, medications, etc.
3. **Explainability over black boxes** — daily actions include rule IDs, evidence levels, and reasons.
4. **German-first UX** — user-facing Brain strings default to German.
5. **Simplicity over feature sprawl** — Today shows one Smart Focus card; bottom navigation is fixed at five tabs.
6. **Local-first Brain storage** — lifestyle, behavior, activity, and consent data persist in browser local storage scoped by installation ID.
7. **No external AI/API dependency yet** — all Brain logic is deterministic and rule-based.

---

## 2. Current Architecture

FitnessAI currently has **two related but separate brain implementations**. This is important for any new engineer:

| Layer | Path | Role today |
|-------|------|------------|
| **Legacy presentation Brain** | `src/brain/` | Powers `DailyPlan`, Coach insights, macro/calorie targets for Eat/Train cards |
| **Fitness Brain (canonical)** | `src/fitnessBrain/` | Powers Smart Focus, lifestyle intelligence, activity logging, privacy, explainability |

The long-term direction is for **`src/fitnessBrain/`** to become the single source of truth. The legacy `src/brain/` layer still feeds most tab content except Today’s Smart Focus.

### 2.1 Monorepo layout

```
apps/FitnessAI/
├── apps/fitness-ai/     ← Main React application
├── core/                ← Shared types (Lang, MainTab, FlowScreen)
├── shared/              ← UI components, i18n shell, design tokens
└── package.json         ← Workspace root
```

### 2.2 Application structure (`apps/fitness-ai/src/`)

```
src/
├── App.tsx                    ← Flow (welcome/onboarding/auth) + 5-tab main app
├── screens/                   ← UI screens by domain
├── hooks/                     ← React hooks bridging UI ↔ services ↔ Brain
├── services/                  ← Presentation services (dailyPlan, coach)
├── data/repositories/         ← Mock repositories (profile, meals, workout, water)
├── domain/                    ← Models + repository interfaces
├── brain/                     ← Legacy Brain (daily plan composition)
└── fitnessBrain/              ← Canonical Fitness Brain (Phases 2–8B)
```

---

### 2.3 Fitness Brain Core (`fitnessBrain/fitnessBrain.ts`)

**Purpose:** Main orchestrator for the canonical Brain.

**What it does today:**

1. Loads behavior logs and activity logs.
2. Builds lifestyle intelligence (patterns, completeness, activity learning).
3. Normalizes user profile and effective training days.
4. Runs metabolism → nutrition → training → recovery engines.
5. Builds activity requirement context from logged activities.
6. Generates one explainable daily action.
7. Returns full `FitnessBrainState`.

**Key output type:** `FitnessBrainState` — includes user profile, metabolism, nutrition targets, training recommendation, recovery assessment, daily action, lifestyle intelligence, brain completeness score, and activity requirements context.

---

### 2.4 User Profile Engine (`fitnessBrain/userProfileEngine.ts`)

**Purpose:** Normalize raw onboarding/profile input into a consistent internal profile.

**Inputs:** age, gender, height, weight, goal, activity level, experience, training days, food preferences.

**Outputs:** `NormalizedUserProfile` with safe defaults when fields are missing.

**Notes:** Maps legacy goal strings (`lose`, `muscle`, `fit`) to canonical goals (`fat_loss`, `muscle_gain`, `maintenance`).

---

### 2.5 Metabolism Engine (`fitnessBrain/metabolismEngine.ts`)

**Purpose:** Compute BMR, TDEE, and goal-adjusted daily calorie target.

**Method:** Mifflin–St Jeor BMR formula + activity multiplier + goal adjustment from knowledge base.

**Outputs:** `MetabolismResult` including disclaimer string.

---

### 2.6 Nutrition Engine (`fitnessBrain/nutritionEngine.ts`)

**Purpose:** Derive macro and hydration targets from profile + metabolism.

**Outputs:** protein (g), fat (g), carbohydrates (g), water (L), fiber (g), disclaimer.

**Knowledge source:** `knowledge/nutritionRules.ts` (protein g/kg by goal, water by body weight, etc.).

---

### 2.7 Training Engine (`fitnessBrain/trainingEngine.ts`)

**Purpose:** Recommend today’s movement type and session framing.

**Outputs:** `TrainingRecommendation` — type (`workout` | `rest` | `light_activity` | `walking`), title, detail, `isTrainingDay`.

**Current logic:**

- Uses training day calendar from profile/lifestyle.
- Picks session template via `knowledge/trainingRules.ts`.
- **New (Phase 8B):** Adjusts recommendation based on **yesterday’s activity requirement** (`nextDayRecommendation`) — e.g. after hard running → walking/light activity; after heavy strength with low recovery → avoid same muscle groups.

---

### 2.8 Recovery Engine (`fitnessBrain/recoveryEngine.ts`)

**Purpose:** Estimate readiness / recovery level from behavior signals.

**Inputs:** consecutive training days, trained yesterday, adherence, sleep hours, exercises completed, activity minutes/intensity today.

**Outputs:** `RecoveryAssessment` — level, score (0–100), summary, disclaimer.

**Current logic:**

- Scoring from `knowledge/recoveryRules.ts`.
- Hard/long logged activities reduce score.
- **New (Phase 8B):** Today’s `activityRequirements.todayPrimary.recoveryNeed` and `energyDemand` further adjust score.

**Important:** This is **not** medical monitoring. Levels like `overtraining_risk` are heuristic wellness signals.

---

### 2.9 Daily Decision Engine (`fitnessBrain/dailyDecisionEngine.ts`)

**Purpose:** Select **one** prioritized daily action (Smart Focus).

**Mechanism:**

1. Build candidate actions with priority scores (hydration, protein, recovery, missed workout, calories, training, post-activity needs, steady progress).
2. Enrich candidates with explainability metadata.
3. Sort by `sortScore`; highest wins.
4. Finalize via explainability layer (localization, confidence, safety filter).

**Candidate examples today:**

- `overtraining_risk`, `recovery_rest`
- `hydration_critical`, `hydration_focus`
- `protein_low`, `protein_focus`
- `post_activity_hydration`, `post_activity_protein`, `post_activity_fuel` *(Phase 8B)*
- `missed_workout`, `calorie_off_track`, `complete_workout`, `steady_progress`

---

### 2.10 Scientific Knowledge Base (`fitnessBrain/knowledge/`)

**Purpose:** Central repository of evidence-tagged rules and numeric thresholds.

**Modules:**

| File | Contents |
|------|----------|
| `evidenceLevels.ts` | Evidence levels (`strong`, `moderate`, `limited`, `heuristic`) and `KnowledgeRule` type |
| `nutritionRules.ts` | Protein thresholds, hydration %, calorie bands, meal timing heuristics |
| `trainingRules.ts` | Frequency rules, session templates, rest-day logic |
| `recoveryRules.ts` | Recovery scoring, overtraining heuristics, summaries |
| `safetyRules.ts` | Disclaimers, general-fitness-only guardrails |

**Design intent:** Engines reference constants and rules here — not hardcoded magic numbers scattered across files.

---

### 2.11 Explainability Layer (`fitnessBrain/explainability/`)

**Purpose:** Make Brain outputs auditable and safe for user-facing copy.

**Components:**

| Module | Function |
|--------|----------|
| `actionRuleMap.ts` | Maps each daily action ID → supporting knowledge rule IDs + human reasons |
| `confidenceEvaluator.ts` | Computes action confidence (`high` / `medium` / `low`) from signal quality |
| `safetyFilter.ts` | Blocks or adjusts unsafe/medical-adjacent messaging |
| `dailyActionFinalizer.ts` | Produces final localized `DailyAction` with explanation block |
| `userSignals.ts` | Snapshots which user signals influenced a decision |

**Dev helper:** `explainFitnessBrainDecision()` exposes full explained state for debugging.

---

### 2.12 Lifestyle Intelligence (`fitnessBrain/lifestyle/`)

**Purpose:** Long-term user context beyond onboarding — work schedule, sleep routine, food preferences, favourite sports, training habits.

**Key files:**

| File | Role |
|------|------|
| `lifestyleProfile.ts` | Typed lifestyle profile schema + `LifestyleIntelligence` |
| `lifestyleStorage.ts` | Persist/load/update lifestyle profile (installation-scoped) |
| `lifestyleEngine.ts` | Merge app profile + logs → patterns + completeness + activity learning |
| `lifePatternEngine.ts` | Detect patterns (usual training days, meal logging, weekday hydration, etc.) |
| `activityLibrary.ts` | **Hidden** activity metadata (MET, muscles, recovery, hydration, protein importance) |
| `brainCompleteness.ts` | 0–100 readiness score from filled lifestyle + behavior factors |
| `i18n/setupStrings.ts` | German lifestyle setup UI strings |
| `i18n/educationStrings.ts` | One-time education copy for lifestyle setup |

**UI touchpoint:** Profile → “Fitness Brain verbessern” → 5-step optional `LifestyleSetupScreen`.

---

### 2.13 Behavior Signals (`fitnessBrain/storage/behaviorSignals.ts`)

**Purpose:** Persistent daily behavior log — foundation for recovery, patterns, and completeness.

**Storage key:** `behavior:daily-logs` (installation-scoped)

**DailyBehaviorLog fields:** date, trained, workoutCompleted, water, protein, calories, sleep, activity count/minutes, last activity ID, activity requirement summary hints.

**Derived signals:** `trainedYesterday`, `consecutiveTrainingDays`, adherence %, protein/calorie progress, missed workout flags.

**Integration:** `buildBrainInput.ts` syncs today’s log from repositories + activity summary on every Brain rebuild.

---

### 2.14 Privacy Guardrail (`fitnessBrain/privacy/`)

**Purpose:** GDPR-friendly, data-minimization architecture for all Brain persistence.

**Components:**

| Module | Role |
|--------|------|
| `privacyRules.ts` | Prohibited fields, allowed lifestyle/profile/health signals, safety-only topics |
| `localInstallationId.ts` | Anonymous UUID per app installation |
| `brainInstallationStorage.ts` | Wraps all Brain payloads with `localInstallationId` |
| `dataMinimization.ts` | Sanitize patches, consent, export, delete, reset |
| `consentTypes.ts` | Consent scopes (`behavior_tracking`, `lifestyle_setup`, etc.) |

**Rules enforced:**

- No name, email, phone, address, diagnoses, medications in Brain storage.
- Activity notes sanitized against medical/injury language.
- Lifestyle patches passed through `sanitizeLifestylePatch()` before save.

---

### 2.15 Local Anonymous Installation Identity

**Purpose:** Correlate Brain data on-device without identifying a person.

**Implementation:**

- Generated on app mount via `ensureLocalInstallationId()` in `App.tsx`.
- Stored separately from Brain payloads.
- All Brain records wrapped as `{ localInstallationId, updatedAt, payload }`.
- Orphaned records from a previous installation ID are ignored on read.

**This is not a user account ID.** It is a device/installation pseudonym.

---

### 2.16 Activity Library (`fitnessBrain/lifestyle/activityLibrary.ts`)

**Purpose:** Hidden canonical metadata for ~20 activities (strength, running, swimming, team sports, combat, yoga, outdoor, etc.).

**Each activity includes:**

- Category, primary muscles, energy system
- MET min/max range
- Recovery priority, hydration importance, protein importance
- Typical duration, suggested recovery hours

**Used by:** Activity logging, activity catalog UI grouping, activity requirements engine, lifestyle hydration emphasis.

**Never shown directly to users** — only labels/icons via `activityCatalog.ts`.

---

### 2.17 Activity Logging (`fitnessBrain/activity/`)

**Purpose:** Fast activity logging (<10 seconds) feeding the Brain.

**Components:**

| Module | Role |
|------|------|
| `activityCatalog.ts` | UI categories, search, icons (German labels) |
| `activityLogEngine.ts` | Build log entries: MET, calories, library metadata, note sanitization |
| `activityLogStorage.ts` | Persist logs, quick repeat, today summary |
| `activityLearningEngine.ts` | Learn favourites, duration, intensity, weekdays (no predictions) |

**UI:** Workout tab → “Aktivität loggen” overlay + “Letztes Training wiederholen”.

---

### 2.18 Brain Completeness (`fitnessBrain/lifestyle/brainCompleteness.ts`)

**Purpose:** Internal 0–100 score indicating how much the Brain “knows” about the user.

**Factors (weighted):**

- Profile core, goal, body measurements
- Lifestyle sections (work, training, sleep, food)
- Training habits known (patterns, activity logs, training days)
- Nutrition habits known (meal logging patterns)
- Sleep habits known

**UI exposure:** Profile lifestyle entry card shows completeness % via `useBrainCompleteness` hook. Not shown on Today screen.

---

### 2.19 Food Knowledge Engine — Foundation (`fitnessBrain/foodKnowledge/`)

**Status:** Architecture + mock adapters only (Phase 8). **Not wired to UI.**

**Purpose:** Future trusted nutrition data pipeline (Open Food Facts, USDA FDC, EU sources, user custom foods).

**Components:**

- `foodTypes.ts` — canonical `FoodKnowledgeItem`, source categories, confidence levels
- `foodSources.ts` — source registry, mock USDA/OFF adapters, user custom food storage
- `foodNutritionNormalizer.ts` — normalize heterogeneous sources → canonical shape
- `foodConfidence.ts` — never present estimates as exact (`~` prefix)
- `foodSearchEngine.ts` — unified local search, barcode lookup (mock), portion scaling

**Note:** Legacy `src/brain/engines/foodKnowledge/` still powers mock meal macros in repositories.

---

### 2.20 Activity Requirement Engine (`fitnessBrain/activityRequirements/`)

**Status:** Implemented (Phase 8B). **Hidden from UI.**

**Purpose:** Understand physiological *meaning* of logged activities — not just calories burned.

**Per activity computes:**

1. Energy demand (`low` → `very_high`)
2. Fueling need (`none` → `balanced_meal`)
3. Protein priority (`low` / `medium` / `high`)
4. Hydration priority
5. Recovery need
6. Muscle group load (from Activity Library)
7. Next-day recommendation (`train_normally`, `light_activity`, `rest_recommended`, `avoid_same_muscle_group`)

**Integrations:**

- `trainingEngine` — yesterday’s next-day recommendation adjusts today’s session type
- `recoveryEngine` — today’s recovery need adjusts score
- `dailyDecisionEngine` — post-activity hydration/protein/fuel candidates
- `behaviorSignals` — stores requirement summary on activity save

---

### 2.21 Legacy Brain (`src/brain/`)

**Still active for presentation layer.**

| Engine | Role |
|--------|------|
| `caloriesEngine` | Calorie targets for daily plan |
| `nutritionEngine` | Macro summation and targets |
| `habitEngine` | Hydration tracking |
| `workoutEngine` | Workout session templates and completion |
| `recommendationEngine` | Coach insight cards |
| `foodKnowledgeEngine` | Seed food catalog portion math |
| `profileEngine` | Profile validation |

**Entry:** `brain/fitnessBrain.ts` → `composeDailyPlan()`, `analyze()`, `getRecommendations()`.

---

### 2.22 Supporting infrastructure

| Component | Path | Role |
|-----------|------|------|
| `buildBrainInput.ts` | Maps repositories + behavior + activity → `UserDataInput` |
| `mapUserData.ts` | Merges app data with behavior signals |
| `i18n/strings.ts` | German Smart Focus action strings |
| `testCases/sampleCases.ts` | Internal Brain scenario runner (dev) |
| `hooks/useFitnessBrain.ts` | React hook + `requestBrainRefresh()` pub/sub |
| `hooks/useActivityLog.ts` | Activity save/repeat + Brain refresh |
| Mock repositories | In-memory profile, meals, exercises, water |

---

## 3. Current UI

### 3.1 Navigation model

**Pre-main flow:** Welcome → Onboarding → Auth → Main app  
**Main app tabs (fixed, 5):**

| Tab | German | English key | Screen |
|-----|--------|-------------|--------|
| Today | Heute | `today` | `TodayScreen` |
| Eat | Essen | `nutrition` | `NutritionScreen` |
| Train | Training | `workout` | `WorkoutScreen` |
| Coach | Coach | `coach` | `CoachScreen` |
| You | Profil | `profile` | `ProfileScreen` |

**Additional surfaces:** Premium modal, Lifestyle Setup overlay, Activity Log flow overlay.

**Default language:** German (`lang` state defaults to `"de"` in `App.tsx`).

---

### 3.2 Today (`TodayScreen`)

**User-facing role:** Single daily anchor — Smart Focus + summary cards.

**What it shows:**

- Greeting + display name (from profile repository, not Brain)
- **Smart Focus card** — title, message, reason from Fitness Brain daily action (German)
- Calorie ring ( eaten / goal / remaining )
- Workout shortcut card
- Water progress bar
- Coach insight teaser

**Brain integration:** ✅ **Canonical Fitness Brain**

- `useFitnessBrain("de")` → `buildFitnessBrainUserData()` → `generateFitnessBrainState()` → localized daily action

**Does NOT yet show:** brain completeness, activity requirements, raw recovery level, lifestyle patterns.

---

### 3.3 Eat (`NutritionScreen`)

**User-facing role:** View today’s meals and remaining calories.

**What it shows:**

- Remaining kcal headline
- Meal list from repository
- Optional nutrition-toned coach insight from daily plan
- “Log food” buttons (**not wired** — onClick empty)

**Brain integration:** ⚠️ **Legacy Brain only (indirect)**

- `useDailyPlan()` → legacy `fitnessBrain.composeDailyPlan()`
- Meal macros from legacy food knowledge engine in mock data
- **Not connected** to `fitnessBrain/foodKnowledge/` foundation

---

### 3.4 Train (`WorkoutScreen`)

**User-facing role:** Today’s structured workout + activity logging.

**What it shows:**

- **Activity logging card** (Phase 7) — log activity, quick repeat, today summary
- Planned workout card (title, progress, start/pause — UI state only)
- Exercise checklist (toggle completion via repository)

**Brain integration:** ✅ **Canonical Fitness Brain (write path)**

- `useActivityLog()` → saves to `activityLogStorage` → syncs behavior signals → `requestBrainRefresh()`
- Workout plan content from legacy daily plan service
- Exercise completion updates mock repository → flows into Brain on next rebuild

**Activity Log Flow:** 4-step overlay (activity → duration → intensity → optional note).

---

### 3.5 Coach (`CoachScreen`)

**User-facing role:** Short daily guidance cards — no chat.

**What it shows:**

- Recovery note from daily plan
- List of coach insight cards (motivation, nutrition, recovery, workout tones)
- CTA to complete today’s workout

**Brain integration:** ⚠️ **Legacy Brain only**

- `coachService` → legacy `fitnessBrain.getRecommendations()`
- Does **not** read canonical Fitness Brain daily action or activity requirements

---

### 3.6 You / Profile (`ProfileScreen`)

**User-facing role:** Identity summary, Brain improvement entry, settings.

**What it shows:**

- Display name, email, streak, goal (from profile repository — includes PII in UI layer)
- Body stats (weight, age, height, activity level)
- **“Fitness Brain verbessern”** card with completeness %
- Lifestyle growth placeholders
- Language switcher (EN / AR / DE)
- Premium entry

**Brain integration:** ✅ **Canonical Fitness Brain (partial)**

- `useBrainCompleteness()` → lifestyle completeness score
- `LifestyleSetupScreen` → writes to `lifestyleStorage` via `updateLifestyleProfile()` with privacy sanitization

**Not yet on Profile:** data export/delete UI, consent management UI, privacy policy surface.

---

### 3.7 Brain integration summary by screen

| Screen | Canonical `fitnessBrain/` | Legacy `brain/` | Writes Brain data |
|--------|---------------------------|-----------------|-------------------|
| Today | ✅ Smart Focus | ✅ Plan cards | ❌ |
| Eat | ❌ | ✅ Plan/meals | ❌ (log not wired) |
| Train | ✅ Activity logs | ✅ Workout plan | ✅ Activity + exercises |
| Coach | ❌ | ✅ Insights | ❌ |
| Profile | ✅ Completeness, lifestyle | ❌ | ✅ Lifestyle setup |

---

## 4. Hidden Brain Layers

These layers are **intentionally invisible** to the user. They exist to improve decisions, not to add UI complexity.

### 4.1 Layer inventory

```
┌─────────────────────────────────────────────────────────────┐
│                    USER-FACING SURFACE                         │
│  Today Smart Focus · Tab summaries · Activity log overlay    │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│              DAILY DECISION + EXPLAINABILITY                   │
│  dailyDecisionEngine · actionRuleMap · safetyFilter          │
└────────────────────────────┬────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼───────┐  ┌─────────▼─────────┐  ┌──────▼──────┐
│ TRAINING      │  │ RECOVERY          │  │ NUTRITION   │
│ ENGINE        │  │ ENGINE            │  │ + METABOLISM  │
└───────┬───────┘  └─────────┬─────────┘  └──────┬──────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│           ACTIVITY REQUIREMENTS (Phase 8B)                     │
│  energy · fueling · protein · hydration · recovery · muscles  │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│        LIFESTYLE + PATTERNS + ACTIVITY LEARNING                │
│  lifePatternEngine · activityLearningEngine · completeness   │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│   ACTIVITY LIBRARY + ACTIVITY LOGS + BEHAVIOR SIGNALS          │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│   FOOD KNOWLEDGE (foundation) · USER PROFILE · KNOWLEDGE BASE  │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│   PRIVACY · INSTALLATION ID · CONSENT · DATA MINIMIZATION      │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 How hidden layers cooperate (example)

**User logs 60 minutes hard running on Train tab:**

1. **Activity Log Engine** builds rich entry (MET, calories, library metadata, installation ID).
2. **Activity Requirement Engine** computes high energy demand, carb-focused fueling, high hydration, elevated recovery, leg muscle load, next-day light/avoid-legs recommendation.
3. **Behavior Signals** updates today’s log (`trained: true`, activity minutes, requirement hints).
4. **Activity Learning Engine** updates favourite activities, typical duration, active weekdays.
5. **Life Pattern Engine** may reinforce usual training days pattern.
6. **Recovery Engine** lowers today’s recovery score.
7. **Daily Decision Engine** may surface `post_activity_hydration` or `post_activity_fuel` as Smart Focus on Today.
8. **Next day:** Training Engine reads yesterday’s `nextDayRecommendation` → suggests walking/light activity instead of hard leg workout.

The user only saw: *four taps → “Gespeichert — Fitness Brain lernt mit.”*

### 4.3 What stays hidden permanently

- Raw MET values, rule IDs (available in dev explain helper only)
- Activity Library metadata fields
- Evidence levels and source categories (unless future “Why?” UI is added)
- Brain completeness factor breakdown (only total % on Profile)
- Food source attribution and confidence (until meal UI exists)
- `localInstallationId`

---

## 5. Data Flow

### 5.1 Primary read path (Today Smart Focus)

```
User opens app
    ↓
ensureLocalInstallationId()
    ↓
useFitnessBrain() effect
    ↓
buildFitnessBrainUserData()
    ├── getBrainInput()          ← mock repositories (profile, meals, exercises, water)
    ├── getTodayActivitySummary()
    ├── getRecentActivityLogs()
    ├── syncDailyBehaviorLog()
    ├── buildLifestyleIntelligence()
    ├── computeBehaviorSignals()
    └── mapAppDataToUserData()
    ↓
generateFitnessBrainState(userData, { behaviorLogs, activityLogs })
    ├── buildUserProfile()
    ├── buildActivityRequirementContext()
    ├── calculateMetabolism()
    ├── calculateNutrition()
    ├── generateTraining()       ← uses yesterday activity requirements
    ├── assessRecovery()         ← uses today activity requirements
    └── generateDailyAction()    ← uses activity requirements for post-activity candidates
    ↓
localizeDailyAction() → German strings
    ↓
TodayScreen Smart Focus card
```

### 5.2 Activity log write path

```
User completes ActivityLogFlow
    ↓
useActivityLog.logActivity()
    ├── grantConsent("behavior_tracking")
    ├── buildActivityLogEntry()     ← privacy note sanitization
    ├── saveActivityLog()           ← localStorage installation-scoped
    ├── computeActivityRequirementFromLog()
    └── syncDailyBehaviorLogFromActivities()
    ↓
requestBrainRefresh()
    ↓
All mounted useFitnessBrain hooks rebuild state
    ↓
Today Smart Focus may change on next view
```

### 5.3 Lifestyle setup write path

```
Profile → Lifestyle Setup → save
    ↓
updateLifestyleProfile(patch)
    ├── sanitizeLifestylePatch()    ← privacy guardrail
    └── writeInstallationScoped()
    ↓
useBrainCompleteness.refresh()
    ↓
Next Brain rebuild uses updated lifestyle + patterns
```

### 5.4 Legacy daily plan path (Eat / Train / Coach cards)

```
useDailyPlan() / coachService
    ↓
getBrainInput()
    ↓
src/brain/fitnessBrain.composeDailyPlan() / getRecommendations()
    ├── caloriesEngine, nutritionEngine, habitEngine, workoutEngine
    └── recommendationEngine
    ↓
DailyPlan / CoachInsight[] → UI cards
```

### 5.5 Storage keys (canonical Brain)

| Key | Content |
|-----|---------|
| `localInstallationId` | Anonymous installation UUID |
| `lifestyle:profile` | Lifestyle profile |
| `behavior:daily-logs` | Daily behavior signals |
| `activity:logs` | Activity log entries |
| `food:user-custom` | User-defined foods |
| `privacy:consent-records` | Consent scopes |

All Brain keys (except installation ID wrapper) use `brainInstallationStorage` scoping.

---

## 6. Privacy

### 6.1 Anonymous local installation ID

- Generated client-side on first launch.
- Persists in local storage.
- Attached to every Brain write.
- **Does not** represent a person, account, email, or device fingerprint.
- Can be reset via `resetLocalBrainData(..., { resetInstallationId: true })`.

### 6.2 GDPR-friendly architecture (current state)

| Principle | Implementation |
|-----------|----------------|
| Data minimization | Allow-lists for profile, lifestyle, health signals |
| Purpose limitation | `getDataPurpose()` documents why each field exists |
| Storage limitation | Behavior logs capped (~30 days); activity logs capped (200 entries) |
| Transparency (foundation) | Consent record types defined; UI not fully built |
| Right to export | `exportBrainData()` JSON bundle |
| Right to erasure | `deleteBrainData()` / `resetLocalBrainData()` by scope |
| No personal identity in Brain | `FORBIDDEN_PII_FIELDS`, regex block patterns |

### 6.3 What Brain never stores

- Name, email, phone, address, IP, geolocation
- Diagnoses, medications, diseases, eating disorder flags
- Pain descriptions, injury details (activity notes filtered)
- Medical history, clinical records

### 6.4 What UI still shows (outside Brain)

Profile screen displays `displayName` and `email` from **profile repository** — this is presentation-layer mock data today, not written into Brain storage layers.

### 6.5 Export / delete / reset

**Export:** `exportBrainData()` returns JSON with consent, lifestyle, behavior logs, activity logs, user custom foods, meta disclaimer.

**Delete scopes:**

- `all_brain_data`
- `lifestyle_only`
- `behavior_logs_only`
- `consent_only`

**Reset:** `resetLocalBrainData()` alias; optionally regenerates installation ID.

**Gap:** No Profile UI for export/delete yet — APIs exist in code.

---

## 7. Implemented Features

Legend: ✅ Completed · 🔄 In Progress · ⬜ Not Started

### 7.1 Core Brain

| Feature | Status |
|---------|--------|
| Fitness Brain orchestrator (`generateFitnessBrainState`) | ✅ |
| User Profile Engine | ✅ |
| Metabolism Engine (Mifflin–St Jeor) | ✅ |
| Nutrition Engine | ✅ |
| Training Engine | ✅ |
| Recovery Engine | ✅ |
| Daily Decision Engine (single Smart Focus) | ✅ |
| Scientific Knowledge Base | ✅ |
| Explainability layer | ✅ |
| Brain sample test cases (dev) | ✅ |
| `buildBrainInput` pipeline | ✅ |

### 7.2 Lifestyle & learning

| Feature | Status |
|---------|--------|
| Lifestyle profile storage | ✅ |
| Optional Lifestyle Setup UI (5 steps) | ✅ |
| Life pattern detection (foundation) | ✅ |
| Brain completeness score | ✅ |
| Activity Library (hidden metadata) | ✅ |
| Activity learning (no predictions) | ✅ |

### 7.3 Activity

| Feature | Status |
|---------|--------|
| Activity logging UI (<10 sec flow) | ✅ |
| Activity log persistence | ✅ |
| Quick repeat last workout | ✅ |
| Activity catalog + search | ✅ |
| Activity → behavior signal sync | ✅ |
| Activity Requirement Engine | ✅ |

### 7.4 Food

| Feature | Status |
|---------|--------|
| Food Knowledge architecture (Phase 8) | ✅ |
| Mock USDA / Open Food Facts adapters | ✅ |
| User custom food storage | ✅ |
| Meal logging UI | 🔄 (buttons exist, not wired) |
| Barcode scanning | ⬜ |
| Live API integrations (OFF, USDA) | ⬜ |
| Wire foodKnowledge → Eat tab | ⬜ |

### 7.5 Privacy & compliance

| Feature | Status |
|---------|--------|
| Privacy rules + prohibited fields | ✅ |
| Installation-scoped storage | ✅ |
| Consent type architecture | ✅ |
| Data export/delete APIs | ✅ |
| Privacy UI (export/delete/consent) | ⬜ |
| Activity note medical filtering | ✅ |

### 7.6 UI & product shell

| Feature | Status |
|---------|--------|
| Welcome / Onboarding / Auth flow | ✅ |
| 5-tab main navigation | ✅ |
| Today screen + Smart Focus | ✅ |
| Eat screen (read-only meals) | ✅ |
| Train screen + exercises | ✅ |
| Activity log overlay | ✅ |
| Coach screen | ✅ |
| Profile + lifestyle entry | ✅ |
| Premium screen (shell) | ✅ |
| German default UI | ✅ |
| Multi-language shell (EN/AR/DE) | 🔄 |

### 7.7 Legacy brain & data

| Feature | Status |
|---------|--------|
| Legacy daily plan composition | ✅ |
| Legacy coach recommendations | ✅ |
| Legacy food catalog (seed) | ✅ |
| Real backend / auth | ⬜ |
| Persistent repositories (non-mock) | ⬜ |

### 7.8 Planned but not started

| Feature | Status |
|---------|--------|
| Meal Intelligence | ⬜ |
| Weight Trend Engine | ⬜ |
| Sleep Intelligence (logging UI) | ⬜ |
| Coach Intelligence (canonical Brain) | ⬜ |
| Habit Engine (canonical) | ⬜ |
| Prediction Engine | ⬜ |
| Wearables integration | ⬜ |
| AI rephrase layer | ⬜ |
| Unified Brain (deprecate legacy `src/brain/`) | ⬜ |

---

## 8. Planned Features

The following components are part of the long-term Fitness Brain roadmap. Items marked **(foundation exists)** have partial architecture today.

### 8.1 Nutrition & food

| Component | Description |
|-----------|-------------|
| **Food Knowledge Engine** *(foundation exists)* | Trusted sources, normalization, confidence, barcode path |
| **Meal Intelligence** | Meal timing, macro gap closure, post-workout meal suggestions |
| **Meal logging UX** | Fast log flow wired to foodKnowledge + Brain |
| **Recipe / composite meals** | Combine foods; optional user recipes |

### 8.2 Activity & training

| Component | Description |
|-----------|-------------|
| **Activity Requirement Engine** *(implemented)* | Physiological context from activities |
| **Workout Intelligence** | Connect structured workout completion → requirements |
| **Periodization hints** | Weekly load balance from logs (rule-based, not AI) |

### 8.3 Body & recovery

| Component | Description |
|-----------|-------------|
| **Weight Trend Engine** | Smoothed trends, goal progress, Brain completeness factor |
| **Sleep Intelligence** | Optional sleep logging, recovery integration |
| **Hydration Intelligence** | Beyond daily liters — activity-adjusted targets surfaced simply |

### 8.4 Behavior & habits

| Component | Description |
|-----------|-------------|
| **Habit Engine (canonical)** | Replace/merge legacy habitEngine; streak semantics, adherence |
| **Life Pattern predictions** | Move from detection → gentle forecasts (still rule-based first) |
| **Prediction Engine** | Long-horizon behavior forecasts (last stage before AI) |

### 8.5 Coach & guidance

| Component | Description |
|-----------|-------------|
| **Coach Intelligence** | Single canonical insight pipeline from Fitness Brain state |
| **AI rephrase layer (optional)** | Rephrase rule-based messages only — never calculate |
| **Notification intelligence** | When to nudge — tied to daily action, not spam |

### 8.6 Platform & integrations

| Component | Description |
|-----------|-------------|
| **Wearables** | Read-only signals (steps, HR, sleep) with strict privacy |
| **Backend sync (optional)** | Encrypted sync without PII in Brain payload |
| **Unified Brain migration** | Deprecate `src/brain/`; one compose path |

### 8.7 Compliance & trust

| Component | Description |
|-----------|-------------|
| **Privacy UI** | Export, delete, consent toggles on Profile |
| **In-app privacy policy surface** | Linked from consent records |
| **Audit log (local)** | User-visible history of what Brain stored |

---

## 9. Recommended Development Order

Recommended sequence based on current architecture, dependencies, and the principle that **each phase should make the Brain smarter without adding UI complexity**.

### Phase 9 — Unify Brain pipelines (highest priority)

**Why first:** Today uses canonical Brain; Eat/Train/Coach use legacy Brain. Two sources of truth will diverge and confuse every future feature.

**Work:**

- Route `dailyPlanService` and `coachService` through `generateFitnessBrainState()` or a thin `composeDailyPlanFromBrainState()` adapter.
- Deprecate duplicate calorie/macro logic in `src/brain/engines/`.
- Keep UI unchanged — swap data source only.

---

### Phase 10 — Meal logging + Food Knowledge wiring

**Why second:** Nutrition is half the product vision; foodKnowledge foundation exists but is unused. Activity requirements already emit fueling/protein priorities — meal logging completes the loop.

**Work:**

- Fast meal log flow on Eat tab (mirror activity log speed).
- Wire `fitnessBrain/foodKnowledge` search + portion scaling.
- Persist meal logs installation-scoped; sync behavior signals (calories, protein).
- Smart Focus already has protein/calorie candidates — they become accurate.

---

### Phase 11 — Meal Intelligence

**Why third:** Requires reliable meal logs + activity requirements.

**Work:**

- Post-activity meal suggestions (rule-based: carb-focused after endurance, protein after strength).
- Time-of-day meal gap detection.
- Hidden layer only — surfaces through Smart Focus and optional Eat hints.

---

### Phase 12 — Coach Intelligence (canonical)

**Why fourth:** Coach tab should reflect the same Brain as Today, not legacy recommendations.

**Work:**

- Generate coach cards from `FitnessBrainState` (recovery, training, nutrition focus, activity context).
- Remove dependency on legacy `recommendationEngine` for primary insights.

---

### Phase 13 — Weight Trend Engine

**Why fifth:** Needs persistent weight log storage; improves metabolism accuracy and completeness over time.

**Work:**

- Minimal weight log entry on Profile (not a chart-heavy UI).
- Trend smoothing + goal alignment in hidden layer.
- Feed brain completeness + optional daily action candidates.

---

### Phase 14 — Sleep Intelligence

**Why sixth:** Recovery engine already accepts `sleepHours`; lifestyle profile has bedtime/wake time. Missing piece is optional daily sleep log UX.

**Work:**

- Optional one-tap sleep quality/duration log.
- Integrate with recovery + activity requirements for next-day training.

---

### Phase 15 — Habit Engine (canonical)

**Why seventh:** Legacy `habitEngine` handles hydration only. Canonical habit engine should unify water, logging streaks, and adherence semantics used by behavior signals.

---

### Phase 16 — Privacy UI + consent surfaces

**Why eighth:** APIs exist; users cannot yet self-serve export/delete. Required before backend or EU scale.

---

### Phase 17 — Wearables (read-only)

**Why late:** Adds signal diversity but high privacy/review burden. Rule-based Brain must be stable first.

---

### Phase 18 — Prediction Engine

**Why late:** Activity learning and life patterns explicitly avoid predictions today. Predictions require sufficient logged data + validated rules.

---

### Phase 19 — AI rephrase layer (optional)

**Why last:** Must never compute nutrition/training/recovery. Only rephrase deterministic Brain outputs if product requires conversational tone.

---

## 10. Technical Debt

### 10.1 Dual Brain architecture

**Issue:** `src/brain/` and `src/fitnessBrain/` coexist with overlapping responsibilities (calories, nutrition, hydration, recommendations).

**Impact:** Duplicate logic, inconsistent Today vs Coach vs Eat, higher maintenance cost.

**Recommendation:** Unified adapter layer; delete legacy engines after parity tests.

---

### 10.2 Mock repositories only

**Issue:** All user data is in-memory mock (`mockRepositories.ts`). Refresh loses exercise toggles except what's in localStorage Brain layers.

**Impact:** Cannot ship production; Brain integration testing limited.

---

### 10.3 Profile PII outside Brain guardrails

**Issue:** Profile repository stores email/displayName; UI shows them. Brain correctly excludes them, but boundary is unclear for future backend sync.

**Recommendation:** Document PII boundary: UI account layer vs Brain wellness layer.

---

### 10.4 Food system duplication

**Issue:** `src/brain/engines/foodKnowledge/` (legacy seed catalog) vs `src/fitnessBrain/foodKnowledge/` (new architecture).

**Recommendation:** Migrate mock meals to new food IDs; remove legacy catalog.

---

### 10.5 Brain refresh model

**Issue:** `useFitnessBrain` uses pub/sub refresh; other hooks (`useDailyPlan`, `useCoachInsights`) do not auto-refresh on activity log.

**Impact:** Today updates after activity log; Eat/Coach cards may show stale targets until reload.

---

### 10.6 Incomplete i18n

**Issue:** Smart Focus has DE + partial EN; AR/TR/UK/FA placeholders empty. Activity logging German-only strings.

---

### 10.7 No automated test runner

**Issue:** `sampleCases.ts` exists but no CI test suite for Brain regression.

---

### 10.8 Consent UI not wired

**Issue:** Consent granted programmatically on activity save; user cannot view/manage consent in Profile.

---

### 10.9 `generateFitnessBrainState` double recovery pass

**Issue:** Preliminary recovery computed for activity requirement context, then full recovery computed again. Minor inefficiency; could be refactored to single pass.

---

## 11. Risks

### 11.1 Architectural risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Dual Brain divergence | High | Phase 9 unification |
| Hidden layer coupling without contracts | Medium | Document context types; add integration tests |
| Legacy brain re-expansion | Medium | Freeze `src/brain/` except bugfixes until migration |

### 11.2 Performance risks

| Risk | Severity | Notes |
|------|----------|-------|
| Full Brain rebuild on every refresh | Low–Medium | Acceptable now; may need memoization if logs grow |
| localStorage read/write on every log | Low | Caps exist (30-day behavior, 200 activities) |
| Synchronous Brain on main thread | Low | Watch if food search catalog grows with live APIs |

### 11.3 Privacy risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Profile PII conflated with Brain export | Medium | Separate export bundles: account vs Brain |
| User custom food names containing medical text | Low | Extend sanitization to food names |
| Missing consent UI | Medium | Phase 16 |
| localStorage accessible on shared devices | Medium | Document device-level risk; future optional PIN |

### 11.4 Maintainability risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Rule sprawl across engines | Medium | Keep knowledge base as single threshold source |
| Explainability map drift | Medium | Require actionRuleMap entry for every new daily action ID |
| German/English string duplication | Low | Consolidate i18n when adding meal UI |

### 11.5 Product / legal risks

| Risk | Severity | Notes |
|------|----------|-------|
| Medical adjacency in user notes | Medium | Sanitization exists; monitor new input surfaces |
| Implied precision of calorie/MET estimates | Medium | foodConfidence + activity estimates must stay labeled internal |
| GDPR if backend added without design | High | Keep Brain payload pseudonymous; DPIA before sync |

---

## 12. Overall Project Progress

### 12.1 Methodology

Estimates are based on:

- Implemented modules under `src/fitnessBrain/` vs full roadmap (Sections 7–8)
- UI surfaces built vs wired to canonical Brain
- Production readiness (mock data, dual brain, missing meal log, no backend)
- Phases completed in conversation history (Phases 2–8B)

Percentages are **engineering completeness toward the stated long-term vision**, not marketing readiness.

---

### 12.2 Brain completion: **~52%**

| Area | Weight | Completion | Notes |
|------|--------|------------|-------|
| Core engines | 20% | 95% | All primary engines exist |
| Knowledge + explainability | 15% | 90% | Strong foundation |
| Lifestyle + patterns | 15% | 75% | Detection only, no predictions |
| Behavior + activity | 15% | 85% | Logging + learning + requirements |
| Food intelligence | 15% | 25% | Architecture only |
| Coach/habit/sleep/weight | 10% | 10% | Mostly planned |
| Platform (wearables, AI, sync) | 10% | 0% | Not started |
| Unification / production hardening | — | −10% penalty | Dual brain + mocks |

**Weighted estimate ≈ 52%**

---

### 12.3 UI completion: **~58%**

| Area | Completion | Notes |
|------|------------|-------|
| Navigation + shell | 90% | 5 tabs, flow, premium |
| Today | 85% | Smart Focus wired; could show more Brain hints |
| Train | 80% | Workout + activity log |
| Profile | 70% | Lifestyle setup; no privacy tools |
| Eat | 45% | Read-only; log not wired |
| Coach | 50% | Legacy brain content |
| Onboarding/auth | 60% | UI exists; not connected to real auth |

**Average ≈ 58%** toward a complete user-facing product.

---

### 12.4 Overall application: **~50%**

Combined product readiness toward MVP launch:

```
Overall ≈ (Brain × 0.55) + (UI × 0.45)
        ≈ (52 × 0.55) + (58 × 0.45)
        ≈ 28.6 + 26.1
        ≈ 55% → rounded conservatively to ~50% accounting for:
           - no backend
           - dual brain split
           - no meal logging
           - no privacy UI
           - mock-only persistence for core app data
```

**Conservative overall estimate: ~50%**

---

### 12.5 What “100%” means for FitnessAI

The project reaches engineering completion when:

1. **Single canonical Brain** powers all tabs and services.
2. **User can log** activities, meals, water, weight, and optional sleep in under 10 seconds each.
3. **Smart Focus** reflects unified state across nutrition, training, recovery, and habits.
4. **Food Knowledge** uses trusted sources with confidence labeling.
5. **Privacy UI** supports export, delete, and consent.
6. **Persistent storage** replaces mocks; Brain remains installation-scoped and pseudonymous.
7. **Explainability** covers every user-visible recommendation.
8. **Optional** wearables and AI rephrase layers do not replace rule-based core.

---

## Appendix A — Key file reference

| Concern | Path |
|---------|------|
| Brain entry | `src/fitnessBrain/fitnessBrain.ts` |
| Smart Focus hook | `src/hooks/useFitnessBrain.ts` |
| Brain input builder | `src/fitnessBrain/buildBrainInput.ts` |
| Daily action | `src/fitnessBrain/dailyDecisionEngine.ts` |
| Activity logs | `src/fitnessBrain/activity/activityLogStorage.ts` |
| Activity requirements | `src/fitnessBrain/activityRequirements/` |
| Food knowledge | `src/fitnessBrain/foodKnowledge/` |
| Privacy | `src/fitnessBrain/privacy/` |
| Legacy daily plan | `src/brain/fitnessBrain.ts` |
| Mock data | `src/data/repositories/mockRepositories.ts` |
| Master doc | `docs/FITNESSAI_PROJECT_STATUS_REPORT.md` |

---

## Appendix B — Phase history (engineering log)

| Phase | Topic | Status |
|-------|-------|--------|
| 2 | Persistent behavior signals | ✅ |
| 3 | Scientific knowledge base | ✅ |
| 4 | Explainable brain decisions | ✅ |
| 5 | User lifestyle intelligence | ✅ |
| 6 | Optional lifestyle setup UI | ✅ |
| — | Privacy guardrail + installation ID | ✅ |
| 7 | Activity logging experience | ✅ |
| 8 | Food knowledge foundation | ✅ |
| 8B | Activity requirement engine | ✅ |

---

*End of report.*
