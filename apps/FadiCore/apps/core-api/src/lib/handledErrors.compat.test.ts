import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { buildApp } from "../app.js";

describe("handled error compatibility (buildApp)", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  before(async () => {
    app = await buildApp();
  });

  after(async () => {
    await app.close();
  });

  it("keeps safe validation errors with details", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: "not-an-email", password: "x" },
    });
    assert.equal(res.statusCode, 400);
    const body = res.json() as { error?: string; details?: unknown };
    assert.equal(body.error, "invalid_body");
    assert.ok(body.details);
  });

  it("keeps unauthorized for missing session", async () => {
    const res = await app.inject({ method: "GET", url: "/auth/me" });
    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.json(), { error: "unauthorized" });
  });
});
