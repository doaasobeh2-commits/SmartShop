import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { config as loadEnv } from "dotenv";
import { eq } from "drizzle-orm";

loadEnv();

// Ensure adult enrollment policy is on for this suite (config loads with app import).
process.env.ADULT_CAN_INVITE = "true";
process.env.NODE_ENV = "test";

const hasDb = Boolean(process.env.DATABASE_URL);

describe("phase4 shared family apps api", { skip: !hasDb }, () => {
  let app: Awaited<ReturnType<typeof import("../../app.js").buildApp>>;
  let db: typeof import("../../db/client.js").db;
  let memberAccountClaims: typeof import("../../db/schema/index.js").memberAccountClaims;
  let hashToken: typeof import("../auth/crypto.js").hashToken;

  const suffix = Date.now().toString(36);
  const ownerEmail = `p4.owner.${suffix}@example.com`;
  const adultEmail = `p4.adult.${suffix}@example.com`;
  const claimerEmail = `p4.claim.${suffix}@example.com`;
  const conflictEmail = `p4.conflict.${suffix}@example.com`;
  const password = "Phase4_Family_Pass_9x!";
  const defaultAddress = {
    countryCode: "AT",
    postalCode: "3100",
    city: "St. Poelten",
    street: "Familienweg",
    houseNumber: "4",
  };

  let ownerCookie = "";
  let adultCookie = "";
  let claimerCookie = "";
  let conflictCookie = "";
  let householdId = "";
  let ownerMemberId = "";
  let childMemberId = "";
  let teenMemberId = "";
  let enrollmentId = "";
  let claimToken = "";
  let claimId = "";

  function cookieFrom(res: { headers: Record<string, unknown> }): string {
    const raw = res.headers["set-cookie"];
    const list = Array.isArray(raw) ? raw : raw ? [String(raw)] : [];
    return list
      .map((c) => String(c).split(";")[0])
      .filter((c) => c.startsWith("fadi_user_session="))
      .join("; ");
  }

  function assertNoSecrets(body: unknown) {
    const json = JSON.stringify(body);
    assert.equal(/password_hash/i.test(json), false);
    assert.equal(/token_hash/i.test(json), false);
    assert.equal(/tokenHash/i.test(json), false);
    assert.equal(/\$argon2/i.test(json), false);
    assert.equal(/normalizedAddressHash/i.test(json), false);
    assert.equal(/normalized_address_hash/i.test(json), false);
  }

  async function registerThenCreateHousehold(input: {
    email: string;
    password: string;
    displayName: string;
    householdName: string;
    address?: typeof defaultAddress;
  }) {
    const reg = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: input.email,
        password: input.password,
        displayName: input.displayName,
      },
    });
    if (reg.statusCode !== 200) return { reg, create: null as null };
    const create = await app.inject({
      method: "POST",
      url: "/households",
      headers: { cookie: cookieFrom(reg) },
      payload: {
        name: input.householdName,
        address: input.address ?? {
          ...defaultAddress,
          houseNumber: String(Math.floor(Math.random() * 9000) + 100),
        },
      },
    });
    return { reg, create };
  }

  before(async () => {
    const appMod = await import("../../app.js");
    app = await appMod.buildApp();
    ({ db } = await import("../../db/client.js"));
    ({ memberAccountClaims } = await import("../../db/schema/index.js"));
    ({ hashToken } = await import("../auth/crypto.js"));
  });

  after(async () => {
    await app.close();
    const { closeDb } = await import("../../db/client.js");
    await closeDb();
  });

  it("health reports phase 4", async () => {
    const res = await app.inject({ method: "GET", url: "/health" });
    assert.equal(res.statusCode, 200);
    assert.equal(res.json().phase, 4);
  });

  it("registers owner then creates household", async () => {
    const { reg, create } = await registerThenCreateHousehold({
      email: ownerEmail,
      password,
      displayName: "Phase4 Owner",
      householdName: "Phase4 Family",
      address: defaultAddress,
    });
    assert.equal(reg.statusCode, 200);
    assert.equal(reg.json().householdId, null);
    assert.ok(create);
    assert.equal(create!.statusCode, 201);
    householdId = create!.json().household.id;
    ownerCookie = cookieFrom(reg);
    assert.ok(ownerCookie);

    const me = await app.inject({
      method: "GET",
      url: "/auth/me",
      headers: { cookie: ownerCookie },
    });
    assert.equal(me.statusCode, 200);
    assert.equal(me.json().householdId, householdId);
    assert.ok(me.json().memberId);
    assert.deepEqual(me.json().enrollments, []);
    ownerMemberId = me.json().memberId;
    assertNoSecrets(me.json());
  });

  it("lists platform applications", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/applications",
      headers: { cookie: ownerCookie },
    });
    assert.equal(res.statusCode, 200);
    const keys = res.json().applications.map((a: { key: string }) => a.key);
    assert.ok(keys.includes("recipe"));
    assert.ok(keys.includes("fitness"));
    assert.ok(keys.includes("smart_shop"));
    assertNoSecrets(res.json());
  });

  it("rejects creating managed owner/adult roles", async () => {
    for (const role of ["owner", "adult"] as const) {
      const res = await app.inject({
        method: "POST",
        url: "/households/current/members",
        headers: { cookie: ownerCookie },
        payload: { displayName: "Bad", role },
      });
      assert.equal(res.statusCode, 400);
    }
  });

  it("creates managed child and teen members", async () => {
    const child = await app.inject({
      method: "POST",
      url: "/households/current/members",
      headers: { cookie: ownerCookie },
      payload: {
        displayName: "Kid One",
        role: "child",
        preferredLocale: "de",
      },
    });
    assert.equal(child.statusCode, 201);
    assertNoSecrets(child.json());
    assert.equal(child.json().member.linkedAccount, false);
    assert.equal(child.json().member.userId, null);
    assert.equal(child.json().member.displayName, "Kid One");
    assert.equal(child.json().member.preferredLocale, "de");
    assert.equal(child.json().member.createdByMemberId, ownerMemberId);
    childMemberId = child.json().member.id;

    const teen = await app.inject({
      method: "POST",
      url: "/households/current/members",
      headers: { cookie: ownerCookie },
      payload: { displayName: "Teen One", role: "teen" },
    });
    assert.equal(teen.statusCode, 201);
    teenMemberId = teen.json().member.id;
  });

  it("lists managed members alongside linked owner", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/households/current/members",
      headers: { cookie: ownerCookie },
    });
    assert.equal(res.statusCode, 200);
    const members = res.json().members as Array<{
      id: string;
      linkedAccount: boolean;
      displayName: string;
    }>;
    assert.ok(members.some((m) => m.id === childMemberId && !m.linkedAccount));
    assert.ok(members.some((m) => m.linkedAccount && m.displayName));
    assertNoSecrets(res.json());
  });

  it("updates managed member displayName and preferredLocale", async () => {
    const res = await app.inject({
      method: "PATCH",
      url: `/households/current/members/${childMemberId}`,
      headers: { cookie: ownerCookie },
      payload: { displayName: "Kid Updated", preferredLocale: "en" },
    });
    assert.equal(res.statusCode, 200);
    assert.equal(res.json().member.displayName, "Kid Updated");
    assert.equal(res.json().member.preferredLocale, "en");
  });

  it("enrolls child in recipe and rejects duplicate", async () => {
    const created = await app.inject({
      method: "POST",
      url: `/households/current/members/${childMemberId}/enrollments`,
      headers: { cookie: ownerCookie },
      payload: { applicationKey: "recipe" },
    });
    assert.equal(created.statusCode, 201);
    assert.equal(created.json().enrollment.applicationKey, "recipe");
    assert.equal(created.json().enrollment.status, "active");
    enrollmentId = created.json().enrollment.id;
    assertNoSecrets(created.json());

    const dup = await app.inject({
      method: "POST",
      url: `/households/current/members/${childMemberId}/enrollments`,
      headers: { cookie: ownerCookie },
      payload: { applicationKey: "recipe" },
    });
    assert.equal(dup.statusCode, 409);
    assert.equal(dup.json().error, "duplicate_enrollment");
  });

  it("lists household and member enrollments; patches status", async () => {
    const all = await app.inject({
      method: "GET",
      url: "/households/current/enrollments",
      headers: { cookie: ownerCookie },
    });
    assert.equal(all.statusCode, 200);
    assert.ok(
      all.json().enrollments.some((e: { id: string }) => e.id === enrollmentId),
    );

    const byMember = await app.inject({
      method: "GET",
      url: `/households/current/members/${childMemberId}/enrollments`,
      headers: { cookie: ownerCookie },
    });
    assert.equal(byMember.statusCode, 200);
    assert.equal(byMember.json().enrollments.length, 1);

    const patched = await app.inject({
      method: "PATCH",
      url: `/households/current/enrollments/${enrollmentId}`,
      headers: { cookie: ownerCookie },
      payload: { status: "suspended" },
    });
    assert.equal(patched.statusCode, 200);
    assert.equal(patched.json().enrollment.status, "suspended");

    await app.inject({
      method: "PATCH",
      url: `/households/current/enrollments/${enrollmentId}`,
      headers: { cookie: ownerCookie },
      payload: { status: "active" },
    });
  });

  it("creates claim invitation with hashed token only", async () => {
    const res = await app.inject({
      method: "POST",
      url: `/households/current/members/${childMemberId}/claims`,
      headers: { cookie: ownerCookie },
      payload: {},
    });
    assert.equal(res.statusCode, 200);
    assertNoSecrets(res.json());
    assert.equal(res.json().claim.tokenHash, undefined);
    assert.ok(res.json().developmentOnlyToken);
    claimToken = res.json().developmentOnlyToken;
    claimId = res.json().claim.id;

    const stored = await db
      .select()
      .from(memberAccountClaims)
      .where(eq(memberAccountClaims.id, claimId))
      .limit(1);
    assert.equal(stored[0]?.tokenHash, hashToken(claimToken));
    assert.notEqual(stored[0]?.tokenHash, claimToken);
  });

  it("rejects claim accept when account already linked elsewhere", async () => {
    const { reg, create } = await registerThenCreateHousehold({
      email: conflictEmail,
      password,
      displayName: "Conflict User",
      householdName: "Conflict Home",
    });
    assert.equal(reg.statusCode, 200);
    assert.ok(create);
    assert.equal(create!.statusCode, 201);
    conflictCookie = cookieFrom(reg);

    const res = await app.inject({
      method: "POST",
      url: `/members/claims/${claimToken}/accept`,
      headers: { cookie: conflictCookie },
    });
    assert.equal(res.statusCode, 409);
    assert.equal(res.json().error, "account_already_linked");
  });

  it("accepts claim for account without household", async () => {
    const reg = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: claimerEmail,
        password,
        displayName: "Claimer",
      },
    });
    assert.equal(reg.statusCode, 200);
    assert.equal(reg.json().householdId, null);
    claimerCookie = cookieFrom(reg);

    const res = await app.inject({
      method: "POST",
      url: `/members/claims/${claimToken}/accept`,
      headers: { cookie: claimerCookie },
    });
    assert.equal(res.statusCode, 200, res.body);
    assert.equal(res.json().memberId, childMemberId);
    assert.equal(res.json().householdId, householdId);
    assert.equal(res.json().role, "child");

    const me = await app.inject({
      method: "GET",
      url: "/auth/me",
      headers: { cookie: claimerCookie },
    });
    assert.equal(me.statusCode, 200);
    assert.equal(me.json().memberId, childMemberId);
    assert.equal(me.json().householdId, householdId);
    assert.ok(
      me.json().enrollments.some(
        (e: { applicationKey: string; status: string }) =>
          e.applicationKey === "recipe" && e.status === "active",
      ),
    );

    const reuse = await app.inject({
      method: "POST",
      url: `/members/claims/${claimToken}/accept`,
      headers: { cookie: claimerCookie },
    });
    assert.ok(reuse.statusCode === 409 || reuse.statusCode === 400);
  });

  it("rejects claim for already-linked member", async () => {
    const res = await app.inject({
      method: "POST",
      url: `/households/current/members/${childMemberId}/claims`,
      headers: { cookie: ownerCookie },
      payload: {},
    });
    assert.equal(res.statusCode, 409);
    assert.equal(res.json().error, "already_linked");
  });

  it("invites adult and enforces adult enrollment rules for minors only", async () => {
    const invite = await app.inject({
      method: "POST",
      url: "/households/current/invitations",
      headers: { cookie: ownerCookie },
      payload: { email: adultEmail, role: "adult" },
    });
    assert.equal(invite.statusCode, 200);
    const token = invite.json().developmentOnlyToken as string;

    const adultReg = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: adultEmail,
        password,
        displayName: "Adult Helper",
      },
    });
    assert.equal(adultReg.statusCode, 200);
    adultCookie = cookieFrom(adultReg);

    const accept = await app.inject({
      method: "POST",
      url: `/invitations/${token}/accept`,
      headers: { cookie: adultCookie },
    });
    assert.equal(accept.statusCode, 200);

    // Adult may not enroll teen in fitness without parental approval
    const enrollTeen = await app.inject({
      method: "POST",
      url: `/households/current/members/${teenMemberId}/enrollments`,
      headers: { cookie: adultCookie },
      payload: { applicationKey: "fitness" },
    });
    assert.equal(enrollTeen.statusCode, 403);
    assert.equal(enrollTeen.json().error, "parental_approval_required");

    // Create caregiver managed by owner; adult cannot enroll non-minor caregiver
    const caregiver = await app.inject({
      method: "POST",
      url: "/households/current/members",
      headers: { cookie: ownerCookie },
      payload: { displayName: "Caregiver", role: "caregiver" },
    });
    assert.equal(caregiver.statusCode, 201);
    const caregiverId = caregiver.json().member.id;

    const enrollCaregiver = await app.inject({
      method: "POST",
      url: `/households/current/members/${caregiverId}/enrollments`,
      headers: { cookie: adultCookie },
      payload: { applicationKey: "smart_shop" },
    });
    assert.equal(enrollCaregiver.statusCode, 403);
  });

  it("rejects cross-household member enrollment", async () => {
    const { reg, create } = await registerThenCreateHousehold({
      email: `p4.other.${suffix}@example.com`,
      password,
      displayName: "Other Owner",
      householdName: "Other Home",
    });
    assert.equal(reg.statusCode, 200);
    assert.ok(create);
    assert.equal(create!.statusCode, 201);
    const otherCookie = cookieFrom(reg);

    const res = await app.inject({
      method: "POST",
      url: `/households/current/members/${teenMemberId}/enrollments`,
      headers: { cookie: otherCookie },
      payload: { applicationKey: "recipe" },
    });
    assert.equal(res.statusCode, 404);
  });

  it("preserves sole-owner protection", async () => {
    const members = await app.inject({
      method: "GET",
      url: "/households/current/members",
      headers: { cookie: ownerCookie },
    });
    const owner = (members.json().members as Array<{ id: string; role: string }>).find(
      (m) => m.role === "owner",
    );
    assert.ok(owner);

    const demote = await app.inject({
      method: "PATCH",
      url: `/households/current/members/${owner!.id}`,
      headers: { cookie: ownerCookie },
      payload: { role: "adult" },
    });
    assert.equal(demote.statusCode, 403);

    const remove = await app.inject({
      method: "DELETE",
      url: `/households/current/members/${owner!.id}`,
      headers: { cookie: ownerCookie },
    });
    assert.equal(remove.statusCode, 403);
  });
});
