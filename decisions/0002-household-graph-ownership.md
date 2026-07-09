# ADR-0002: SmartShop Owns Household Graph

## Status

Accepted

## Context

Three apps need shared household context (members, allergies, location, budget, inventory). Without a single owner, each app would re-onboard users and diverge on safety-critical allergen data.

## Decision

SmartShop (`@smart-shop/core`) is the **canonical owner** of the household graph.

- `familyId` (SmartShop) === `householdId` (RecipeAI)
- RecipeAI and FitnessAI consume via bridges — they do not maintain parallel profiles
- Allergies and restrictions are canonical in `FamilyPreferenceProfile`
- Onboarding ownership matrix: [`architecture/ECOSYSTEM.md`](../architecture/ECOSYSTEM.md)

## Consequences

- SmartShop wizard is the one household onboarding
- FitnessAI currently violates this (isolated onboarding) — bridge work required
- RecipeAI blueprint must defer to SmartShop for stores, budget, members

## References

- `apps/Smart Shop/core/src/models/household/`
- [`architecture/ECOSYSTEM.md`](../architecture/ECOSYSTEM.md)
