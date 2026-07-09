# FitnessAI Product Experience Review

**Date:** July 2026  
**Scope:** UX refinement across all screens — no visual identity change, no bottom nav change, no new features

---

## Executive Summary

FitnessAI now reads as **one coherent product** where each tab has a single responsibility. Fitness Brain powers every screen invisibly; duplication between Today and Coach is removed. Onboarding is shorter and smarter — activity level is no longer asked manually.

---

## Screen Responsibilities (Final)

| Tab | Single question | Responsibility |
|-----|-----------------|----------------|
| **Today** | What should I do today? | Priority, reason, next action, compact progress |
| **Eat** | How is my nutrition today? | Nutrition assistant — focus, macros, water, meal timeline |
| **Train** | What am I doing physically? | Fast activity log, today's workout, recovery impact |
| **Coach** | Why does today look like this? | Explainability — signals, recovery, body, patterns, knowledge |
| **Profile** | Who am I & how is my Brain? | Identity, Brain status, privacy, lifestyle, settings |

---

## Screens Reviewed & Changes Made

### 1. Welcome

**Reviewed:** `WelcomeScreen.tsx`

**Changes:**
- Clearer value proposition: daily help without complicating life
- Explains that Fitness Brain plans; user only logs what matters
- Calories and targets are calculated automatically

**Why it improves UX:** First screen now answers “what is this?” in one breath — reduces onboarding anxiety.

---

### 2. Goal Selection

**Reviewed:** `OnboardingScreen.tsx` step 0

**Changes:**
- One goal only (unchanged) with richer per-goal descriptions
- Explains why Fitness Brain needs the goal
- Note that goal can be changed later in Profile

**Why it improves UX:** Users understand the “why” behind data collection; no fear of locking in a wrong choice.

---

### 3. Basic Profile

**Reviewed:** `OnboardingScreen.tsx` step 1

**Changes:**
- Kept: gender, age, height, weight, goal (goal on step 0)
- No BMI, calories, or body fat — copy states Brain calculates metabolism
- Sliders **and** manual numeric inputs for age, height, weight
- Explains values are for metabolism calculation only

**Why it improves UX:** Precision without friction; no pseudo-science fields the user cannot know accurately.

---

### 4. Activity Level — Removed

**Reviewed:** Former onboarding step 2

**Changes:**
- **Removed** activity level screen entirely
- Default `activityLevel: "mod"` saved on onboarding complete
- Copy on profile step: Brain will estimate from training, work, lifestyle, and logs

**Why it improves UX:** Users no longer guess something Brain learns better automatically — aligns with “invisible engine” principle.

**Onboarding flow:** Welcome → Goal → Profile → Auth (2 steps, was 3)

---

### 5. Today

**Reviewed:** `TodayScreen.tsx`

**Removed duplication:**
- ❌ Coach insight preview card (duplicate of Smart Focus)
- ❌ Separate large calorie card + separate water card

**Kept / refined:**
- ✅ Smart Focus — priority, message, reason (WHAT)
- ✅ Compact “Today's progress” — calories ring + water + protein bars
- ✅ Next action — workout card
- ✅ Subtle “Why this guidance?” link → Coach (not a repeated recommendation)

**Why it improves UX:** Today answers one question only. No repeated Brain output. Progress visible without competing cards.

---

### 6. Eat

**Reviewed:** `NutritionScreen.tsx` + new `nutritionAssistantAdapter.ts`

**Changes:**
- Reframed as **Nutrition Assistant** (not just a logger)
- Today's nutrition focus from Fitness Brain
- Full macro panel: calories, protein, carbs, fat, water
- Meal timeline with protein per meal
- Quiet Brain hint (one line) — protein, hydration, recovery, activity — not overwhelming
- ❌ Removed coach insight duplicate card

**Why it improves UX:** Eat owns nutrition context; Brain evaluates silently; user sees focus + numbers + meals in one place.

---

### 7. Training

**Reviewed:** `WorkoutScreen.tsx`

**Changes:**
- Fast activity log preserved (<10 seconds, quick repeat)
- ✅ Recovery impact card from Brain
- ✅ Next recommendation from `state.training.detail`
- Today's workout hero + exercise list unchanged

**Why it improves UX:** Training tab connects activity to recovery without sending user to Coach or Today for the same info.

---

### 8. Coach — Redefined

**Reviewed:** `CoachScreen.tsx` + new `coachExplanationAdapter.ts`

**Before:** Repeated daily action + protein/hydration nudges + workout CTA — overlapped Today

**After:**
- Purpose: **WHY**, not WHAT
- New adapter: `generateCoachExplanations()` uses explainability, recovery, body engine, lifestyle patterns, activity impact, knowledge rules
- ❌ No daily action title/message repeat
- ❌ No workout “Next up” CTA
- ❌ No chat / AI conversation
- Explanation steps shown when available

