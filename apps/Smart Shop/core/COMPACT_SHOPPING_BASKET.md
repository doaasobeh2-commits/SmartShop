# Compact Shopping Basket

Architecture for a clean, compact free-tier shopping basket. **No UI implementation.**

## Display principle

The basket list shows **only**:

| Field | Description |
|-------|-------------|
| Merchant name | Resolved from `StoreProfile` or `RestaurantProfile` |
| Product or meal | Item label |
| Offer price | Current offer price |
| Validity | Compact validity label |
| Status indicator | Small visual status |

## Never displayed inline

- Address
- Phone
- Opening hours
- Website
- Social media

## Merchant details card (future UI)

When the user selects a merchant name, a **temporary expandable card** may show:

- Address
- Phone
- Opening hours
- Delivery / pickup
- Website
- Social media
- Notes

Resolved via `MerchantDetailsResolver` from `StoreProfile` or `RestaurantProfile`.

## Merchant references

Basket items reference only:

```typescript
{
  storeId?: string;
  restaurantId?: string;
  branchId?: string;
}
```

No duplicated merchant data inside `CompactBasketItem`.

## Contracts

| File | Role |
|------|------|
| `models/basket/CompactShoppingBasket.ts` | Compact basket, item, merchant ref, details card |
| `models/merchant/StoreProfile.ts` | Retail merchant profile |
| `models/merchant/RestaurantProfile.ts` | Restaurant merchant profile |

## Status indicators

`active` · `upcoming` · `expires_soon` · `sold_out` · `unknown`

Expired and sold-out offers are excluded from recommendations per `DEFAULT_MANUAL_OFFER_STATUS_POLICY`.
