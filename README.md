# Fadi-Core-Platform

**The constitution of the Fadi household ecosystem.** Docs only — not an application.

## Start here

| Read | When |
|------|------|
| [`AGENTS.md`](AGENTS.md) | Before any work (humans and AI) |
| [`philosophy/PRINCIPLES.md`](philosophy/PRINCIPLES.md) | Product decisions |
| [`architecture/ECOSYSTEM.md`](architecture/ECOSYSTEM.md) | How apps connect |
| [`products/`](products/) | Per-app direction |
| [`design/FIGMA.md`](design/FIGMA.md) | **Next priority — redesign before code** |

## Applications (independent)

| App | Doc | Code |
|-----|-----|------|
| SmartShop | [`products/smartshop.md`](products/smartshop.md) | `apps/Smart Shop/` |
| FitnessAI | [`products/fitnessai.md`](products/fitnessai.md) | `apps/FitnessAI/` |
| RecipeAI | [`products/recipeai.md`](products/recipeai.md) | `apps/RecipeAI/` |

## Structure

```
philosophy/     PRINCIPLES · EXPERIENCE
architecture/   ECOSYSTEM · INTELLIGENCE · INTEGRATION
ai/             PRINCIPLES
design/         DESIGN · FIGMA
products/       smartshop · fitnessai · recipeai
decisions/      ADRs
reviews/        product critique archive
registry.yaml   app registry
GOVERNANCE.md   ownership and process
PILOT.md        St. Pölten pilot
```

## Status

Phase 1.5 complete — single source of truth. Application code untouched. Repository separation paused.

**Next:** Figma AI redesign of all three products. Product before code.
