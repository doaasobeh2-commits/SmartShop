import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { config as loadEnv } from "dotenv";
import { eq } from "drizzle-orm";

loadEnv();

const hasDb = Boolean(process.env.DATABASE_URL);

describe("phase2 household api", { skip: !hasDb }, () => {
  let app: Awaited<ReturnType<typeof import("../../app.js").buildApp>>;
  let db: typeof import("../../db/client.js").db;
  let userAccounts: typeof import("../../db/schema/index.js").userAccounts;
  let householdInvitations: typeof import("../../db/schema/index.js").householdInvitations;
  let hashToken: typeof import("../auth/crypto.js").hashToken;

  const suffix = Date.now().toString(36);
  const ownerEmail = `owner.${suffix}@example.com`;
  const memberEmail = `member.${suffix}@example.com`;
  const password = "Phase2_Test_Pass_9x!";

  let ownerCookie = "";
  let memberCookie = "";
  let ownerId = "";
  let householdId = "";
  let inviteToken = "";
  let invitationId = "";
  let adultMemberId = "";

  function cookieFrom(res: { headers: Record<string, unknown> }): string {
    const raw = res.headers["set-cookie"];
    const list = Array.isArray(raw) ? raw : raw ? [String(raw)] : [];
    return list
      .map((c) => String(c).split(";")[0])
      .filter((c) => c.startsWith("fadi_user_session="))
      .join("; ");
  }

  before(async () => {
    process.env.NODE_ENV = "test";
    const appMod = await import("../../app.js");
    app = await appMod.buildApp();
    ({ db } = await import("../../db/client.js"));
    ({ userAccounts, householdInvitations } = await import(
      "../../db/schema/index.js"
    ));
    ({ hashToken } = await import("../auth/crypto.js"));
  });

  after(async () => {
    await app.close();
    const { closeDb } = await import("../../db/client.js");
    await closeDb();
  });

  it("registers user + household + owner membership", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: ownerEmail,
        password,
        displayName: "Owner",
        householdName: "Phase2 Home",
      },
    });
    assert.equal(res.statusCode, 200);
    const body = res.json();
    assert.ok(body.user?.id);
    assert.ok(body.householdId);
    assert.equal(body.user.email, ownerEmail.toLowerCase());
    assert.equal(body.passwordHash, undefined);
    assert.equal(body.user.passwordHash, undefined);
    ownerId = body.user.id;
    householdId = body.householdId;
    ownerCookie = cookieFrom(res);
    assert.ok(ownerCookie.includes("fadi_user_session="));
  });

  it("rejects duplicate email", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: ownerEmail.toUpperCase(),
        password,
        displayName: "Other",
      },
    });
    assert.equal(res.statusCode, 409);
    assert.equal(res.json().error, "email_taken");
  });

  it("supports login / me / logout", async () => {
    const login = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: ownerEmail, password },
    });
    assert.equal(login.statusCode, 200);
    const cookie = cookieFrom(login);
    const me = await app.inject({
      method: "GET",
      url: "/auth/me",
      headers: { cookie },
    });
    assert.equal(me.statusCode, 200);
    assert.equal(me.json().user.id, ownerId);
    assert.equal(me.json().householdId, householdId);
    assert.equal(me.json().memberRole, "owner");

    const logout = await app.inject({
      method: "POST",
      url: "/auth/logout",
      headers: { cookie },
    });
    assert.equal(logout.statusCode, 200);

    const meAfter = await app.inject({
      method: "GET",
      url: "/auth/me",
      headers: { cookie },
    });
    assert.equal(meAfter.statusCode, 401);

    // restore owner session for later tests
    const again = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: ownerEmail, password },
    });
    ownerCookie = cookieFrom(again);
  });

  it("creates invitation and never returns token hash", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/households/current/invitations",
      headers: { cookie: ownerCookie },
      payload: { email: memberEmail, role: "adult" },
    });
    assert.equal(res.statusCode, 200);
    const body = res.json();
    assert.ok(body.invitation?.id);
    assert.equal(body.invitation.tokenHash, undefined);
    assert.ok(body.developmentOnlyToken);
    invitationId = body.invitation.id;
    inviteToken = body.developmentOnlyToken;

    const stored = await db
      .select()
      .from(householdInvitations)
      .where(eq(householdInvitations.id, invitationId))
      .limit(1);
    assert.equal(stored[0]?.tokenHash, hashToken(inviteToken));
    assert.notEqual(stored[0]?.tokenHash, inviteToken);
  });

  it("rejects invalid invitation token", async () => {
    const memberReg = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: memberEmail,
        password,
        displayName: "Member",
      },
    });
    assert.equal(memberReg.statusCode, 200);
    memberCookie = cookieFrom(memberReg);

    const res = await app.inject({
      method: "POST",
      url: "/invitations/not-a-real-token-value-xx/accept",
      headers: { cookie: memberCookie },
    });
    assert.equal(res.statusCode, 404);
    assert.equal(res.json().error, "invalid_token");
  });

  it("rejects expired invitation token", async () => {
    await db
      .update(householdInvitations)
      .set({ expiresAt: new Date(Date.now() - 60_000) })
      .where(eq(householdInvitations.id, invitationId));

    const res = await app.inject({
      method: "POST",
      url: `/invitations/${inviteToken}/accept`,
      headers: { cookie: memberCookie },
    });
    assert.equal(res.statusCode, 400);
    assert.equal(res.json().error, "expired");

    // recreate a fresh pending invite for accept test
    await db
      .update(householdInvitations)
      .set({
        status: "pending",
        expiresAt: new Date(Date.now() + 3600_000),
        acceptedAt: null,
      })
      .where(eq(householdInvitations.id, invitationId));
  });

  it("accepts invitation and prevents duplicate membership", async () => {
    const res = await app.inject({
      method: "POST",
      url: `/invitations/${inviteToken}/accept`,
      headers: { cookie: memberCookie },
    });
    assert.equal(res.statusCode, 200);
    assert.equal(res.json().role, "adult");
    adultMemberId = res.json().memberId;

    const dup = await app.inject({
      method: "POST",
      url: `/invitations/${inviteToken}/accept`,
      headers: { cookie: memberCookie },
    });
    assert.ok([400, 409].includes(dup.statusCode));
  });

  it("rejects demoting the final owner", async () => {
    const members = await app.inject({
      method: "GET",
      url: "/households/current/members",
      headers: { cookie: ownerCookie },
    });
    assert.equal(members.statusCode, 200);
    const ownerMember = members
      .json()
      .members.find((m: { role: string }) => m.role === "owner");
    assert.ok(ownerMember);

    const demoteOwner = await app.inject({
      method: "PATCH",
      url: `/households/current/members/${ownerMember.id}`,
      headers: { cookie: ownerCookie },
      payload: { role: "adult" },
    });
    assert.equal(demoteOwner.statusCode, 403);
    assert.equal(demoteOwner.json().error, "cannot_demote_owner");
  });

  it("rejects removing the final owner", async () => {
    const members = await app.inject({
      method: "GET",
      url: "/households/current/members",
      headers: { cookie: ownerCookie },
    });
    assert.equal(members.statusCode, 200);
    const ownerMember = members
      .json()
      .members.find((m: { role: string }) => m.role === "owner");
    assert.ok(ownerMember);

    const removeOwner = await app.inject({
      method: "DELETE",
      url: `/households/current/members/${ownerMember.id}`,
      headers: { cookie: ownerCookie },
    });
    assert.equal(removeOwner.statusCode, 403);
    assert.equal(removeOwner.json().error, "cannot_remove_owner");
  });

  it("blocks unauthorized role change by non-owner", async () => {
    const unauthorized = await app.inject({
      method: "PATCH",
      url: `/households/current/members/${adultMemberId}`,
      headers: { cookie: memberCookie },
      payload: { role: "teen" },
    });
    assert.equal(unauthorized.statusCode, 403);
  });

  it("revokes invitations", async () => {
    const create = await app.inject({
      method: "POST",
      url: "/households/current/invitations",
      headers: { cookie: ownerCookie },
      payload: { email: `extra.${suffix}@example.com`, role: "teen" },
    });
    assert.equal(create.statusCode, 200);
    const id = create.json().invitation.id;

    const revoke = await app.inject({
      method: "POST",
      url: `/households/current/invitations/${id}/revoke`,
      headers: { cookie: ownerCookie },
    });
    assert.equal(revoke.statusCode, 200);

    const list = await app.inject({
      method: "GET",
      url: "/households/current/invitations",
      headers: { cookie: ownerCookie },
    });
    const row = list.json().invitations.find((i: { id: string }) => i.id === id);
    assert.equal(row.status, "revoked");
    assert.equal(row.tokenHash, undefined);
  });

  it("does not expose password hashes on account reads", async () => {
    const me = await app.inject({
      method: "GET",
      url: "/auth/me",
      headers: { cookie: ownerCookie },
    });
    const text = me.body;
    assert.equal(text.includes("passwordHash"), false);
    assert.equal(text.includes("password_hash"), false);
    assert.equal(text.includes("tokenHash"), false);

    const accounts = await db
      .select({ id: userAccounts.id })
      .from(userAccounts)
      .where(eq(userAccounts.email, ownerEmail.toLowerCase()))
      .limit(1);
    assert.equal(accounts.length, 1);
  });
});
