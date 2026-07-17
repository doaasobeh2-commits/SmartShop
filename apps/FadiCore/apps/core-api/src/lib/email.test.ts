import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeEmail } from "./email.js";
import {
  can,
  permissionsForRole,
} from "../permissions/householdPermissions.js";

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    assert.equal(normalizeEmail("  Ada@Example.COM "), "ada@example.com");
  });
});

describe("householdPermissions", () => {
  it("gives owners manage and invite powers", () => {
    assert.equal(can("owner", "household.manage"), true);
    assert.equal(can("owner", "members.invite"), true);
    assert.equal(can("owner", "members.change_role"), true);
    assert.equal(can("owner", "members.remove"), true);
  });

  it("keeps teen/child/caregiver read-only", () => {
    for (const role of ["teen", "child", "caregiver"] as const) {
      assert.equal(can(role, "household.view"), true);
      assert.equal(can(role, "members.invite"), false);
      assert.equal(can(role, "members.change_role"), false);
      assert.equal(can(role, "household.manage"), false);
    }
  });

  it("exposes an extensible permission set for owners", () => {
    assert.ok(permissionsForRole("owner").size >= 6);
  });
});
