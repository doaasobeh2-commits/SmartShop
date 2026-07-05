# Family Behaviour Engine

Contracts for learning household behaviour over time. **No runtime implementation.**

## Learned behaviours

- Preferred shopping day
- Preferred supermarkets
- Preferred brands
- Budget habits
- Seasonal shopping patterns
- Frequently forgotten products
- Frequently wasted products
- Shopping frequency
- Meal frequency
- Family habits

## Contracts

See `core/src/behaviour/FamilyBehaviourProfile.ts`.

## Data source

Behaviour profiles are updated from `HouseholdTimeline` events via `FamilyBehaviourEngine.updateFromTimeline`.
