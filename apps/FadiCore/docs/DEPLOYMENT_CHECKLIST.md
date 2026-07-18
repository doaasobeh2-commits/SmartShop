# Fadi Core — production deployment checklist

Complete **every** item before deploying Core API to **production**.  
Staging deploys should follow the same checklist where applicable.

Mark each box only when verified. Do not skip items under time pressure.

## Code quality

- [ ] `npm test` passes in `apps/FadiCore/apps/core-api` (all green)
- [ ] `npm run typecheck` passes in `apps/FadiCore/apps/core-api`
- [ ] Intended commit(s) reviewed; no accidental debug logging of secrets
- [ ] No untracked sensitive files staged (`.env`, key files, dumps, credentials)
- [ ] `git status` shows no secrets about to be committed

## Production boot & security

- [ ] `NODE_ENV=production` will be set on the target service
- [ ] `COOKIE_SECURE=true` will be set (required — process refuses to start otherwise)
- [ ] Development-only plaintext invite/claim tokens are disabled (`NODE_ENV=production`)
- [ ] No `developmentOnlyToken` expected in production API responses
- [ ] App API keys are **not** in any frontend or `VITE_*` variable (N/A until BFF; still verify)
- [ ] `CORS_ORIGIN` lists only intended HTTPS production origins (no `*`)
- [ ] `DATABASE_URL` is the Neon **pooled** URL for production (value only in secret store)

## Database

- [ ] Neon backup / PITR confirmed enabled for the production database
- [ ] Migrations applied successfully (`npm run db:migrate`) to that database
- [ ] Migration result reviewed (no unexpected failures)
- [ ] Seed not run accidentally with example bootstrap password

## Deploy & verify

- [ ] Railway Root Directory is `apps/FadiCore/apps/core-api`
- [ ] Start command is `npm start` (or matches `railway.toml`)
- [ ] Healthcheck path is `/health`
- [ ] After deploy: `GET /health` returns HTTP 200
- [ ] Smoke check: auth or a known safe endpoint behaves as expected
- [ ] Logs checked briefly for accidental secret printout (none)

## Rollback readiness

- [ ] Previous Railway deployment identified and can be redeployed
- [ ] Owner runbook available: [OWNER_RUNBOOK.md](./OWNER_RUNBOOK.md)
- [ ] Secret rotation steps known (who updates Railway sealed vars + Neon)
- [ ] Distinction clear: **service rollback ≠ Neon database restore**

## Sign-off

| Role | Name | Date |
|------|------|------|
| Deployer | | |
| Reviewer (optional) | | |

**Stop** if any box is unchecked. Fix the gap, then restart the checklist.
