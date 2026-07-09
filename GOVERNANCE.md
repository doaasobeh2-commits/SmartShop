# Governance

## Document ownership

| Canonical here (platform) | Canonical in app repos |
|---------------------------|------------------------|
| Principles, architecture, design, ADRs | Source code, brain implementation, dev setup |
| Product overviews (`products/*.md`) | `FITNESS_BRAIN.md`, `V1_PRODUCT_BLUEPRINT.md` |
| Registry | Package structure, CI (when separated) |

**Platform wins** on ecosystem conflicts. App wins on implementation detail.

## Changes

- Ecosystem change → edit platform docs → log [`CHANGELOG.md`](CHANGELOG.md)
- Irreversible → new ADR in [`decisions/`](decisions/)
- App implementation → app repo only

## Agent boundaries

| Task | Where |
|------|-------|
| Philosophy, HIE architecture, product direction | **Fadi-Core-Platform** |
| SmartShop code | `apps/Smart Shop/` |
| Fitness Brain + screens | `apps/FitnessAI/` |
| Recipe engines + blueprint | `apps/RecipeAI/` |

**Always read [`AGENTS.md`](AGENTS.md) first.**

## Naming

- Consumer: **SmartShop** (not SmartShop AI on free tier), **FitnessAI**, **RecipeAI**
- Folders (future): `SmartShop`, `FitnessAI`, `RecipeAI`, `Fadi-Core-Platform`

## Pre-beta checklist

- [ ] One question per screen
- [ ] No chat-as-product · no macro home · no engine branding
- [ ] Household not duplicated across apps
- [ ] Figma approved where required
- [ ] Allergen fail-closed (Recipe) · formulas documented (Fitness)

Full critique: [`reviews/2026-07-ecosystem-architecture-critique.md`](reviews/2026-07-ecosystem-architecture-critique.md)
