# 2026-07 Ecosystem Architecture Critique

**Date:** 2026-07-07  
**Scope:** SmartShop, FitnessAI, RecipeAI — product philosophy, UX, AI-first interaction  
**Outcome:** Informed Fadi-Core-Platform constitution and Phase 1 structure

## Executive summary

Strong written philosophy (invisible intelligence, brain-first, no chat) but implementations violate it: three siloed app homes, visible "Brain" branding, macro walls, Profile junk drawers, Recipe 7-step onboarding conflicting with behavior-over-forms, SmartShop inventory UI contradicting launch scope.

## Key findings

### Ecosystem

- Designed a platform but shipped three siloed apps
- SmartShop accidentally owns platform philosophy via `core/*.md`
- FitnessAI architecturally isolated — no HIE bridge
- RecipeAI spec-only — advantage to redesign before code

### SmartShop

- **Keep:** HIE, dashboard cards, trip-complete loop
- **Redesign:** Profile, navigation (drop Analyse tab), shopping flow merge
- **Remove:** Analytics tab, dead routes (Premium, AI Assistant), Splash delay

### FitnessAI

- **Keep:** Fitness Brain, no chat stance, meal log overlays
- **Redesign:** Today, Eat, Train, Welcome; Coach → inline
- **Remove:** Macro grid, Brain completeness %, parallel activity log on Train

### RecipeAI

- **Keep:** Allergen safety, decideTonight engine, shop handoff
- **Reject spec UI:** 11 screens → target 2 (Tonight, Cook)
- **Override blueprint:** 7-step onboarding → allergies + household link only

### 2030 bar

One household pulse; intelligence ambient; exception-based shopping; zero admin burden.

## Decisions influenced

- ADR-0001 through ADR-0006
- `vision/2030_EXPERIENCE.md`
- `products/*/SCREEN_REGISTRY.md` redesign targets
- `design-system/FIGMA_WORKFLOW.md` priorities

## A/B/C/D summary (from critique)

| Verdict | Examples |
|---------|----------|
| **Keep** | HIE architecture, SmartShop dashboard, Fitness Brain, Recipe allergen gate |
| **Improve** | Today screen, shopping loop, onboarding length, bridge wiring |
| **Redesign in Figma first** | Recipe entire surface, FitnessAI Today/Eat/Train, SmartShop Profile |
| **Remove** | Analytics tab, Coach tab, Recipe Settings/History screens, AI naming on free tier |

## Full critique

Delivered in product architecture review session 2026-07-07. This document is the permanent archive entry.
