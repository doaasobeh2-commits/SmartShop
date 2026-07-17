# Fadi Core

Canonical platform backend for shared household identity, aliases, cross-app memory, hypotheses, permissions, and projections.

Connected apps remain domain owners:

- **SmartShop** — shopping, basket, pantry, purchase, budget (local-first in St. Pölten)
- **Recipe AI** — recipes, meals, cooking activity, recipe feedback (not city-locked)
- **Fitness AI** — workouts, activity, fitness goals (not city-locked)

## Household identity (approved)

See [`docs/ADR-001-household-identity.md`](docs/ADR-001-household-identity.md).

Summary:

- Fadi Core owns stable `household_id` and shared cross-app memory
- Family linking uses **authenticated Fadi accounts** + invitations (Phase 2)
- **Never** use IP addresses to create or link households
- IP may only be used later for security, rate limiting, or approximate country detection
- Phase 1 `households` stores aliases only — no personal data / no full address
- Invitations, membership permissions, and privacy controls are **Phase 2**
- Billing / family subscription is documentation-only for now (no implementation; example prices are not approved)

## Phase 1 (this delivery)

Foundation only:

- Fastify + TypeScript API
- PostgreSQL + Drizzle migrations
- Admin session auth (Argon2 passwords, HttpOnly cookies)
- Schema: `admin_users`, `admin_sessions`, `households`, `app_clients`, `app_api_keys`, `audit_logs`
- Seed: one owner admin + three app clients (refuses example passwords)
- Endpoints: health + admin login/me/logout
- Clear `503 database_unavailable` when Postgres is down

Not included yet: signal ingest, engines, Redis/queues, GDPR jobs, invitations, frontend wiring, billing.

## Local setup

### 1. Start Postgres

Requires Docker Desktop (or any Postgres reachable via `DATABASE_URL`).

```bash
cd apps/FadiCore
docker compose up -d
```

Postgres listens on **localhost:5433**.

### 2. Configure API env

```bash
cd apps/core-api
cp .env.example .env
npm install
```

**Required before seed:** set a unique `ADMIN_BOOTSTRAP_PASSWORD` in `.env`.  
Seed **refuses** the example/default password from `.env.example`.

Also set:

- `ADMIN_BOOTSTRAP_EMAIL`
- `DATABASE_URL` (if not using compose defaults)

Never commit `.env` or real secrets.

### 3. Migrate + seed

```bash
npm run db:generate   # only when schema changes
npm run db:migrate
npm run db:seed
```

Seed prints **app API key plaintexts once**. Store them securely. They are never written to the database in plaintext (hashes only).

### 4. Run API

```bash
npm run dev
```

API default: `http://localhost:8787`

### 5. Verify

Use the email/password from **your** `.env` (not the example password):

```bash
curl http://localhost:8787/health

curl -X POST http://localhost:8787/admin/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d "{\"email\":\"YOUR_ADMIN_EMAIL\",\"password\":\"YOUR_ADMIN_PASSWORD\"}"

curl http://localhost:8787/admin/auth/me -b cookies.txt

curl -X POST http://localhost:8787/admin/auth/logout -b cookies.txt -c cookies.txt
```

If Postgres is down, login returns `503` with `error: "database_unavailable"` (not a generic 500).

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Watch API |
| `npm run build` / `typecheck` | TypeScript check |
| `npm run test` | Unit tests (Node test runner) |
| `npm run db:generate` | Generate Drizzle SQL migration from schema |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Seed owner + app clients/keys |

## Security notes

- Passwords: Argon2id
- Session tokens + API keys: SHA-256 hashes only at rest
- Session cookie: HttpOnly, SameSite=Lax
- Login route: rate limited
- Admin session / audit may record IP for **security only** — never as household identity
- Household table stores aliases only — no personal data in Phase 1
