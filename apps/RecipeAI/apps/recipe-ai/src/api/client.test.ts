import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "./client";
import {
  hasActiveAppEnrollment,
  hasPendingJoinRequest,
  resolveRecipeAccessGate,
} from "./coreApi";

describe("ApiError", () => {
  it("extracts error field from JSON body", () => {
    const err = new ApiError(401, { error: "unauthorized" });
    assert.equal(err.status, 401);
    assert.equal(err.message, "unauthorized");
  });

  it("falls back when body has no error string", () => {
    const err = new ApiError(500, { detail: "x" });
    assert.equal(err.message, "Request failed (500)");
  });
});

describe("hasActiveAppEnrollment", () => {
  it("detects active recipe enrollment", () => {
    assert.equal(
      hasActiveAppEnrollment(
        [
          { applicationKey: "fitness", status: "active" },
          { applicationKey: "recipe", status: "active" },
        ],
        "recipe",
      ),
      true,
    );
  });

  it("rejects suspended or missing recipe enrollment", () => {
    assert.equal(
      hasActiveAppEnrollment(
        [{ applicationKey: "recipe", status: "suspended" }],
        "recipe",
      ),
      false,
    );
    assert.equal(hasActiveAppEnrollment([], "recipe"), false);
  });
});

describe("hasPendingJoinRequest", () => {
  it("detects pending requests", () => {
    assert.equal(
      hasPendingJoinRequest([
        {
          id: "1",
          requesterUserId: "u",
          targetHouseholdId: "h",
          requestedRole: "adult",
          status: "rejected",
          createdAt: "",
          expiresAt: "",
          resolvedAt: null,
          resolvedByMemberId: null,
        },
        {
          id: "2",
          requesterUserId: "u",
          targetHouseholdId: "h",
          requestedRole: "adult",
          status: "pending",
          createdAt: "",
          expiresAt: "",
          resolvedAt: null,
          resolvedByMemberId: null,
        },
      ]),
      true,
    );
  });

  it("returns false when none pending", () => {
    assert.equal(hasPendingJoinRequest([]), false);
  });
});

describe("resolveRecipeAccessGate", () => {
  it("routes no household to onboarding or pending", () => {
    assert.equal(
      resolveRecipeAccessGate({
        householdId: null,
        memberId: null,
        recipeEnabled: false,
        pendingJoin: false,
      }),
      "needs-household",
    );
    assert.equal(
      resolveRecipeAccessGate({
        householdId: null,
        memberId: null,
        recipeEnabled: false,
        pendingJoin: true,
      }),
      "join-pending",
    );
  });

  it("routes enrolled household to ready", () => {
    assert.equal(
      resolveRecipeAccessGate({
        householdId: "h",
        memberId: "m",
        recipeEnabled: true,
        pendingJoin: false,
      }),
      "ready",
    );
    assert.equal(
      resolveRecipeAccessGate({
        householdId: "h",
        memberId: "m",
        recipeEnabled: false,
        pendingJoin: false,
      }),
      "recipe-not-enabled",
    );
  });
});
