# Location-Aware Shopping

SmartShop AI is **location-aware**. The family home city/area defines the active shopping range.

## Product rules

1. **Family home location is mandatory**  
   Every family profile must define:
   - country
   - city
   - district/area
   - postal code
   - optional coordinates

2. **Local filtering**  
   Shopping recommendations must be filtered by:
   - same city
   - selected radius in km
   - delivery availability
   - store type
   - opening hours *(later phase)*

3. **No out-of-range recommendations**  
   Never recommend products, offers, prices, supermarkets, shops, or restaurants from another city or outside the active shopping range.

4. **Shared location for ecosystem apps**  
   Recipe AI and Fitness AI may later consume the same home location and nutrition preferences through ecosystem models. Core owns the canonical location contracts.

5. **UI scope**  
   SmartShop UI must later show only local supermarkets and shops relevant to the family location.

## Core domain models

| Model | Responsibility |
|---|---|
| `FamilyHomeLocation` | Canonical home anchor for a family |
| `ShoppingRange` | Home location + selected radius km |
| `Store` | Local retail entity with city/area address |
| `StoreDistancePolicy` | Eligibility rules for in-range stores |
| `DeliveryAvailability` | Whether a store delivers to the family area |
| `LocalOffer` | Store-bound offer that inherits location policy |
| `FamilyProfileLocation` | Family profile binding to home + active range |

## Service contracts (not implemented yet)

- `StoreDistancePolicyEvaluator` — evaluates whether a store is inside range
- `LocalOfferRangeFilter` — removes offers tied to out-of-range stores

## Related

See also [SMART_BASKET_SHOPPING.md](./SMART_BASKET_SHOPPING.md) for offer-aware basket generation rules and use-case contracts.

## Out of scope for this phase

- Maps APIs
- External geocoding or routing services
- Screen UI
- Business logic implementations
