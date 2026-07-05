# Free vs Premium

## Free tier

**No AI.** Deterministic algorithms, rules, calculations, filtering, sorting, ranking, manual offers, OCR architecture only, and shopping history.

No OpenAI. No LLM. No AI inference.

### Features

- Shopping lists
- Family profile
- Pets
- Shopping history
- Manual offers with merchant profiles (`StoreProfile`, `RestaurantProfile`)
- Manual local offers database
- Restaurant street-board offers
- Offer confidence and status tracking
- Compact shopping basket
- Flyer import (OCR architecture only — not Premium AI)
- Brand preferences
- Favourite stores and restaurants
- City selection
- Shopping radius
- Budget
- Rule-based shopping basket
- Basic reports
- Community feedback architecture (future)

### Basket generation

Generated baskets use **only** predefined rules and deterministic algorithms. See `FREE_DETERMINISTIC_BASKET_POLICY` and `COMPACT_SHOPPING_BASKET.md`.

Merchant details (address, phone, hours) are **never** shown inline in the compact basket.

## Premium tier

Activates real AI features — the **only future intelligent layer**:

- Automatic local offer search
- Automatic supermarket comparison
- Availability checking
- Best shopping time
- AI shopping basket optimisation
- Family learning
- Hidden inventory intelligence
- Consumption prediction
- Shopping prediction
- Weekly inventory reports
- Recipe AI integration
- Fitness AI integration
- Household Intelligence Engine
- Decision support
- Recommendation engine

## Pilot

Free tier validation in **St. Pölten** with Arabic and Turkish families. See `PILOT_LAUNCH_PLAN.md`.

## Contracts

See `core/src/subscription/`, `core/src/manual-offers/`, `core/src/models/merchant/`.
