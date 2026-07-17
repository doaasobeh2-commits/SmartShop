# ADR-002: Household membership and invitations

**Status:** Accepted  
**Date:** 2026-07-17  
**Applies to:** Fadi Core Phase 2  
**Related:** [ADR-001](./ADR-001-household-identity.md)

## Decision

Household linking uses **authenticated user accounts** and a stable `household_id`.

- Registration creates a `user_account`, a `household`, and an **owner** membership.
- Additional people join only through **invitations** (tokenized; email delivery later).
- Admin auth remains separate (`admin_users` / `fadi_admin_session`).
- User auth uses `user_accounts` / `fadi_user_session`.

## Never

- Never use IP as household identity (IP may appear on sessions/audit for security only).
- Never store home address on `households`.
- Never return password hashes or invitation token hashes in API responses.
- Never demote or remove the final owner.

## Roles

| Role | Capabilities (Phase 2) |
|------|-------------------------|
| owner | manage household, invite, change roles, remove members, revoke invitations |
| adult | view; invite only if `ADULT_CAN_INVITE=true` |
| teen / child / caregiver | read-only (`household.view`, `members.view`, `invitations.view`) |

Permission checks are server-side via an extensible role → permission map.

## Invitations

- Random opaque token; only **SHA-256 hash** stored.
- Tokens expire (`INVITE_TTL_HOURS`, default 168h).
- Emails normalized (trim + lowercase) for compare/storage.
- Accept requires logged-in user whose email matches the invitation.
- No real email sending in Phase 2; plaintext token returned only when `NODE_ENV` is `development` or `test`, marked `developmentOnlyToken`.

## Current household

Phase 2 resolves `/households/current` as the caller's **most recently joined** active membership. Explicit multi-household switching is deferred.

## Out of scope

Recipe / SmartShop / Fitness product logic, billing, subscriptions, recommendation engines, QR invite UX.
