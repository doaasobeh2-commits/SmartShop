# Household Intelligence Engine

Hidden future orchestration layer for SmartShop. **Not a screen, backend, or AI runtime.**

## Purpose

Coordinate household-level intelligence across shopping, offers, inventory, consumption, budget, nutrition, learning, and decision support.

## Engines

| Engine | Responsibility |
|--------|----------------|
| Family Engine | Family context, members, pets, location |
| Shopping Engine | Rule-based (free) and AI-enhanced (premium) baskets |
| Offer Engine | Local offer discovery, ranking, validity |
| Inventory Engine | Hidden inventory memory, adjustments, corrections |
| Consumption Engine | Consumption tracking and prediction |
| Budget Engine | Budget evaluation and spending tracking |
| Recommendation Engine | Product and store recommendations |
| Nutrition Engine | Nutrition needs evaluation |
| Learning Engine | Timeline-driven behaviour learning |
| Decision Engine | Basket strategy decisions and explanations |

## Contracts

See `core/src/intelligence/HouseholdIntelligenceEngine.ts`.

## Tier gating

- **Free:** Shopping Engine uses `buildRuleBasedBasket` only.
- **Premium:** All engines enabled; `buildPremiumBasket` and AI features active.

## Local shopping principle

All engines respect family home location, city, district, shopping radius, preferred stores, and delivery area. Never recommend products from another city.
