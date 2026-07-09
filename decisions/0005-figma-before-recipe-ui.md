# ADR-0005: Figma Before Recipe UI

## Status

Accepted

## Context

RecipeAI has a detailed logic blueprint but no validated visual design. Building 11 screens from spec risks shipping meal-planner UX that contradicts ecosystem philosophy.

## Decision

**No RecipeAI consumer UI ships until Figma design is approved.**

Implementation resumes from `apps/RecipeAI/docs/V1_PRODUCT_BLUEPRINT.md` after Figma pass.

Platform target: 2 screens (Tonight, Cook) — not full S0–S10 spec.

## Consequences

- RecipeAI remains spec-only until design phase
- Figma priority: Tonight, Cook mode, pantry correction micro-interaction
- Blueprint onboarding and screen list subject to platform overrides in `products/recipeai/V1_SCOPE.md`

## References

- [`design/FIGMA.md`](../design/FIGMA.md) · [`products/recipeai.md`](../products/recipeai.md)
