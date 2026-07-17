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

## Phase 3 (admin live reads)

Owner-admin JSON APIs for FadiCoreAdmin (cookie `fadi_admin_session`, role `owner`):

| Method | Path |
|--------|------|
| GET | `/admin/overview` |
| GET | `/admin/users` |
| GET | `/admin/users/:userId` |
| GET | `/admin/households` |
| GET | `/admin/households/:householdId` |
| GET | `/admin/invitations` |
| GET | `/admin/sessions` |
| GET | `/admin/audit-logs` |

Responses never include password/token/API key hashes. Audit metadata is redacted.

Admin UI: `apps/FadiCoreAdmin` with `VITE_FADI_CORE_API_URL`.

## Phase 4 (shared family + app enrollment)

Shared household foundation for managed family members and per-member application enrollment. Auth reuses `/auth/*` and `fadi_user_session`. RecipeAI domain profiles are deferred — Core owns family graph and enrollments only.

### Schema

- `household_members` — nullable `user_id` (managed profiles), `display_name`, `preferred_locale`, `created_by_member_id`
- `platform_applications` — seed keys: `recipe`, `fitness`, `smart_shop` (with `scope`: household | member)
- `member_app_enrollments` — unique per `(member, application)`
- `member_account_claims` — hashed claim tokens for linking a login to a managed member

Migration `0003_phase4_shared_family_apps` drops unused `recipe_profiles` from `0002` and applies the family schema.

### Endpoints (user session)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/applications` | Platform applications catalog (includes `scope`) |
| POST | `/households/current/members` | Create managed member (`teen` \| `child` \| `caregiver`) |
| PATCH | `/households/current/members/:memberId` | Role and/or managed `displayName` / `preferredLocale` |
| POST | `/households/current/members/:memberId/claims` | Create claim invitation |
| POST | `/members/claims/:token/accept` | Accept claim (session required) |
| GET | `/households/current/enrollments` | List household enrollments |
| GET | `/households/current/members/:memberId/enrollments` | List member enrollments |
| POST | `/households/current/members/:memberId/enrollments` | Enroll member in an app (age policy enforced) |
| PATCH | `/households/current/enrollments/:enrollmentId` | Update enrollment status |
| GET | `/auth/me` | Also returns `memberId` + active `enrollments` |

Admin household detail includes linked vs managed members, enrollments, and claim status (never token hashes).

Development/test only: create-claim responses may include `developmentOnlyToken`.

CORS accepts comma-separated origins (default Admin `:5180` + RecipeAI `:5173`).

## Phase 4b (registration lifecycle, address, age)

Registration no longer auto-creates a household. Users create or join a household explicitly. Addresses support privacy-safe discovery and join requests. DOB drives product age policy; Fitness teens (14–17) need parental approval.

### Schema additions (`0004_phase4b_registration_address_age`)

- `user_accounts.date_of_birth`
- `platform_applications.scope` (`household` for recipe/smart_shop, `member` for fitness)
- `household_addresses` (normalized hash server-side only)
- `household_join_requests`
- `parental_approvals`

### Endpoints

| Method | Path | Notes |
|--------|------|-------|
| POST | `/auth/register` | User + session only; `householdId: null`; optional `dateOfBirth` |
| POST | `/households` | Create household + owner + primary address (rejects if already in household) |
| POST | `/onboarding/address/discover` | `{ possibleMatch, matchCountBand }` only — no ids/hashes |
| POST | `/onboarding/join-requests` | Address body; exactly one hash match → pending request |
| GET | `/onboarding/join-requests/mine` | Requester status |
| GET | `/households/current/join-requests` | Owner/adult (invite policy) |
| POST | `/households/current/join-requests/:id/approve` | Creates membership |
| POST | `/households/current/join-requests/:id/reject` | |
| POST | `/onboarding/fitness/parental-request` | Teen 14–17; always generic `pending_or_queued` when eligible |
| GET | `/households/current/parental-approvals` | Parent/owner list |
| POST | `/households/current/parental-approvals/:id/approve` | Links teen + enrolls fitness |
| POST | `/households/current/parental-approvals/:id/revoke` | |
| GET | `/me/app-identity/:applicationKey` | `{ scope, householdId?, memberId? }` |

Env: `JOIN_TTL_HOURS` (default 168). Cleanup: `npm run cleanup:phase4-test` (hard-coded p4.* test emails only).

## Phase 2 (household accounts & invitations)

See ADR-002.

### Schema additions

- `user_accounts`, `user_sessions`
- `household_members`, `household_invitations`
- `households` extended with `name`, `owner_user_id`, `preferred_locale`, `updated_at` (still no address)

### User auth endpoints

| Method | Path | Notes |
|--------|------|-------|
| POST | `/auth/register` | Creates user + session only (`householdId: null`) |
| POST | `/auth/login` | User session cookie |
| POST | `/auth/logout` | Revokes user session |
| GET | `/auth/me` | Current user + current household id/role |

### Household endpoints

| Method | Path |
|--------|------|
| POST | `/households` |
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
| members.create_managed | yes | policy* | — | — | — |
| members.change_role | yes | — | — | — | — |
| members.remove | yes | — | — | — | — |
| members.manage_claims | yes | policy* | — | — | — |
| invitations.view | yes | yes | yes | yes | yes |
| invitations.revoke | yes | — | — | — | — |
| enrollments.view | yes | yes | yes | yes | yes |
| enrollments.manage | yes | policy* | — | — | — |

\*Adults get invite / managed / claims / enrollments.manage only when `ADULT_CAN_INVITE=true`. Adults may enroll **child/teen** targets only; owners may enroll any member.

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

Set unique `ADMIN_BOOTSTRAP_PASSWORD` before seed. Optional:

- `INVITE_TTL_HOURS` (default 168)
- `CLAIM_TTL_HOURS` (default 168)
- `JOIN_TTL_HOURS` (default 168)
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
| `npm run test` | Unit + Phase 2/4/4b API tests (need `DATABASE_URL`) |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Seed owner admin + app clients/keys |
| `npm run cleanup:phase4-test` | Delete hard-coded p4.* test users only |

## Security notes

- Passwords: Argon2id
- Session tokens + API keys + invite tokens: SHA-256 hashes at rest
- Cookies: HttpOnly, SameSite=Lax
- Login/register/invite-accept: rate limited
- Session/audit may record IP for **security only** — never as household identity
