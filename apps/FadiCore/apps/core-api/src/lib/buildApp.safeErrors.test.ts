import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { buildApp } from "../app.js";

describe("buildApp safe error surface", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  before(async () => {
    app = await buildApp();
  });

  after(async () => {
    await app.close();
  });

  it("unknown routes on the real app return opaque not_found", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/__no_such_phase5a_route__",
    });
    assert.equal(res.statusCode, 404);
    assert.deepEqual(res.json(), { error: "not_found" });
    assert.equal(res.body.includes("stack"), false);
    assert.equal(res.body.includes("Fastify"), false);
  });
});
