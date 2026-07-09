# ADR-0004: Deterministic Free Tier

## Status

Accepted

## Context

Pilot validation in St. Pölten must prove free-tier value before Premium AI investment. "AI" branding on rule-based features creates trust deficits.

## Decision

Free tier across the ecosystem uses **deterministic rules only**:

- No OpenAI, LLM, or AI inference on free tier
- SmartShop: rule-based baskets, manual offers
- FitnessAI: Fitness Brain rule engines
- RecipeAI: deterministic Tonight engine and allergen gates

Premium tier is the only future layer for real AI optimisation and cross-app intelligence.

Do not use "AI" in consumer-facing free-tier naming.

## Consequences

- Product named "SmartShop AI" is a naming debt
- Premium screen should not ship in pilot consumer build
- Pilot success measured on weekly retention without AI

## References

- [`ai/PRINCIPLES.md`](../ai/PRINCIPLES.md) · [`PILOT.md`](../PILOT.md)