**Why it improves UX:** Coach becomes the reasoning layer — premium feel, zero duplication with Today.

---

### 9. Profile

**Reviewed:** `ProfileScreen.tsx` + new `ProfilePrivacySection.tsx`

**Changes:**
- Brain completeness with **what Brain knows** vs **what can improve**
- At 100%: lifestyle card copy shifts to “Adjust lifestyle & goals” (not “Improve Brain”)
- Replaced activity level stat with **Goal** (more actionable)
- Removed static “Grows with you” placeholder rows

**Why it improves UX:** Profile is the Brain management hub — status is transparent, not a black box.

---

### 10. Privacy — Moved to Profile

**Reviewed:** `ProfilePrivacySection.tsx` wired to `fitnessBrain/privacy/`

**Added to Profile:**
- Export data (JSON download)
- Delete Brain data
- Reset Fitness Brain
- Consent grant + status
- Privacy disclaimer from knowledge layer

**Why it improves UX:** Privacy controls live where users expect them — no orphan architecture-only module.

---

## Removed Duplication

| Content | Was on | Now only on |
|---------|--------|-------------|
| Daily action / Smart Focus | Today ×2, Coach #1, Eat (nutrition tone) | **Today** (WHAT) |
| Daily action reasoning | Coach (as repeat) | **Coach** (WHY only) |
| Calorie remaining hero | Today + Eat | **Today** (compact) + **Eat** (full macros) |
| Protein / hydration nudges | Coach cards | **Eat** (quiet hint) + **Today** (progress bars) |
| Workout session CTA | Today, Coach “Next up”, Train | **Today** (next action) + **Train** (full session) |
| Recovery note | Coach, Train | **Train** (impact) + **Coach** (context explanation) |
| Activity level question | Onboarding | **Removed** — Brain defaults + learns |

---

## Updated User Journey

```
Welcome
  → "Daily help without complication"
  → Get started

Onboarding (2 steps)
  → Goal (one focus, changeable later)
  → Profile (gender, age, height, weight — Brain calculates the rest)
  → Auth

Main app
  → Today: "What should I do today?" + progress + next action
  → Eat: nutrition focus + macros + meals
  → Train: log activity + workout + recovery
  → Coach: "Why does today look like this?"
  → Profile: identity + Brain status + privacy + lifestyle setup

Optional (Profile)
  → Lifestyle setup (work, training, sleep, food)
  → Brain completeness increases → better personalization
```

---

## Architecture Alignment

| Layer | Role in UX |
|-------|------------|
| `runBrainPipeline()` | Single source for all tab data |
| `nutritionAssistantAdapter` | Eat tab view model |
| `coachExplanationAdapter` | Coach tab view model (WHY) |
| `composeDailyPlan` | Today progress + workout presentation |
| `useFitnessBrain` | Today Smart Focus |
| `fitnessBrain/privacy` | Profile privacy controls |

---

## Files Changed

| File | Change |
|------|--------|
| `screens/welcome/WelcomeScreen.tsx` | Onboarding messaging |
| `screens/onboarding/OnboardingScreen.tsx` | 2-step flow, goal copy, numeric inputs, no activity |
| `screens/today/TodayScreen.tsx` | Deduped cards, compact progress |
| `screens/nutrition/NutritionScreen.tsx` | Nutrition assistant |
| `screens/workout/WorkoutScreen.tsx` | Recovery + next recommendation |
| `screens/coach/CoachScreen.tsx` | WHY-only purpose |
| `screens/profile/ProfileScreen.tsx` | Brain status, privacy |
| `screens/profile/ProfilePrivacySection.tsx` | **New** — privacy controls |
| `presentation/coachExplanationAdapter.ts` | **New** — Coach WHY layer |
| `presentation/nutritionAssistantAdapter.ts` | **New** — Eat tab Brain view |
| `services/coachService.ts` | Uses explanation adapter |
| `hooks/useBrainCompleteness.ts` | Returns completeness factors |
| `App.tsx` | Coach screen props cleanup |

---

## What Was NOT Changed

- Bottom navigation (5 tabs, same labels)
- Visual identity (colors, gradients, GCard, typography)
- Core logging flows (meals, activities, exercises)
- Premium screen
- Lifestyle setup overlay structure

---

## Remaining UX Opportunities (Non-blocking)

1. Wire “Log food” buttons on Eat (still stub handlers — pre-existing)
2. Goal change UI inside Profile / Lifestyle setup
3. Localize new copy strings into `translations.ts` (currently inline EN/DE/AR)
4. Merge `useDailyPlan` + `useFitnessBrain` on Today into single hook
5. Activity level display on Profile could show “Estimated by Brain” when inferred from logs

---

## Verification

- `npm run build` passes
- No bottom nav changes
- No new features — reorganization and copy only
- Each tab has one clear job; Fitness Brain is the invisible engine throughout
