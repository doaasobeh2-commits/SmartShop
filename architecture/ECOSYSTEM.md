# Ecosystem Architecture

## Map

```
HOUSEHOLD GRAPH (SmartShop owns)
  identity · members · allergies · location · budget · hidden inventory
        │
   ┌────┼────┐
   ▼    ▼    ▼
SmartShop  RecipeAI  FitnessAI
   │         │         │
   └────┬────┴────┬────┘
        ▼         ▼
   HIE (signals → inference → hypotheses)
```

**Shared ID:** `householdId` (RecipeAI) === `familyId` (SmartShop)

## Layer stack (every app)

```
UI → Services (thin) → Brain/Engine → Knowledge → Data → AI (explain only, future)
```

UI never calculates. Brain is source of truth. AI never overrides.

## Household

| Data | Owner | Notes |
|------|-------|-------|
| Members, pets, city, stores | SmartShop | One onboarding wizard |
| Allergies, restrictions | SmartShop (+ Recipe safety confirm) | Fail-closed |
| Budget, stores | SmartShop | RecipeAI inherits |
| Cuisine affinity | **Inferred** (HIE) | Never asked |
| Fitness goal, body metrics | FitnessAI | Body-specific |
| Hidden inventory | SmartShop runtime | No consumer UI v1 |

Onboarding ownership: SmartShop wizard is canonical. FitnessAI keeps body fields only. RecipeAI links existing household.

## Location

Family home (country, city, district, radius) is mandatory. Never recommend out-of-city merchants. RecipeAI and FitnessAI consume same location contracts.

## Launch scope (SmartShop v1)

**Visible:** shopping, local offers, rule-based basket, family profile, history.  
**Hidden:** Recipe/Fitness screens, inventory UI, meal UI, weekly inventory reports.

## Implementation paths

| Runtime | Location |
|---------|----------|
| HIE, household models | `apps/Smart Shop/core/` |
| Bridges | `apps/Smart Shop/ecosystem/` |
| Fitness Brain | `apps/FitnessAI/apps/fitness-ai/src/fitnessBrain/` |
| Recipe engines | Planned `apps/RecipeAI/` |

Registry: [`registry.yaml`](../registry.yaml)
