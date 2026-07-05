# Manual Local Offers Database

Free-tier architecture for building a private, family-scoped local offers database. **No UI, backend, OCR runtime, or AI.**

## Purpose

Free users manually collect offers from their local area. Offers reference merchant profiles and feed deterministic basket rules and recommendations.

## Merchant profiles

Offers **must not duplicate** merchant information. Use:

| Profile | Referenced by | Contract |
|---------|---------------|----------|
| `StoreProfile` | `ManualLocalOffer.storeId` | `models/merchant/StoreProfile.ts` |
| `RestaurantProfile` | `ManualRestaurantOffer.restaurantId` | `models/merchant/RestaurantProfile.ts` |

Profiles are stored in `MerchantProfileRegistry` inside `ManualOffersDatabase`.

## Offer types

| Type | Contract | Merchant reference |
|------|----------|-------------------|
| Retail / grocery | `ManualLocalOffer` | `storeId` |
| Restaurant | `ManualRestaurantOffer` | `restaurantId` |

## Offer confidence

Every manual offer includes `confidence`:

`verified` · `photo` · `manual` · `word_of_mouth` · `future_verified`

Prepares future learning without AI inference.

## Offer status

| Status | Basket behaviour |
|--------|------------------|
| `active` | Eligible |
| `upcoming` | Shown as upcoming |
| `expired` | **Ignored** |
| `sold_out` | **Not recommended** |
| `unknown` | Shown with unknown indicator |

## Retail offer fields

- `storeId` (references `StoreProfile`)
- Product name, optional brand, category
- Prices, dates, availability, confidence, status
- Source type, input method, optional photo reference

## Restaurant offer fields

- `restaurantId` (references `RestaurantProfile`)
- Offer title, meal name, prices
- Optional dates, available days, time window
- Confidence, status, source type, optional photo reference

Merchant contact details (phone, address, pickup/delivery) live on `RestaurantProfile`.

## Community feedback (future)

Users may later report: offer still available, offer finished, price changed, product unavailable, incorrect information. See `community/CommunityFeedback.ts`.

## Rules

- **No AI** — no OpenAI, LLM, or inference
- **No automatic internet search, crawling, or external API**
- **OCR architecture only** — text extraction, not Premium AI
- Offers respect **family city** and **shopping radius**
- **Merchant profile references only** — no duplicated merchant data on offers
- **Compact basket** — merchant details shown only in expandable card (future UI)

## Contracts

| File | Role |
|------|------|
| `models/merchant/StoreProfile.ts` | Reusable store profile |
| `models/merchant/RestaurantProfile.ts` | Reusable restaurant profile |
| `models/merchant/MerchantProfileRegistry.ts` | Per-family profile registry |
| `manual-offers/ManualLocalOffer.ts` | Retail offer (references storeId) |
| `manual-offers/ManualRestaurantOffer.ts` | Restaurant offer (references restaurantId) |
| `manual-offers/ManualOfferConfidence.ts` | Confidence levels |
| `manual-offers/ManualOfferStatus.ts` | Status lifecycle |
| `models/basket/CompactShoppingBasket.ts` | Compact basket display contracts |
| `community/CommunityFeedback.ts` | Future feedback reports |

## Basket integration

`FREE_DETERMINISTIC_BASKET_POLICY` includes `manual_local_offers_database`, `restaurant_manual_offers`, `compact_shopping_basket`, and `merchant_profile_references`.

## Pilot

See `PILOT_LAUNCH_PLAN.md` — St. Pölten, Arabic and Turkish families.
