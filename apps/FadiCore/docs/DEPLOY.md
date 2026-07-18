# Fadi Core API — Railway deployment guide

This document prepares **repository readiness** for hosting `@fadi-core/core-api` on Railway.  
It does **not** create cloud resources. Secrets stay in the host secret store — never in git.

## Service location

| Setting | Value |
|--------|--------|
| **Root Directory** | `apps/FadiCore/apps/core-api` |
| **Config file** | `apps/FadiCore/apps/core-api/railway.toml` (next to `package.json`) |
| **Start command** | `npm start` (`tsx src/index.ts`) |
| **Health endpoint** | `GET /health` → HTTP 200 |
| **Listen** | `0.0.0.0` and platform `PORT` (default local `8787`) |
| **Region (recommended)** | EU West (Amsterdam) — near Neon `eu-central-1` |

This package has its **own** `package-lock.json`. Do not set Root Directory to the monorepo root.

## Builder (no Dockerfile for now)

**Railpack** (Railway default) is sufficient for the current stack:

- Pure TypeScript run via `tsx` (no compile-to-`dist` step)
- Native dependency `argon2` is commonly built by Railpack/Nix-style builders

A Dockerfile is **not** added in Phase 5a.2.0 to avoid extra moving parts.  
If a Railway build fails on native modules, add a minimal Node 22 Dockerfile in a later task and set the builder to Dockerfile.

## Required production environment variables (names only)

Set these in Railway **Variables** (prefer **Sealed** for secrets):

| Name | Notes |
|------|--------|
| `NODE_ENV` | Must be `production` |
| `DATABASE_URL` | Neon **pooled** connection string |
| `COOKIE_SECURE` | Must be `true` in production (boot refuses otherwise) |
| `CORS_ORIGIN` | Comma-separated HTTPS origins (Vercel apps, admin) |
| `PORT` | Usually injected by Railway — do not hardcode |
| `SESSION_TTL_HOURS` | Optional (default 12) |
| `COOKIE_DOMAIN` | Optional; leave empty unless using a shared parent domain |
| `LOGIN_RATE_MAX` | Optional |
| `LOGIN_RATE_WINDOW_MS` | Optional |
| `INVITE_TTL_HOURS` | Optional |
| `CLAIM_TTL_HOURS` | Optional |
| `JOIN_TTL_HOURS` | Optional |
| `ADULT_CAN_INVITE` | Optional (`true` / `false`) |

Bootstrap seed vars (`ADMIN_BOOTSTRAP_EMAIL`, `ADMIN_BOOTSTRAP_PASSWORD`) are for **`npm run db:seed` only**, not required for normal API runtime. Never put secrets in `VITE_*` or frontend code.

Production boot also requires that development-only plaintext invite/claim tokens stay disabled (`NODE_ENV=production`).

## Migration workflow

Migrations are **not** run automatically on every HTTP request.

1. Ensure `DATABASE_URL` points at the target Neon database.
2. From `apps/FadiCore/apps/core-api` (or a Railway one-off run with the same root):

   ```bash
   npm run db:migrate
   ```

3. Confirm migrate completes successfully before routing users to a new schema-dependent deploy.
4. Prefer migrate **before** or as a controlled release step — not as a side effect of `npm start`.

Seed (`npm run db:seed`) is separate and should be rare in production.

## Suggested deployment sequence

1. Run tests and typecheck locally (see [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)).
2. Confirm Neon backup / PITR is enabled for the target database.
3. Apply migrations to that database.
4. Deploy the Core API service on Railway (staging first).
5. Verify `GET /health` returns 200.
6. Smoke-test login/register against staging with staging CORS origins.
7. Only then promote or deploy production with production CORS and sealed secrets.
8. Keep a known-good previous deployment available for rollback.

## Rollback overview

| Layer | What to do |
|-------|------------|
| **Bad application deploy** | In Railway: redeploy the previous successful deployment. |
| **Bad configuration / secrets** | Fix variables (sealed), redeploy. Mis-set `COOKIE_SECURE` prevents listen — fix and redeploy. |
| **Bad migration / data** | Application rollback does **not** undo schema/data. Use **Neon** PITR / backup restore. See [OWNER_RUNBOOK.md](./OWNER_RUNBOOK.md). |

## Related docs

- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) — before every production deploy  
- [OWNER_RUNBOOK.md](./OWNER_RUNBOOK.md) — incidents for a non-programmer owner  
- [../apps/core-api/.env.example](../apps/core-api/.env.example) — variable names for local/dev  
