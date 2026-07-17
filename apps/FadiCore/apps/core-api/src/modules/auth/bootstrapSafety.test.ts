import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertSafeBootstrapPassword,
  isUnsafeBootstrapPassword,
} from "./bootstrapSafety.js";
import { isDatabaseConnectionError } from "../../db/errors.js";

describe("bootstrapSafety", () => {
  it("flags the example password as unsafe", () => {
    assert.equal(isUnsafeBootstrapPassword("ChangeMe_Owner_2026!"), true);
    assert.equal(isUnsafeBootstrapPassword("changeme"), true);
  });

  it("allows a unique local password", () => {
    assert.equal(isUnsafeBootstrapPassword("Local_Only_Pass_9x!"), false);
  });

  it("throws a clear error for example passwords", () => {
    assert.throws(
      () => assertSafeBootstrapPassword("ChangeMe_Owner_2026!"),
      /Refusing to seed/,
    );
  });
});

describe("isDatabaseConnectionError", () => {
  it("detects ECONNREFUSED", () => {
    assert.equal(
      isDatabaseConnectionError({ code: "ECONNREFUSED", message: "connect" }),
      true,
    );
  });

  it("detects nested cause", () => {
    assert.equal(
      isDatabaseConnectionError({
        message: "wrapper",
        cause: { code: "ECONNREFUSED" },
      }),
      true,
    );
  });

  it("ignores unrelated errors", () => {
    assert.equal(
      isDatabaseConnectionError({ code: "22P02", message: "invalid input" }),
      false,
    );
  });
});
