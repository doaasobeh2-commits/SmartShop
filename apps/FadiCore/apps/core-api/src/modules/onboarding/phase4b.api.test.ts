import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { config as loadEnv } from "dotenv";

loadEnv();

process.env.ADULT_CAN_INVITE = "true";
process.env.NODE_ENV = "test";

const hasDb = Boolean(process.env.DATABASE_URL);

describe("phase4b registration address age api", { skip: !hasDb }, () => {
  let app: Awaited<ReturnType<typeof import("../../app.js").buildApp>>;

  const suffix = Date.now().toString(36);
  const password = "Phase4b_Test_Pass_9x!";
  const sharedAddress = {
    countryCode: "AT",
    postalCode: "3100",
    city: "St. Poelten",
    street: `Phase4b-${suffix}-Strasse`,
    houseNumber: `${suffix.slice(-4) || "77"}`,
  };

  const fatherEmail = `p4b.father.${suffix}@example.com`;
  const joinerEmail = `p4b.joiner.${suffix}@example.com`;
  const teenEmail = `p4b.teen.${suffix}@example.com`;
  const childEmail = `p4b.child.${suffix}@example.com`;
  const adultEmail = `p4b.adult.${suffix}@example.com`;

  let fatherCookie = "";
  let joinerCookie = "";
  let teenCookie = "";
  let fatherHouseholdId = "";
  let joinRequestId = "";
  let parentalApprovalId = "";

  function cookieFrom(res: { headers: Record<string, unknown> }): string {
    const raw = res.headers["set-cookie"];
    const list = Array.isArray(raw) ? raw : raw ? [String(raw)] : [];
    return list
      .map((c) => String(c).split(";")[0])
      .filter((c) => c.startsWith("fadi_user_session="))
      .join("; ");
  }

  function assertNoLeaks(body: unknown) {
    const json = JSON.stringify(body);
    assert.equal(/normalizedAddressHash/i.test(json), false);
    assert.equal(/normalized_address_hash/i.test(json), false);
    assert.equal(/password_hash/i.test(json), false);
    assert.equal(/tokenHash/i.test(json), false);
    assert.equal(/\$argon2/i.test(json), false);
  }

  function teenDob(): string {
    const d = new Date();
    d.setUTCFullYear(d.getUTCFullYear() - 15);
    return d.toISOString().slice(0, 10);
  }

  function childDob(): string {
    const d = new Date();
    d.setUTCFullYear(d.getUTCFullYear() - 12);
    return d.toISOString().slice(0, 10);
  }

  function adultDob(): string {
    const d = new Date();
    d.setUTCFullYear(d.getUTCFullYear() - 30);
    return d.toISOString().slice(0, 10);
  }

  const adultDobValue = adultDob();
  const teenDobValue = teenDob();
  const childDobValue = childDob();

  before(async () => {
    const appMod = await import("../../app.js");
    app = await appMod.buildApp();
  });

  after(async () => {
    await app.close();
    const { closeDb } = await import("../../db/client.js");
    await closeDb();
  });

  it("registers without household", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: fatherEmail,
        password,
        displayName: "Father",
        dateOfBirth: adultDobValue,
      },
    });
    assert.equal(res.statusCode, 200);
    assert.equal(res.json().householdId, null);
    assert.ok(res.json().user?.id);
    assert.equal(res.json().user.dateOfBirth, adultDobValue);
    fatherCookie = cookieFrom(res);
    assertNoLeaks(res.json());

    const me = await app.inject({
      method: "GET",
      url: "/auth/me",
      headers: { cookie: fatherCookie },
    });
    assert.equal(me.statusCode, 200);
    assert.equal(me.json().householdId, null);
    assert.equal(me.json().memberId, null);
  });

  it("creates household with address", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/households",
      headers: { cookie: fatherCookie },
      payload: {
        name: "Phase4b Home",
        address: sharedAddress,
      },
    });
    assert.equal(res.statusCode, 201, res.body);
    fatherHouseholdId = res.json().household.id;
    assert.ok(fatherHouseholdId);
    assertNoLeaks(res.json());

    const dup = await app.inject({
      method: "POST",
      url: "/households",
      headers: { cookie: fatherCookie },
      payload: {
        name: "Second Home",
        address: { ...sharedAddress, houseNumber: "99" },
      },
    });
    assert.equal(dup.statusCode, 409);
    assert.equal(dup.json().error, "already_in_household");
  });

  it("address discover returns bands only — no household leak", async () => {
    const joinerReg = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: joinerEmail,
        password,
        displayName: "Joiner",
        dateOfBirth: adultDobValue,
      },
    });
    assert.equal(joinerReg.statusCode, 200);
    joinerCookie = cookieFrom(joinerReg);

    const discover = await app.inject({
      method: "POST",
      url: "/onboarding/address/discover",
      headers: { cookie: joinerCookie },
      payload: sharedAddress,
    });
    assert.equal(discover.statusCode, 200);
    assert.equal(discover.json().possibleMatch, true);
    assert.equal(discover.json().matchCountBand, "one");
    assert.equal(discover.json().householdId, undefined);
    assert.equal(discover.json().households, undefined);
    assert.equal(discover.json().members, undefined);
    assertNoLeaks(discover.json());

    const none = await app.inject({
      method: "POST",
      url: "/onboarding/address/discover",
      headers: { cookie: joinerCookie },
      payload: {
        ...sharedAddress,
        street: "Unknown Road",
        houseNumber: "1",
      },
    });
    assert.equal(none.statusCode, 200);
    assert.equal(none.json().possibleMatch, false);
    assert.equal(none.json().matchCountBand, "none");
  });

  it("join request approve flow", async () => {
    const create = await app.inject({
      method: "POST",
      url: "/onboarding/join-requests",
      headers: { cookie: joinerCookie },
      payload: { ...sharedAddress, requestedRole: "adult" },
    });
    assert.equal(create.statusCode, 201, create.body);
    joinRequestId = create.json().joinRequest.id;
    assert.equal(create.json().joinRequest.status, "pending");
    assertNoLeaks(create.json());

    const mine = await app.inject({
      method: "GET",
      url: "/onboarding/join-requests/mine",
      headers: { cookie: joinerCookie },
    });
    assert.equal(mine.statusCode, 200);
    assert.ok(
      mine.json().joinRequests.some((j: { id: string }) => j.id === joinRequestId),
    );

    const list = await app.inject({
      method: "GET",
      url: "/households/current/join-requests",
      headers: { cookie: fatherCookie },
    });
    assert.equal(list.statusCode, 200);
    assert.ok(
      list.json().joinRequests.some((j: { id: string }) => j.id === joinRequestId),
    );

    const approve = await app.inject({
      method: "POST",
      url: `/households/current/join-requests/${joinRequestId}/approve`,
      headers: { cookie: fatherCookie },
    });
    assert.equal(approve.statusCode, 200, approve.body);
    assert.ok(approve.json().memberId);

    const me = await app.inject({
      method: "GET",
      url: "/auth/me",
      headers: { cookie: joinerCookie },
    });
    assert.equal(me.json().householdId, fatherHouseholdId);
    assert.equal(me.json().memberRole, "adult");
  });

  it("age policy for smart_shop / recipe / fitness", async () => {
    const adultReg = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: adultEmail,
        password,
        displayName: "Adult Solo",
        dateOfBirth: adultDobValue,
      },
    });
    assert.equal(adultReg.statusCode, 200);
    const adultCookie = cookieFrom(adultReg);

    const adultCreate = await app.inject({
      method: "POST",
      url: "/households",
      headers: { cookie: adultCookie },
      payload: {
        name: "Adult Home",
        address: {
          countryCode: "AT",
          postalCode: "1010",
          city: "Wien",
          street: "Adultgasse",
          houseNumber: "1",
        },
      },
    });
    assert.equal(adultCreate.statusCode, 201);
    const adultMemberId = (
      await app.inject({
        method: "GET",
        url: "/auth/me",
        headers: { cookie: adultCookie },
      })
    ).json().memberId as string;

    const recipe = await app.inject({
      method: "POST",
      url: `/households/current/members/${adultMemberId}/enrollments`,
      headers: { cookie: adultCookie },
      payload: { applicationKey: "recipe" },
    });
    assert.equal(recipe.statusCode, 201, recipe.body);

    const shop = await app.inject({
      method: "POST",
      url: `/households/current/members/${adultMemberId}/enrollments`,
      headers: { cookie: adultCookie },
      payload: { applicationKey: "smart_shop" },
    });
    assert.equal(shop.statusCode, 201, shop.body);

    const fitness = await app.inject({
      method: "POST",
      url: `/households/current/members/${adultMemberId}/enrollments`,
      headers: { cookie: adultCookie },
      payload: { applicationKey: "fitness" },
    });
    assert.equal(fitness.statusCode, 201, fitness.body);

    const childReg = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: childEmail,
        password,
        displayName: "Young Child",
        dateOfBirth: childDobValue,
      },
    });
    assert.equal(childReg.statusCode, 200);
    const childCookie = cookieFrom(childReg);

    const blocked = await app.inject({
      method: "POST",
      url: "/onboarding/fitness/parental-request",
      headers: { cookie: childCookie },
      payload: { parentEmail: fatherEmail },
    });
    assert.equal(blocked.statusCode, 403);
    assert.equal(blocked.json().error, "age_policy_blocked");
  });

  it("parental approval flow for teen fitness", async () => {
    const teenReg = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: teenEmail,
        password,
        displayName: "Teen User",
        dateOfBirth: teenDobValue,
      },
    });
    assert.equal(teenReg.statusCode, 200);
    assert.equal(teenReg.json().householdId, null);
    teenCookie = cookieFrom(teenReg);

    const request = await app.inject({
      method: "POST",
      url: "/onboarding/fitness/parental-request",
      headers: { cookie: teenCookie },
      payload: { parentEmail: fatherEmail },
    });
    assert.equal(request.statusCode, 200);
    assert.equal(request.json().ok, true);
    assert.equal(request.json().status, "pending_or_queued");

    const unknown = await app.inject({
      method: "POST",
      url: "/onboarding/fitness/parental-request",
      headers: { cookie: teenCookie },
      payload: { parentEmail: `unknown.${suffix}@example.com` },
    });
    assert.equal(unknown.statusCode, 200);
    assert.equal(unknown.json().status, "pending_or_queued");

    const list = await app.inject({
      method: "GET",
      url: "/households/current/parental-approvals",
      headers: { cookie: fatherCookie },
    });
    assert.equal(list.statusCode, 200);
    const pending = (
      list.json().approvals as Array<{
        id: string;
        status: string;
        requesterUserId: string;
      }>
    ).find((a) => a.status === "pending");
    assert.ok(pending);
    parentalApprovalId = pending!.id;

    const selfApprove = await app.inject({
      method: "POST",
      url: `/households/current/parental-approvals/${parentalApprovalId}/approve`,
      headers: { cookie: teenCookie },
    });
    assert.ok([403, 404].includes(selfApprove.statusCode));

    const approve = await app.inject({
      method: "POST",
      url: `/households/current/parental-approvals/${parentalApprovalId}/approve`,
      headers: { cookie: fatherCookie },
    });
    assert.equal(approve.statusCode, 200, approve.body);

    const teenMe = await app.inject({
      method: "GET",
      url: "/auth/me",
      headers: { cookie: teenCookie },
    });
    assert.equal(teenMe.statusCode, 200);
    assert.equal(teenMe.json().householdId, fatherHouseholdId);
    assert.ok(
      teenMe.json().enrollments.some(
        (e: { applicationKey: string; status: string }) =>
          e.applicationKey === "fitness" && e.status === "active",
      ),
    );
  });

  it("app identity returns scope without secrets", async () => {
    const recipeId = await app.inject({
      method: "GET",
      url: "/me/app-identity/recipe",
      headers: { cookie: fatherCookie },
    });
    assert.equal(recipeId.statusCode, 200);
    assert.equal(recipeId.json().scope, "household");
    assert.equal(recipeId.json().householdId, fatherHouseholdId);
    assert.ok(recipeId.json().memberId);
    assertNoLeaks(recipeId.json());

    const fitnessId = await app.inject({
      method: "GET",
      url: "/me/app-identity/fitness",
      headers: { cookie: fatherCookie },
    });
    assert.equal(fitnessId.statusCode, 200);
    assert.equal(fitnessId.json().scope, "member");
    assertNoLeaks(fitnessId.json());

    const apps = await app.inject({
      method: "GET",
      url: "/applications",
      headers: { cookie: fatherCookie },
    });
    assert.equal(apps.statusCode, 200);
    const byKey = Object.fromEntries(
      (
        apps.json().applications as Array<{ key: string; scope: string }>
      ).map((a) => [a.key, a.scope]),
    );
    assert.equal(byKey.recipe, "household");
    assert.equal(byKey.smart_shop, "household");
    assert.equal(byKey.fitness, "member");
  });
});
