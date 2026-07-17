/**
 * Controlled Neon Phase 4b verification (buildApp().inject).
 * Leaves p4b.* users for optional cleanup when verification passes.
 * Do not commit this unless requested — ephemeral verification runner.
 */
import assert from "node:assert/strict";
import { config as loadEnv } from "dotenv";
import { and, eq, isNull } from "drizzle-orm";

loadEnv();

process.env.ADULT_CAN_INVITE = "true";
process.env.NODE_ENV = "test";

const suffix = `${Date.now().toString(36)}`;
const password = "Phase4b_Verify_Pass_9x!";

const motherEmail = `p4b.mother.${suffix}@example.com`;
const fatherEmail = `p4b.father.${suffix}@example.com`;
const sonEmail = `p4b.son.${suffix}@example.com`;
const child14Email = `p4b.child14.${suffix}@example.com`;

// Unique per run so Neon does not hit ambiguous_address from prior p4b runs.
const sharedAddress = {
  countryCode: "AT",
  postalCode: "3100",
  city: "St. Pölten",
  street: `Example Street ${suffix}`,
  houseNumber: "12",
};

type StepResult = { name: string; ok: boolean; detail?: string };
const results: StepResult[] = [];
const leaksFound: string[] = [];

function cookieFrom(
  res: { headers: Record<string, unknown> },
  name = "fadi_user_session",
): string {
  const raw = res.headers["set-cookie"];
  const list = Array.isArray(raw) ? raw : raw ? [String(raw)] : [];
  return list
    .map((c) => String(c).split(";")[0])
    .filter((c) => c.startsWith(`${name}=`))
    .join("; ");
}

function assertNoLeaks(body: unknown, label: string) {
  const json = JSON.stringify(body);
  const patterns = [
    "normalized_address_hash",
    "normalizedAddressHash",
    "token_hash",
    "tokenHash",
    "password_hash",
    "passwordHash",
    "$argon2",
  ];
  for (const p of patterns) {
    if (json.toLowerCase().includes(p.toLowerCase()) || json.includes(p)) {
      // argon2 check is case-sensitive substring
      if (p === "$argon2" && !json.includes("$argon2")) continue;
      if (
        p !== "$argon2" &&
        !new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(json)
      ) {
        continue;
      }
      leaksFound.push(`${label}: ${p}`);
      throw new Error(`Secret leak in ${label}: ${p}`);
    }
  }
}

