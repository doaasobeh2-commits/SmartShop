# Fadi Core

Canonical platform backend for shared household identity, aliases, cross-app memory, hypotheses, permissions, and projections.

Connected apps remain domain owners:

- **SmartShop** — shopping, basket, pantry, purchase, budget (local-first in St. Pölten)
- **Recipe AI** — recipes, meals, cooking activity, recipe feedback (not city-locked)
- **Fitness AI** — workouts, activity, fitness goals (not city-locked)

## Household identity (approved)

See [`docs/ADR-001-household-identity.md`](docs/ADR-001-household-identity.md) and [`docs/ADR-002-household-membership.md`](docs/ADR-002-household-membership.md).

Summary:

- Fadi Core owns stable `household_id` and shared cross-app memory
- Family linking uses **authenticated Fadi accounts** + invitations
- **Never** use IP addresses to create or link households
- IP may only be used later for security, rate limiting, or approximate country detection
- No full address on `households`
- Billing / family subscription remains documentation-only (example prices are not approved)

## Phase 1

Foundation:

- Fastify + TypeScript API, PostgreSQL + Drizzle
- Admin session auth (Argon2, HttpOnly `fadi_admin_session`)
- Schema: `admin_users`, `admin_sessions`, `households` (aliases), `app_clients`, `app_api_keys`, `audit_logs`
- Endpoints: `/health`, `/admin/auth/*`

## Phase 2 (household accounts & invitations)

See ADR-002.

### Schema additions

- `user_accounts`, `user_sessions`
- `household_members`, `household_invitations`
- `households` extended with `name`, `owner_user_id`, `preferred_locale`, `updated_at` (still no address)

### User auth endpoints

| Method | Path | Notes |
|--------|------|-------|
| POST | `/auth/register` | Creates user + household + owner membership |
| POST | `/auth/login` | User session cookie |
| POST | `/auth/logout` | Revokes user session |
| GET | `/auth/me` | Current user + current household id/role |

### Household endpoints

| Method | Path |
|--------|------|
| GET | `/households/current` |
| PATCH | `/households/current` |
| GET | `/households/current/members` |
| PATCH | `/households/current/members/:memberId` |
| DELETE | `/households/current/members/:memberId` |

### Invitation endpoints

| Method | Path |
|--------|------|
| POST | `/households/current/invitations` |
| GET | `/households/current/invitations` |
| POST | `/households/current/invitations/:invitationId/revoke` |
| POST | `/invitations/:token/accept` |

Development/test only: create-invite responses may include `developmentOnlyToken` (no real email).

### Role / permission matrix

| Permission | owner | adult | teen | child | caregiver |
|------------|:-----:|:-----:|:----:|:-----:|:---------:|
| household.view | yes | yes | yes | yes | yes |
| household.manage | yes | — | — | — | — |
| members.view | yes | yes | yes | yes | yes |
| members.invite | yes | policy* | — | — | — |
| members.change_role | yes | — | — | — | — |
| members.remove | yes | — | — | — | — |
| invitations.view | yes | yes | yes | yes | yes |
| invitations.revoke | yes | — | — | — | — |

\*Adults invite only when `ADULT_CAN_INVITE=true` (default false).

### Security controls

- Separate admin vs user session cookies
- Invitation tokens hashed (SHA-256); passwords Argon2id
- Invitation expiry; normalized emails
- Exactly one active owner (DB partial unique index + API guards)
- Duplicate active membership blocked (partial unique index)
- Server-side permission checks; rate limits on auth + invite accept
- Hashes never returned in JSON

## Local setup

### 1. Postgres

```bash
cd apps/FadiCore
docker compose up -d
```

Or set `DATABASE_URL` (e.g. Neon).

### 2. Configure API env

```bash
cd apps/core-api
cp .env.example .env
npm install
```

Set unique `ADMIN_BOOTSTRAP_PASSWORD` before seed. Optional Phase 2:

- `INVITE_TTL_HOURS` (default 168)
- `ADULT_CAN_INVITE` (`true`/`false`, default false)

### 3. Migrate + seed

```bash
npm run db:migrate
npm run db:seed
```

### 4. Run API

```bash
npm run dev
```

Default: `http://localhost:8787`

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Watch API |
| `npm run build` / `typecheck` | TypeScript check |
| `npm run test` | Unit + Phase 2 API tests (API tests need `DATABASE_URL`) |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Seed owner admin + app clients/keys |

## Security notes

- Passwords: Argon2id
- Session tokens + API keys + invite tokens: SHA-256 hashes at rest
- Cookies: HttpOnly, SameSite=Lax
- Login/register/invite-accept: rate limited
- Session/audit may record IP for **security only** — never as household identity
