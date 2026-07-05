# Household Timeline

Hidden event timeline architecture. **No UI.**

## Purpose

Every household action becomes an event. Future AI systems learn from this timeline.

## Event types

- `PurchaseEvent`
- `ManualOfferAddedEvent`
- `FlyerImportedEvent`
- `MealCookedEvent`
- `InventoryAdjustmentEvent`
- `ManualInventoryCorrectionEvent`
- `GuestVisitEvent`
- `VacationEvent`
- `ProductExpiredEvent`
- `WasteEvent`
- `BudgetExceededEvent`
- `StoreVisitedEvent`
- `OfferAcceptedEvent`
- `OfferIgnoredEvent`
- `ShoppingCompletedEvent`

## Contracts

See `core/src/timeline/HouseholdTimeline.ts`.

## Writers and readers

- `HouseholdTimelineWriter.append(event)` — append events
- `HouseholdTimelineReader.list(familyId, from?, to?)` — query events

## Sources

Events may originate from `user`, `system`, `ocr`, `import`, or `premium_ai`.
