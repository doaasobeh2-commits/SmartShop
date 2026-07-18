# Fadi Core — owner runbook

Simple steps when something goes wrong with the **Core API** (identity, login, households).  
You do **not** need to change application code to follow this guide.

**Important**

- Never paste passwords, database URLs, or API keys into chat, email, or tickets.
- Frontend apps (Recipe AI, etc.) on Vercel are separate from Core. This runbook is for the Core API host (Railway).
- The database lives on **Neon**. Rolling back the app on Railway does **not** undo database changes.

---

## Who does what

| Action | Who |
|--------|-----|
| Check `/health`, read Railway logs, redeploy previous version | Owner or trusted operator |
| Change sealed secrets on Railway | Owner only (or designated admin) |
| Run database migrate / restore Neon backup | Owner or technical helper with Neon access |
| Change application code | Developer |
| Put secrets in the website frontend | **Nobody** — never |

---

## 1. Service unavailable (app will not load / API errors)

1. Open the Railway project for Fadi Core API.
2. Confirm the **production** service is **Running** (not Crashed / Stopped).
3. In a browser, open: `https://<your-core-domain>/health`  
   - Expect a simple OK response.  
   - If the page does not load at all → hosting/DNS/Railway problem (continue below).  
   - If `/health` is OK but the app still fails → often CORS, cookies, or the frontend URL — ask a developer.
4. Open **Logs** for the service. Look for lines containing `Refusing to start` or `shutdown_failed`.  
   - `COOKIE_SECURE` / production configuration messages → go to **Secret misconfiguration**.  
   - Repeated crash loops → go to **Failed deployment** or ask a developer with the log **time**, not the secret values.

---

## 2. Health endpoint failure

1. Open `https://<your-core-domain>/health`.
2. If it is not OK:
   - Check Railway → latest deployment status (Failed / Crashed).
   - Check Logs around the deploy time.
3. If a **new** deploy just went out and health fails:
   - Prefer **Roll back** to the last deployment that was healthy (see **Rolling back**).
4. Do not keep retrying random setting changes. One rollback, then investigate.

---

## 3. Failed deployment

1. Railway → Deployments → find the failed deploy → open logs.
2. Common causes:
   - Wrong **Root Directory** (must be `apps/FadiCore/apps/core-api`)
   - Build failed (dependencies / native module) → ask a developer
   - App started then died because of missing/wrong env vars → **Secret misconfiguration**
3. If users are affected: **redeploy the previous successful deployment** immediately.
4. Only after users are stable, ask a developer to fix the failed build.

---

## 4. Database unavailable

Symptoms: login/register fail; API may return an error code like `database_unavailable` (no detailed message).

1. Open the **Neon** console for the production database.
2. Check that the project is active (not paused/deleted).
3. Check Railway logs for many `database_unavailable` / connection errors (do not copy connection strings into chats).
4. If Neon shows an incident or pause: wait or follow Neon’s restore/unpause guidance.
5. If Neon looks healthy but Core still fails: restart the Railway service once; if still broken, roll back the last Core deploy and contact a developer.
6. **Do not** run experimental SQL unless a developer guides you.

---

## 5. Secret misconfiguration

Symptoms: service never becomes healthy; logs say refusing to start; or cookies/login fail after a variable change.

1. Railway → Variables for the Core service.
2. Confirm these **names** exist for production (values stay in the dashboard only):
   - `NODE_ENV` = production  
   - `COOKIE_SECURE` = true  
   - `DATABASE_URL` = Neon pooled URL  
   - `CORS_ORIGIN` = your real HTTPS frontend origins  
3. After fixing variables, **Redeploy** (variable changes often need a new deploy).
4. Prefer **Sealed** variables for secrets so they cannot be casually copied out later.
5. If you rotated `DATABASE_URL`, ensure it still points at the correct Neon database.

---

## 6. Viewing logs

1. Railway → select the Core API service → **Logs**.
2. Filter by the time of the incident.
3. You may share with a developer: timestamps, HTTP paths, error **codes** (e.g. `database_unavailable`).
4. Never share: passwords, full `DATABASE_URL`, cookies, tokens, or personal user data from logs.

---

## 7. Rolling back (application)

Use when a **new Core deploy** broke the API but the database is fine.

1. Railway → Deployments.
2. Find the last deployment that was healthy.
3. Use **Redeploy** on that deployment (wording may be “Rollback” / “Redeploy”).
4. Wait until the service is Running.
5. Check `/health` again.
6. Tell affected users the service was restored; note the time for the developer.

This does **not** undo database migrations or data edits.

---

## 8. When to restore Neon backups

Use Neon PITR / backup restore when:

- A migration or script damaged data, or  
- Data was deleted/corrupted, and  
- Rolling back the **app** did not fix the data problem.

Steps (high level):

1. Pause further writes if possible (ask a developer whether to stop the API briefly).
2. In **Neon**, follow their restore / point-in-time recovery UI for the production branch/database.
3. Confirm the app’s `DATABASE_URL` still matches the restored database.
4. Redeploy or restart Core if needed; check `/health` and a test login.
5. Document what was restored and from which time.

If unsure whether you need Neon restore vs app rollback: **prefer app rollback first**, then call a developer before touching backups.

---

## 9. Quick decision guide

| Situation | First action |
|-----------|----------------|
| New deploy, health red | Roll back app deploy |
| Health green, login fails with DB errors | Check Neon, then secrets |
| Service never starts after env change | Fix `NODE_ENV` / `COOKIE_SECURE` / `DATABASE_URL`, redeploy |
| Data missing / wrong after migrate | Developer + Neon restore (not only app rollback) |
| Website down but `/health` OK | Likely frontend/CORS — developer |

---

## Related

- [DEPLOY.md](./DEPLOY.md) — how Core is meant to be deployed  
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) — checklist before every production deploy  
