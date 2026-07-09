# Fadi Ecosystem — Agent Instructions

> **Read this file first.** Then read app-specific `AGENTS.md` only for implementation paths.

## Constitution

**Fadi-Core-Platform** is the single source of truth for philosophy, architecture, design, and product direction. Applications are independent implementations.

## Mandatory reading (in order)

1. [`philosophy/PRINCIPLES.md`](philosophy/PRINCIPLES.md)
2. [`architecture/ECOSYSTEM.md`](architecture/ECOSYSTEM.md)
3. [`ai/PRINCIPLES.md`](ai/PRINCIPLES.md)
4. [`products/{app}.md`](products/) for the app you are working on
5. [`design/FIGMA.md`](design/FIGMA.md) before any UI work

## Current priority

**Product before code.** Do not expand UI without approved Figma design. Next phase is Figma AI redesign — not engineering or repo separation.

## Mandates (summary)

- Invisible intelligence · behavior over forms · one question per screen
- Brain-first · deterministic free tier · no chat-as-product
- SmartShop owns household graph · satellites consume via bridges
- Platform wins when docs conflict

Full list: [`philosophy/PRINCIPLES.md`](philosophy/PRINCIPLES.md)

## Where to make changes

| Change | Location |
|--------|----------|
| Ecosystem philosophy, architecture, product direction | **This repo** |
| SmartShop implementation | `apps/Smart Shop/` |
| Fitness Brain + fitness UI | `apps/FitnessAI/` |
| Recipe blueprint + future engines | `apps/RecipeAI/` |

## App entry points

| App | Platform doc | Implementation |
|-----|-------------|----------------|
| SmartShop | [`products/smartshop.md`](products/smartshop.md) | `apps/Smart Shop/AGENTS.md` |
| FitnessAI | [`products/fitnessai.md`](products/fitnessai.md) | `apps/FitnessAI/AGENTS.md` |
| RecipeAI | [`products/recipeai.md`](products/recipeai.md) | `apps/RecipeAI/AGENTS.md` |

## Registry

[`registry.yaml`](registry.yaml)
