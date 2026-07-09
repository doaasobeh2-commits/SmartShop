# RecipeAI

**Role:** Meal lens · **Maturity:** alpha (UI in progress) · **Path:** `apps/RecipeAI/`

## One question

**Tonight:** What should we cook tonight?

## What it is

Household **meal decision engine** — not a recipe library. The decision and the household are the product; the recipe is the answer.

**Master vision:** [`apps/RecipeAI/docs/MASTER_PRODUCT_VISION.md`](../apps/RecipeAI/docs/MASTER_PRODUCT_VISION.md)

## Core loop

Tonight → Preview → Cook → Feedback → (optional shop handoff) → SmartShop → pantry refresh

## Consumer screens (V1)

| Screen | Role |
|--------|------|
| Welcome | First launch — kitchen atmosphere |
| Food Preferences | Allergies only |
| Weekly Plan opt-in | Yes / Not now (never ask again) |
| **Tonight** | Home — one recommendation |
| Recipe Preview | Hero + intelligent inventory |
| Cook Mode | Dark premium cookbook (only dark screen) |
| Feedback | Loved it / It was good / Not for us |
| Weekly Plan | Optional — 7 days, one meal each |

**Secondary (not home):** Cook With What I Have

## Platform overrides blueprint

| Blueprint | Platform / Master vision |
|-----------|--------------------------|
| 7-step onboarding | Welcome + allergies + weekly opt-in only |
| 3-meal picker | 1 recommendation + swap |
| S3 Week screen | Optional planner if opted in; whisper on Tonight otherwise |
| S9 Settings | SmartShop owns household |
| Chat AI | Never — Premium = contextual cook assistant only (Cook Mode, no history) |
| Min 3 liked meals | Infer from behavior |
| Fitness integration | Out of v1 |

## Owns

Tonight engine · allergen gate (fail-closed) · cook mode · feedback memory · shop handoff · curated catalog (engine-only)

## Consumes from SmartShop

Household setup · hidden inventory · preferences · offers · `householdId`

## Content

Curated ~50 recipes per major cuisine — engine data, not browse UI. Quality over quantity.

## Full implementation spec

- Logic: [`apps/RecipeAI/docs/V1_PRODUCT_BLUEPRINT.md`](../apps/RecipeAI/docs/V1_PRODUCT_BLUEPRINT.md)
- UI vision: [`apps/RecipeAI/docs/MASTER_PRODUCT_VISION.md`](../apps/RecipeAI/docs/MASTER_PRODUCT_VISION.md)

## Figma / UI

ADR-0005 superseded for implementation starting from locked master vision + existing design direction. See master vision doc.
