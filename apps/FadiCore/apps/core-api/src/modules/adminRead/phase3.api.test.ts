import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { config as loadEnv } from "dotenv";

loadEnv();

const hasDb = Boolean(process.env.DATABASE_URL);

describe("phase3 admin read api", { skip: !hasDb }, () => {
  let app: Awaited<ReturnType<typeof import("../../app.js").buildApp>>;

  const suffix = Date.now().toString(36);
  const userEmail = `p3.user.${suffix}@example.com`;
  const userPassword = "Phase3_User_Pass_9x!";
  let adminCookie = "";

  function cookieFrom(
    res: { headers: Record<string, unknown> },
    name: string,
  ): string {
    const raw = res.headers["set-cookie"];
    const list = Array.isArray(raw) ? raw : raw ? [String(raw)] : [];
    return list
      .map((c) => String(c).split(";")[0])
      .filter((c) => c.startsWith(`${name}=`))
      .join("; ");
  }

  before(async () => {
    process.env.NODE_ENV = "test";
    const appMod = await import("../../app.js");
    app = await appMod.buildApp();

    const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
    const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
    assert.ok(email && password, "admin bootstrap env required for tests");

    const login = await app.inject({
      method: "POST",
      url: "/admin/auth/login",
      payload: { email, password },
    });
    assert.equal(login.statusCode, 200, login.body);
    adminCookie = cookieFrom(login, "fadi_admin_session");
    assert.ok(adminCookie);

    const reg = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: {
        email: userEmail,
        password: userPassword,
        displayName: "Phase3 Test User",
        householdName: "Phase3 Test Household",
      },
    });
    assert.equal(reg.statusCode, 200, reg.body);
  });

  after(async () => {
    await app.close();
    const { closeDb } = await import("../../db/client.js");
    await closeDb();
  });

  it("rejects unauthenticated admin reads", async () => {
    const res = await app.inject({ method: "GET", url: "/admin/overview" });
    assert.equal(res.statusCode, 401);
  });

  it("returns overview with real counts and no secrets", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/admin/overview",
      headers: { cookie: adminCookie },
    });
    assert.equal(res.statusCode, 200);
    const body = res.json();
    assert.ok(body.metrics.totalUsers >= 1);
    assert.ok(body.metrics.totalHouseholds >= 1);
    assert.equal(res.body.includes("password"), false);
    assert.equal(res.body.includes("tokenHash"), false);
    assert.equal(res.body.includes("passwordHash"), false);
  });

  it("lists users and households with safe fields only", async () => {
    const users = await app.inject({
      method: "GET",
      url: "/admin/users",
      headers: { cookie: adminCookie },
    });
    assert.equal(users.statusCode, 200);
    const found = users.json().users.find((u: { email: string }) => u.email === userEmail);
    assert.ok(found);
    assert.ok(found.memberships?.length >= 1);
    assert.equal(found.passwordHash, undefined);

    const households = await app.inject({
      method: "GET",
      url: "/admin/households",
      headers: { cookie: adminCookie },
    });
    assert.equal(households.statusCode, 200);
    assert.ok(
      households.json().households.some(
        (h: { name: string }) => h.name === "Phase3 Test Household",
      ),
    );
    assert.equal(households.body.includes("password_hash"), false);
    assert.equal(households.body.includes("token_hash"), false);
  });

  it("supports audit log pagination and filtering", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/admin/audit-logs?page=1&pageSize=5&actorType=user&action=user.register",
      headers: { cookie: adminCookie },
    });
    assert.equal(res.statusCode, 200);
    const body = res.json();
    assert.ok(body.total >= 1);
    assert.ok(body.items.length >= 1);
    assert.ok(body.items.length <= 5);
    for (const item of body.items) {
      assert.equal(item.action, "user.register");
      assert.equal(item.meta?.passwordHash, undefined);
      assert.equal(item.meta?.tokenHash, undefined);
    }
  });

  it("lists invitations and sessions without hashes", async () => {
    const invites = await app.inject({
      method: "GET",
      url: "/admin/invitations",
      headers: { cookie: adminCookie },
    });
    assert.equal(invites.statusCode, 200);
    assert.equal(invites.body.includes("tokenHash"), false);

    const sessions = await app.inject({
      method: "GET",
      url: "/admin/sessions",
      headers: { cookie: adminCookie },
    });
    assert.equal(sessions.statusCode, 200);
    assert.equal(sessions.body.includes("tokenHash"), false);
  });
});
