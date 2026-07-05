# Hidden Inventory Learning

SmartShop launches as a shopping app. Inventory intelligence is **hidden in v1** and prepared for future Recipe AI integration.

## Rules

1. Every family will later have its own **private inventory database**.
2. Purchases saved in SmartShop become **hidden inventory inputs**.
3. The app should **remember what the family bought**.
4. In the beginning, families may **manually adjust remaining quantities** (internal capability; no UI yet).
5. Over time, AI should **learn real consumption patterns** and improve inventory estimates.
6. Later, when Recipe AI is connected:
   - Selected meals deduct ingredient quantities from inventory.
   - Example: family chooses French meal #4 → required ingredients are subtracted from remaining stock.
7. Later, SmartShop should generate a **weekly inventory report**:
   - what was bought
   - what was consumed
   - what remains
   - what is close to expiration
   - what was wasted
   - what should be bought next
8. This must **remain hidden for now**.
9. Do **not** add inventory UI yet.
10. Do **not** add meal UI yet.
11. Do **not** add Recipe AI or Fitness AI screens.
12. Only **core/ecosystem contracts** implement this phase.

## Core domain models

| Model | Responsibility |
|---|---|
| `FamilyInventoryMemory` | Private per-family inventory store |
| `HiddenInventoryItem` | Single remembered product with remaining quantity |
| `InventoryAdjustment` | Purchase or event that changes stock |
| `ManualInventoryCorrection` | Family manual quantity fix |
| `LearnedConsumptionPattern` | AI-learned usage over time |
| `WeeklyInventoryReport` | Future bought/consumed/remaining/waste report |
| `MealIngredientDeduction` | Stock removed for a selected meal |
| `FutureMealSelectionEvent` | Recipe AI meal selection event |
| `InventoryLearningPolicy` | Learning thresholds and feature flags |
| `InventoryConfidenceLevel` | Confidence in AI estimates |

## Ecosystem bridge

| Contract | Responsibility |
|---|---|
| `RecipeInventoryBridge` | Future adapter between Recipe AI and hidden inventory |

## Out of scope for this phase

- Inventory UI
- Meal UI
- Recipe AI / Fitness AI screens
- Real database implementations
- External services
