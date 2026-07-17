# ADR-001: Household identity and family linking

**Status:** Accepted  
**Date:** 2026-07-17  
**Applies to:** Fadi Core (canonical household plane)

## Decision

Fadi Core is the **canonical owner** of shared household identity:

- stable `household_id` (UUID primary key)
- public admin alias (`public_alias`, e.g. `HH-xxxx`)
- cross-app memory, hypotheses, shared permissions, and projections (later phases)

Each connected app remains canonical only for its **domain data**:

| App | Owns |
|-----|------|
| SmartShop | shopping, basket, pantry, purchase, budget |
| Recipe AI | recipes, meals, cooking activity, recipe feedback |
| Fitness AI | workouts, activity, fitness goals |

## Household linking model (permanent)

1. One Fadi account per user  
2. One shared Household in Fadi Core  
3. Each household has a stable `household_id`  
4. The first user creates the household and becomes its owner  
5. Other family members join through an invitation:
   - short invite code
   - invite link
   - QR code later  
6. A user may sign in from Recipe, SmartShop, or Fitness  
7. Signing into another Fadi app with the **same account** must resolve the same user and household  
8. Apps share only **explicitly permitted** household data through Fadi Core  

## Never use IP as household identity

**IP addresses must not identify, create, or link households.**

Reasons:

- IPs change frequently
- may be shared (NAT, carrier CGNAT, offices)
- differ across Wi‑Fi / mobile / VPN

IP may be used later only for:

- security / abuse detection
- rate limiting
- approximate country detection

IP is never a substitute for `household_id` or account membership.

## Location rules

- **Recipe / Meal Planning** — not restricted to St. Pölten; no home address required  
- **Fitness** — not restricted to St. Pölten; no home address required  
- **SmartShop** — local-first in St. Pölten because it depends on local stores, prices, restaurants, offers, maps, and delivery  
- SmartShop may later request optional city, postcode, approximate location, or delivery address  
- Phase 1 `households` table must **not** store a full address or other personal data  

## Phase boundaries

| Topic | Phase |
|-------|--------|
| Authenticated accounts + `household_id` as identity | Phase 1 schema foundation (`households` aliases only) |
| Invitations (code / link / QR) | **Phase 2** |
| Household membership, permissions, privacy controls | **Phase 2** |
| Cross-app account resolution | **Phase 2+** |
| Billing / family subscription | **Not now** (docs only; €10/month is an example, not an approved price) |

## Subscription direction (documentation only)

- A user may start with Recipe only  
- Recipe may later promote SmartShop and Fitness  
- One future family subscription may unlock all three apps and synchronization  
- Do **not** implement billing in Phase 1  

## Consequences

- Admin and app APIs expose household aliases / ids, never IP-based identity  
- Future invite tables and membership roles land in Phase 2 migrations  
- SmartShop alone carries local St. Pölten operational constraints; Recipe and Fitness stay geography-flexible at product level  
