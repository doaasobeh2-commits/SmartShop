import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertProductionSecurityConfig } from "./productionSecurity.js";

describe("assertProductionSecurityConfig", () => {
  it("allows non-production environments without COOKIE_SECURE", () => {
    assert.doesNotThrow(() =>
      assertProductionSecurityConfig(
        { NODE_ENV: "development", COOKIE_SECURE: false },
        () => true,
      ),
    );
    assert.doesNotThrow(() =>
      assertProductionSecurityConfig(
        { NODE_ENV: "test", COOKIE_SECURE: false },
        () => true,
      ),
    );
  });

  it("allows secure production configuration", () => {
    assert.doesNotThrow(() =>
      assertProductionSecurityConfig(
        { NODE_ENV: "production", COOKIE_SECURE: true },
        () => false,
      ),
    );
  });

  it("refuses production when COOKIE_SECURE is false", () => {
    assert.throws(
      () =>
        assertProductionSecurityConfig(
          { NODE_ENV: "production", COOKIE_SECURE: false },
          () => false,
        ),
      /COOKIE_SECURE=true/,
    );
  });

  it("refuses production when development token exposure is enabled", () => {
    assert.throws(
      () =>
        assertProductionSecurityConfig(
          { NODE_ENV: "production", COOKIE_SECURE: true },
          () => true,
        ),
      /developmentOnlyToken/,
    );
  });
});
