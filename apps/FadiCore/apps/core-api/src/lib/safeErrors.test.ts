import assert from "node:assert/strict";
import { describe, it } from "node:test";
import Fastify from "fastify";
import {
  opaqueEnvelope,
  redactLogString,
  registerSafeErrorHandlers,
  resolveThrownError,
  statusToOpaqueCode,
} from "./safeErrors.js";

describe("safeErrors helpers", () => {
  it("maps status codes to opaque codes", () => {
    assert.equal(statusToOpaqueCode(404), "not_found");
    assert.equal(statusToOpaqueCode(500), "internal_error");
    assert.equal(statusToOpaqueCode(503), "database_unavailable");
  });

  it("treats SQL-like thrown errors as internal_error 500", () => {
    const resolved = resolveThrownError(
      new Error('relation "user_accounts" does not exist'),
    );
    assert.equal(resolved.statusCode, 500);
    assert.equal(resolved.code, "internal_error");
  });

  it("preserves safe intentional codes from Error message", () => {
    const resolved = resolveThrownError(new Error("not_found"));
    assert.equal(resolved.statusCode, 404);
    assert.equal(resolved.code, "not_found");
  });

  it("redacts credentials in log strings", () => {
    const redacted = redactLogString(
      "postgres://user:secret@host/db Bearer abc.def.ghi password=hunter2",
    );
    assert.equal(redacted.includes("secret"), false);
    assert.equal(redacted.includes("hunter2"), false);
    assert.equal(redacted.includes("abc.def.ghi"), false);
    assert.match(redacted, /\[Redacted\]/);
  });

  it("builds opaque envelopes without extra fields", () => {
    assert.deepEqual(opaqueEnvelope("internal_error"), { error: "internal_error" });
  });
});

describe("registerSafeErrorHandlers", () => {
  it("does not expose SQL-like messages or stacks on thrown errors", async () => {
    const app = Fastify({ logger: false });
    await registerSafeErrorHandlers(app);
    app.get("/boom", async () => {
      throw new Error(
        'insert into "household_members" failed: column "password_hash" — /app/src/db/schema/users.ts',
      );
    });

    const res = await app.inject({ method: "GET", url: "/boom" });
    assert.equal(res.statusCode, 500);

    const body = res.json() as Record<string, unknown>;
    assert.deepEqual(Object.keys(body), ["error"]);
    assert.equal(body.error, "internal_error");

    const raw = res.body;
    assert.equal(raw.includes("household_members"), false);
    assert.equal(raw.includes("password_hash"), false);
    assert.equal(raw.includes("users.ts"), false);
    assert.equal(raw.includes("insert into"), false);
    assert.equal(raw.includes("stack"), false);
    assert.equal(raw.includes("Error:"), false);

    await app.close();
  });

  it("returns a safe opaque 404 envelope for unknown routes", async () => {
    const app = Fastify({ logger: false });
    await registerSafeErrorHandlers(app);

    const res = await app.inject({ method: "GET", url: "/definitely-missing-route" });
    assert.equal(res.statusCode, 404);
    assert.deepEqual(res.json(), { error: "not_found" });
    assert.equal(res.body.includes("stack"), false);

    await app.close();
  });

  it("maps database connection failures to 503 database_unavailable", async () => {
    const app = Fastify({ logger: false });
    await registerSafeErrorHandlers(app);
    app.get("/db-down", async () => {
      const err = Object.assign(new Error("connect ECONNREFUSED 127.0.0.1:5432"), {
        code: "ECONNREFUSED",
      });
      throw err;
    });

    const res = await app.inject({ method: "GET", url: "/db-down" });
    assert.equal(res.statusCode, 503);
    assert.deepEqual(res.json(), { error: "database_unavailable" });
    assert.equal(res.body.includes("ECONNREFUSED"), false);
    assert.equal(res.body.includes("127.0.0.1"), false);

    await app.close();
  });
});
