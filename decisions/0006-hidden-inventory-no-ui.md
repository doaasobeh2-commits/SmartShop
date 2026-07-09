# ADR-0006: Hidden Inventory, No UI in v1

## Status

Accepted

## Context

Pantry management UIs create admin burden and duplicate mental models across Recipe and SmartShop. Hidden inventory enables Tonight decisions and shop handoff without user-facing pantry administration.

## Decision

1. Inventory intelligence runs in backend only for v1
2. No inventory consumer UI in SmartShop public launch
3. Surface only: "running low" labels (max 3) and have/need on recipe detail
4. RecipeAI deducts inventory on meal selection via bridge (when wired)
5. One-tap correction when wrong — not a pantry manager

## Consequences

- SmartShop screen `17-inventory-offers` contradicts this ADR for consumer v1 — classify as pilot ops or remove
- Trust requires correction micro-interaction (not yet built)
- Weekly inventory reports remain Premium/future

## References

- [`architecture/INTELLIGENCE.md`](../architecture/INTELLIGENCE.md) · [`products/smartshop.md`](../products/smartshop.md)
