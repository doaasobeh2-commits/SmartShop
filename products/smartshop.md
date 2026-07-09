# SmartShop

**Role:** Household hub · **Maturity:** pilot · **Path:** `apps/Smart Shop/`

## One question

**Home:** What matters today?

## Core loop

Wizard (once) → Home → Plan → Basket → Complete → learning pipeline → Home

## Screens

| Screen | Question | Status |
|--------|----------|--------|
| Dashboard | What matters today? | **Keep** — best screen |
| Plan | What to buy this week? | Improve |
| Basket → Complete | Shop and confirm | Merge flow (Figma) |
| Profile | Edit household? | **Redesign** — junk drawer |
| Analyse | — | **Remove** (merge into Home) |
| Inventory & offers | — | Ops tool or remove from consumer v1 |
| Premium, AI Assistant | — | Remove (dead routes) |

## v1 scope

Visible: shopping, offers, rule-based basket, profile, history.  
Hidden: Recipe/Fitness UI, inventory UI, meal UI.

## Owns

Household graph · HIE runtime · hidden inventory · trip learning

## Pilot

St. Pölten · Arabic/Turkish families · free tier only. See [`PILOT.md`](../PILOT.md).

## Implementation

`@smart-shop/app` · `core` · `ecosystem` · `shared`

## Figma next

Profile · navigation · unified shopping flow.