function step(name: string, fn: () => void | Promise<void>) {
  return (async () => {
    try {
      await fn();
      results.push({ name, ok: true });
      console.log(`PASS  ${name}`);
    } catch (e) {
      const detail = e instanceof Error ? e.message : String(e);
      results.push({ name, ok: false, detail });
      console.error(`FAIL  ${name}: ${detail}`);
      throw e;
    }
  })();
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL required");
  }

  const { buildApp } = await import("../app.js");
  const app = await buildApp();

  let motherCookie = "";
  let fatherCookie = "";
  let sonCookie = "";
  let child14Cookie = "";
  let motherHouseholdId = "";
  let motherMemberId = "";
  let fatherMemberId = "";
  let sonMemberId = "";
  let joinRequestId = "";
  let parentalApprovalId = "";
  let fatherUserId = "";
  let sonUserId = "";

  console.log("\n=== Phase 4b Neon verification ===");
  console.log(`suffix=${suffix}`);
  console.log(`emails: ${motherEmail}, ${fatherEmail}, ${sonEmail}, ${child14Email}`);
  console.log(`address: ${JSON.stringify(sharedAddress)}\n`);

  try {
    // --- Mother ---
    await step("Mother register: householdId null, no membership", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email: motherEmail,
          password,
          displayName: "P4b Mother",
          dateOfBirth: "1985-01-15",
        },
      });
      assert.equal(res.statusCode, 200, res.body);
      const body = res.json();
      assert.equal(body.householdId, null);
      assert.ok(body.user?.id);
      motherCookie = cookieFrom(res);
      assertNoLeaks(body, "mother.register");

      const me = await app.inject({
        method: "GET",
        url: "/auth/me",
        headers: { cookie: motherCookie },
      });
      assert.equal(me.statusCode, 200);
      assert.equal(me.json().householdId, null);
      assert.equal(me.json().memberId, null);
      assertNoLeaks(me.json(), "mother.me");
    });

    await step("Mother creates household with address", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/households",
        headers: { cookie: motherCookie },
        payload: {
          name: `P4b Mother Home ${suffix}`,
          address: sharedAddress,
        },
      });
      assert.equal(res.statusCode, 201, res.body);
      motherHouseholdId = res.json().household.id;
      assert.ok(motherHouseholdId);
      assertNoLeaks(res.json(), "mother.household");

      const me = await app.inject({
        method: "GET",
        url: "/auth/me",
        headers: { cookie: motherCookie },
      });
      motherMemberId = me.json().memberId;
      assert.ok(motherMemberId);
      assert.equal(me.json().householdId, motherHouseholdId);
    });

    await step("Mother enrolls recipe + smart_shop", async () => {
      for (const applicationKey of ["recipe", "smart_shop"] as const) {
        const res = await app.inject({
          method: "POST",
          url: `/households/current/members/${motherMemberId}/enrollments`,
          headers: { cookie: motherCookie },
          payload: { applicationKey },
        });
        assert.equal(res.statusCode, 201, `${applicationKey}: ${res.body}`);
        assertNoLeaks(res.json(), `mother.enroll.${applicationKey}`);
      }
    });

    await step("Mother app-identity recipe + smart_shop same householdId", async () => {
      const recipe = await app.inject({
        method: "GET",
        url: "/me/app-identity/recipe",
        headers: { cookie: motherCookie },
      });
      const shop = await app.inject({
        method: "GET",
        url: "/me/app-identity/smart_shop",
        headers: { cookie: motherCookie },
      });
      assert.equal(recipe.statusCode, 200, recipe.body);
      assert.equal(shop.statusCode, 200, shop.body);
      assert.equal(recipe.json().householdId, motherHouseholdId);
      assert.equal(shop.json().householdId, motherHouseholdId);
      assertNoLeaks(recipe.json(), "mother.identity.recipe");
      assertNoLeaks(shop.json(), "mother.identity.shop");
    });

    // --- Father ---
    await step("Father register: no auto household", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email: fatherEmail,
          password,
          displayName: "P4b Father",
          dateOfBirth: "1983-06-20",
        },
      });
      assert.equal(res.statusCode, 200, res.body);
      assert.equal(res.json().householdId, null);
      fatherUserId = res.json().user.id;
      fatherCookie = cookieFrom(res);
      assertNoLeaks(res.json(), "father.register");

      const me = await app.inject({
        method: "GET",
        url: "/auth/me",
        headers: { cookie: fatherCookie },
      });
      assert.equal(me.json().householdId, null);
      assert.equal(me.json().memberId, null);
    });

    await step("Father owns 0 households (no orphan)", async () => {
      const { db } = await import("../db/client.js");
      const { households } = await import("../db/schema/index.js");
      const rows = await db
        .select({ id: households.id })
        .from(households)
        .where(
          and(eq(households.ownerUserId, fatherUserId), isNull(households.deletedAt)),
        );
      assert.equal(rows.length, 0, `expected 0 owned households, got ${rows.length}`);
    });

    await step("Father address discover: possibleMatch, no ids/names", async () => {
      const discover = await app.inject({
        method: "POST",
        url: "/onboarding/address/discover",
        headers: { cookie: fatherCookie },
        payload: sharedAddress,
      });
      assert.equal(discover.statusCode, 200, discover.body);
      const body = discover.json();
      assert.equal(body.possibleMatch, true);
      assert.equal(body.householdId, undefined);
      assert.equal(body.households, undefined);
      assert.equal(body.members, undefined);
      assert.equal(body.name, undefined);
      assert.equal(body.householdName, undefined);
      const raw = discover.body;
      assert.equal(raw.includes(motherHouseholdId), false, "must not leak household id");
      assert.equal(/P4b Mother Home/i.test(raw), false, "must not leak household name");
      assertNoLeaks(body, "father.discover");
    });

    await step("Father join-request + mother approve", async () => {
      const create = await app.inject({
        method: "POST",
        url: "/onboarding/join-requests",
        headers: { cookie: fatherCookie },
        payload: { ...sharedAddress, requestedRole: "adult" },
      });
      assert.equal(create.statusCode, 201, create.body);
      joinRequestId = create.json().joinRequest.id;
      assert.equal(create.json().joinRequest.status, "pending");
      assertNoLeaks(create.json(), "father.joinCreate");

      const list = await app.inject({
        method: "GET",
        url: "/households/current/join-requests",
        headers: { cookie: motherCookie },
      });
      assert.equal(list.statusCode, 200, list.body);
      assert.ok(
        list.json().joinRequests.some((j: { id: string }) => j.id === joinRequestId),
      );
      assertNoLeaks(list.json(), "mother.joinList");

      const approve = await app.inject({
        method: "POST",
        url: `/households/current/join-requests/${joinRequestId}/approve`,
        headers: { cookie: motherCookie },
      });
      assert.equal(approve.statusCode, 200, approve.body);
      fatherMemberId = approve.json().memberId;
      assert.ok(fatherMemberId);
      assertNoLeaks(approve.json(), "mother.joinApprove");

      const me = await app.inject({
        method: "GET",
        url: "/auth/me",
        headers: { cookie: fatherCookie },
      });
      assert.equal(me.json().householdId, motherHouseholdId);
      assert.equal(me.json().memberId, fatherMemberId);
    });

    await step("Mother enrolls father: smart_shop + fitness + recipe", async () => {
      // Adults cannot self-enroll peers; owner manages enrollments for adults.
      for (const applicationKey of ["smart_shop", "fitness", "recipe"] as const) {
        const res = await app.inject({
          method: "POST",
          url: `/households/current/members/${fatherMemberId}/enrollments`,
          headers: { cookie: motherCookie },
          payload: { applicationKey },
        });
        assert.equal(res.statusCode, 201, `${applicationKey}: ${res.body}`);
        assertNoLeaks(res.json(), `father.enroll.${applicationKey}`);
      }
    });

    await step("Father+Mother app-identity same household (shop + recipe)", async () => {
      for (const appKey of ["smart_shop", "recipe"] as const) {
        const m = await app.inject({
          method: "GET",
          url: `/me/app-identity/${appKey}`,
          headers: { cookie: motherCookie },
        });
        const f = await app.inject({
          method: "GET",
          url: `/me/app-identity/${appKey}`,
          headers: { cookie: fatherCookie },
        });
        assert.equal(m.statusCode, 200, m.body);
        assert.equal(f.statusCode, 200, f.body);
        assert.equal(m.json().householdId, motherHouseholdId);
        assert.equal(f.json().householdId, motherHouseholdId);
        assert.equal(m.json().householdId, f.json().householdId);
        assertNoLeaks(m.json(), `mother.id.${appKey}`);
        assertNoLeaks(f.json(), `father.id.${appKey}`);
      }
    });

    // --- Son age 15 ---
    await step("Son register (DOB 2011-03-01): no household", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email: sonEmail,
          password,
          displayName: "P4b Son",
          dateOfBirth: "2011-03-01",
        },
      });
      assert.equal(res.statusCode, 200, res.body);
      assert.equal(res.json().householdId, null);
      sonUserId = res.json().user.id;
      sonCookie = cookieFrom(res);
      assertNoLeaks(res.json(), "son.register");
    });

    await step("Son parental-request → generic ok", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/onboarding/fitness/parental-request",
        headers: { cookie: sonCookie },
        payload: { parentEmail: motherEmail },
      });
      assert.equal(res.statusCode, 200, res.body);
      assert.equal(res.json().ok, true);
      assert.ok(["pending_or_queued", "pending"].includes(res.json().status));
      assertNoLeaks(res.json(), "son.parentalRequest");
    });

    await step("Mother approves parental; son linked; fitness active", async () => {
      const list = await app.inject({
        method: "GET",
        url: "/households/current/parental-approvals",
        headers: { cookie: motherCookie },
      });
      assert.equal(list.statusCode, 200, list.body);
      const pending = (
        list.json().approvals as Array<{
          id: string;
          status: string;
          requesterUserId: string;
        }>
      ).find((a) => a.status === "pending" && a.requesterUserId === sonUserId);
      assert.ok(pending, "pending parental approval for son not found");
      parentalApprovalId = pending!.id;
      assertNoLeaks(list.json(), "mother.parentalList");

      // Teen cannot self-approve
      const selfApprove = await app.inject({
        method: "POST",
        url: `/households/current/parental-approvals/${parentalApprovalId}/approve`,
        headers: { cookie: sonCookie },
      });
      assert.ok(
        [403, 404].includes(selfApprove.statusCode),
        `teen self-approve should fail, got ${selfApprove.statusCode}`,
      );

      const approve = await app.inject({
        method: "POST",
        url: `/households/current/parental-approvals/${parentalApprovalId}/approve`,
        headers: { cookie: motherCookie },
      });
      assert.equal(approve.statusCode, 200, approve.body);
      assertNoLeaks(approve.json(), "mother.parentalApprove");

      const sonMe = await app.inject({
        method: "GET",
        url: "/auth/me",
        headers: { cookie: sonCookie },
      });
      assert.equal(sonMe.statusCode, 200);
      assert.equal(sonMe.json().householdId, motherHouseholdId);
      sonMemberId = sonMe.json().memberId;
      assert.ok(sonMemberId);
      assert.notEqual(sonMemberId, motherMemberId);
      assert.notEqual(sonMemberId, fatherMemberId);
      assert.ok(
        (sonMe.json().enrollments as Array<{ applicationKey: string; status: string }>).some(
          (e) => e.applicationKey === "fitness" && e.status === "active",
        ),
        "son fitness enrollment not active",
      );
      assertNoLeaks(sonMe.json(), "son.me.afterApprove");
    });

    await step("No duplicate son members", async () => {
      const { db } = await import("../db/client.js");
      const { householdMembers } = await import("../db/schema/index.js");
      const rows = await db
        .select({ id: householdMembers.id, status: householdMembers.status })
        .from(householdMembers)
        .where(
          and(
            eq(householdMembers.householdId, motherHouseholdId),
            eq(householdMembers.userId, sonUserId),
          ),
        );
      const active = rows.filter((r) => r.status === "active");
      assert.equal(active.length, 1, `expected 1 active son member, got ${active.length}`);
    });

    await step("Under-14 parental-request → age_policy_blocked", async () => {
      const reg = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email: child14Email,
          password,
          displayName: "P4b Child14",
          dateOfBirth: "2015-01-01",
        },
      });
      assert.equal(reg.statusCode, 200, reg.body);
      child14Cookie = cookieFrom(reg);
      assert.equal(reg.json().householdId, null);

      const blocked = await app.inject({
        method: "POST",
        url: "/onboarding/fitness/parental-request",
        headers: { cookie: child14Cookie },
        payload: { parentEmail: motherEmail },
      });
      assert.equal(blocked.statusCode, 403, blocked.body);
      assert.equal(blocked.json().error, "age_policy_blocked");
      assertNoLeaks(blocked.json(), "child14.blocked");
    });

    await step("Admin GET household: privacy-safe address, history, no hashes", async () => {
      const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
      const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;
      assert.ok(email && adminPassword, "ADMIN_BOOTSTRAP_* required");

      const login = await app.inject({
        method: "POST",
        url: "/admin/auth/login",
        payload: { email, password: adminPassword },
      });
      assert.equal(login.statusCode, 200, login.body);
      const adminCookie = cookieFrom(login, "fadi_admin_session");

      const detail = await app.inject({
        method: "GET",
        url: `/admin/households/${motherHouseholdId}`,
        headers: { cookie: adminCookie },
      });
      assert.equal(detail.statusCode, 200, detail.body);
      const body = detail.json();
      assert.ok(body.addresses || body.address || body.household);
      // privacy-safe: postal prefix / city / country — no street full hash fields
      const raw = detail.body;
      assert.equal(/normalized_address_hash/i.test(raw), false);
      assert.equal(/normalizedAddressHash/i.test(raw), false);
      assert.equal(/token_hash/i.test(raw), false);
      assert.equal(/password_hash/i.test(raw), false);
      assert.equal(/\$argon2/.test(raw), false);

      const joins = body.joinRequests as unknown[] | undefined;
      const parentals = body.parentalApprovals as unknown[] | undefined;
      assert.ok(Array.isArray(joins) && joins.length >= 1, "join request history missing");
      assert.ok(
        Array.isArray(parentals) && parentals.length >= 1,
        "parental approval history missing",
      );
      assertNoLeaks(body, "admin.household");
    });

    console.log("\n=== SUMMARY: ALL PASSED ===");
  } catch (e) {
    console.error("\n=== SUMMARY: FAILED ===");
    console.error(e instanceof Error ? e.message : e);
  } finally {
    await app.close();
    const { closeDb } = await import("../db/client.js");
    await closeDb();
  }

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);
  console.log(`\nPassed ${passed}/${results.length}`);
  if (failed.length) {
    for (const f of failed) console.log(`  - ${f.name}: ${f.detail}`);
  }
  if (leaksFound.length) {
    console.log("Leaks:", leaksFound);
  }

  console.log("\n=== VERIFICATION USERS (leave for optional cleanup) ===");
  console.log(
    JSON.stringify(
      {
        suffix,
        motherEmail,
        fatherEmail,
        sonEmail,
        child14Email,
        motherHouseholdId,
        motherMemberId,
        fatherMemberId,
        sonMemberId,
        joinRequestId,
        parentalApprovalId,
        cleanupHint:
          "Optional: npm run cleanup:phase4-test or delete users matching p4b.*." + suffix,
      },
      null,
      2,
    ),
  );

  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
