# Cross-App Integration

## Bridge status

| Bridge | Status | Path |
|--------|--------|------|
| PlatformIntelligenceBridge | **Implemented** | `ecosystem/src/intelligence/` |
| RecipeAiIntelligenceService | **Implemented** (UI not wired) | `ecosystem/src/intelligence/` |
| RecipeInventoryBridge | Stub | `ecosystem/src/bridges/` |
| RecipeAiBridge | Stub | `ecosystem/src/bridges/` |
| FitnessAiBridge | Stub | `ecosystem/src/bridges/` |

Paths relative to `apps/Smart Shop/`.

## RecipeAI ↔ SmartShop

**Recipe → Shop:** `pushMealShoppingGaps` · `handoffToBasket` · `notifyMealSelected` · `notifyMealCompleted`  
**Shop → Recipe:** `getHouseholdContext` · `onShoppingTripCompleted` · `onHouseholdSetupUpdated`

RecipeAI does not duplicate shopping UI. Shop handoff is one tap → SmartShop basket.

## FitnessAI ↔ ecosystem

**Planned.** FitnessAI is isolated today. Target: nutrition goals → shop filtering; meal completed → Eat log; recovery → Tonight energy.

## Session

Pilot: per-app local auth. Target: SmartShop household session shared across lenses. `householdId === familyId`.

Full Recipe spec: `apps/RecipeAI/docs/V1_PRODUCT_BLUEPRINT.md` §3 (implementation detail).

Registry: [`registry.yaml`](../registry.yaml)
