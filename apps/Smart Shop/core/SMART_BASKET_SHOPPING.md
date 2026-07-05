# Smart Basket Shopping

The value of SmartShop AI is **local, family-aware, offer-aware shopping**.

When the AI creates a shopping basket, it must not only list products. It must search for the best nearby offers based on family home location, family preferences, and local offer data.

## Input dimensions

### 1. Family home location
- country
- city
- district / area
- postal code
- optional coordinates
- allowed shopping radius in km

### 2. Family preferences
- preferred brands
- disliked brands
- store preferences
- dietary restrictions
- allergies
- budget limit
- product quality preferences
- organic / halal / vegetarian / vegan / low sugar / low salt preferences

### 3. Local offers
- store name
- city
- branch location
- product name
- brand
- normal price
- offer price
- discount percentage
- offer start date
- offer end date
- product availability
- quantity limit
- delivery / pickup availability

## Basket rules

1. Never recommend an offer outside the family city or allowed shopping range.
2. Never recommend an expired offer.
3. Never recommend an offer that has not started yet unless clearly marked as upcoming.
4. Never recommend unavailable products as active basket items.
5. If a product is unavailable, suggest a local available alternative.
6. If the preferred brand is not on offer, compare preferred-brand price vs similar local offer vs cheaper alternative.
7. The AI shopping basket must explain why each product was selected: cheapest nearby offer, preferred brand, healthier choice, family preference, or recipe/nutrition need.
8. The basket must include offer validity dates.
9. The basket must warn if an offer expires soon.
10. The basket must group products by store and estimate total cost per store.
11. The AI should reduce travel by preferring fewer nearby stores when savings are small.
12. The AI may split shopping across multiple stores only when savings are meaningful.

## Core domain models

| Model | Responsibility |
|---|---|
| `FamilyHomeLocation` | Family home anchor |
| `ShoppingRange` | Home location + radius km |
| `FamilyPreferenceProfile` | Brands, diet, allergies, budget, quality |
| `BrandPreference` | Preferred or disliked brand |
| `Store` | Retail chain identity |
| `StoreBranch` | Branch location within a city |
| `LocalOffer` | Full local promotion with pricing and validity |
| `OfferValidity` | Active / expired / upcoming window |
| `ProductAvailability` | Stock, limits, fulfillment, alternatives |
| `ShoppingBasket` | AI-generated basket aggregate |
| `BasketItem` | Single explained product line |
| `BasketStoreGroup` | Items grouped per store branch |
| `BasketRecommendationReason` | Why an item was selected |
| `SmartBasketPolicy` | Basket optimization and eligibility policy |

## Use-case contracts (not implemented yet)

| Use case | Purpose |
|---|---|
| `FindLocalOffersForBasket` | Search nearby offers for requested products |
| `GenerateSmartShoppingBasket` | Build the full explained basket |
| `ComparePreferredBrandWithOffers` | Brand vs similar offer vs cheaper alternative |
| `ValidateOfferAvailability` | Reject expired, future, or unavailable offers |
| `FilterStoresByShoppingRange` | Keep only in-city, in-radius branches |
| `RankBasketBySavingsDistancePreference` | Rank candidates by savings, travel, preferences |

## Future integrations

- Supermarket APIs
- Flyer / offer scraping
- Barcode / product databases
- Recipe AI
- Fitness AI

## Out of scope for this phase

- Real API implementations
- External services
- Screen UI
