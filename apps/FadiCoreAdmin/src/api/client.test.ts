import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ApiError } from "../api/client.ts";

describe("ApiError", () => {
  it("extracts error field from JSON body", () => {
    const err = new ApiError(401, { error: "unauthorized" });
    assert.equal(err.status, 401);
    assert.equal(err.message, "unauthorized");
  });
});
