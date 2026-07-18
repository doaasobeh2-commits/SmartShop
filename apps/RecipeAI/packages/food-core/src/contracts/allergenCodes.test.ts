import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ALLERGEN_CODES } from "./allergenCodes";
import {
  assertMockAuthAllowed,
  createAuthVerifierFromConfig,
  MockAuthContextVerifier,
  MockAuthProductionError,
  StubFadiCoreSessionVerifier,
} from "../auth";

describe("allergen codes", () => {
  it("includes crustaceans and molluscs as distinct canonical codes", () => {
    assert.ok(ALLERGEN_CODES.includes("crustaceans"));
    assert.ok(ALLERGEN_CODES.includes("molluscs"));
  });
});

describe("MockAuthContextVerifier", () => {
  it("returns configured context", async () => {
    const verifier = new MockAuthContextVerifier({
      context: {
        userId: "u1",
        householdId: "h1",
        memberId: "m1",
        recipeEnrolled: true,
      },
    });
    const result = await verifier.verify({ headers: {} });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.context.userId, "u1");
    }
  });
});

describe("StubFadiCoreSessionVerifier", () => {
  it("returns not-implemented failure", async () => {
    const verifier = new StubFadiCoreSessionVerifier();
    const result = await verifier.verify({ headers: {} });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.code, "NOT_IMPLEMENTED");
      assert.match(result.message, /Phase 5b/i);
    }
  });
});

describe("assertMockAuthAllowed", () => {
  it("throws MockAuthProductionError when production + mock mode", () => {
    assert.throws(
      () =>
        assertMockAuthAllowed({
          nodeEnv: "production",
          authMode: "mock",
          mockAuthEnabled: false,
        }),
      MockAuthProductionError,
    );
  });

  it("throws when production + MOCK_AUTH flag", () => {
    assert.throws(
      () =>
        assertMockAuthAllowed({
          nodeEnv: "production",
          authMode: "fadicore-stub",
          mockAuthEnabled: true,
        }),
      MockAuthProductionError,
    );
  });

  it("allows mock in development", () => {
    assert.doesNotThrow(() =>
      assertMockAuthAllowed({
        nodeEnv: "development",
        authMode: "mock",
        mockAuthEnabled: true,
      }),
    );
  });
});

describe("createAuthVerifierFromConfig", () => {
  it("returns mock verifier in development when mock mode", () => {
    const verifier = createAuthVerifierFromConfig({
      nodeEnv: "development",
      authMode: "mock",
      mockAuthEnabled: true,
    });
    assert.ok(verifier instanceof MockAuthContextVerifier);
  });

  it("returns stub verifier for fadicore-stub mode", () => {
    const verifier = createAuthVerifierFromConfig({
      nodeEnv: "production",
      authMode: "fadicore-stub",
      mockAuthEnabled: false,
    });
    assert.ok(verifier instanceof StubFadiCoreSessionVerifier);
  });

  it("refuses to create mock verifier in production", () => {
    assert.throws(
      () =>
        createAuthVerifierFromConfig({
          nodeEnv: "production",
          authMode: "mock",
          mockAuthEnabled: true,
        }),
      MockAuthProductionError,
    );
  });
});
