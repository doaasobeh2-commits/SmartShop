# Figma Workflow

**Product before code.** No major implementation until Figma AI redesign is complete for all three apps.

## Gates

| App | Figma required before UI work? |
|-----|-------------------------------|
| RecipeAI | **Yes — blocked** |
| FitnessAI | **Yes** (no Figma in repo today) |
| SmartShop | **Yes** for Profile, nav, shopping flow redesign |

## Priority order

1. **SmartShop** — Home (keep), Profile (redesign), unified shopping flow, kill Analyse tab
2. **FitnessAI** — Today, Eat, Train; Coach → inline; Welcome/onboarding
3. **RecipeAI** — Tonight, Cook mode, pantry correction micro-interaction
4. **Ecosystem** — Household Home concept (shop + dinner + body cards)

## RecipeAI screen target

Reject 11-screen blueprint UI. Ship **2 screens:** Tonight · Cook. Rest is inline or SmartShop handoff.

Platform overrides blueprint onboarding — see [`products/recipeai.md`](../products/recipeai.md).

## Process

1. Generate from `products/*.md` screen registries + `design/DESIGN.md`
2. Review against [`philosophy/PRINCIPLES.md`](../philosophy/PRINCIPLES.md) checklist
3. Record approval in ADR or here with date
4. Only then implement in app repos

## Figma links

_Add figma.com URLs when designs exist._

| App | Link |
|-----|------|
| SmartShop | _pending_ |
| FitnessAI | _pending_ |
| RecipeAI | _pending_ |

SmartShop screen IDs: `apps/Smart Shop/core/src/types/screens.ts` (`FigmaScreenId`)

## ADR

ADR-0005: Figma before Recipe UI
