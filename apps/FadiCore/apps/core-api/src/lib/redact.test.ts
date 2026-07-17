import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { redactAuditMeta } from "./redact.js";

describe("redactAuditMeta", () => {
  it("removes secret-looking keys", () => {
    const out = redactAuditMeta({
      email: "a@b.com",
      passwordHash: "x",
      token_hash: "y",
      nested: { apiKey: "z", role: "adult" },
    });
    assert.deepEqual(out, {
      email: "a@b.com",
      nested: { role: "adult" },
    });
  });
});
