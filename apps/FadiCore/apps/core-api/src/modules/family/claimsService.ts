import { and, eq, ne } from "drizzle-orm";
import { env, isDevTokenExposureEnabled } from "../../config.js";
import { db } from "../../db/client.js";
import {
  householdMembers,
  memberAccountClaims,
  type ClaimStatus,
} from "../../db/schema/index.js";
import { createInviteToken, writeAudit } from "../../lib/audit.js";
import type { HouseholdMembershipContext } from "../../middleware/requireHouseholdAccess.js";
import { can } from "../../permissions/householdPermissions.js";
import { hashToken } from "../auth/crypto.js";
import { loadMemberInHousehold } from "./membersService.js";

export function publicClaim(row: {
  id: string;
  householdId: string;
  householdMemberId: string;
  createdByMemberId: string;
  status: ClaimStatus | string;
  expiresAt: Date;
  acceptedAt: Date | null;
  acceptedUserId: string | null;
  createdAt: Date;
}) {
  return {
    id: row.id,
    householdId: row.householdId,
    householdMemberId: row.householdMemberId,
    createdByMemberId: row.createdByMemberId,
    status: row.status,
    expiresAt: row.expiresAt.toISOString(),
    acceptedAt: row.acceptedAt?.toISOString() ?? null,
    acceptedUserId: row.acceptedUserId,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function createClaimInvitation(input: {
  membership: HouseholdMembershipContext;
  memberId: string;
  ip?: string;
}): Promise<
  | {
      ok: true;
      claim: ReturnType<typeof publicClaim>;
      developmentOnlyToken?: string;
    }
  | {
      ok: false;
      reason: "not_found" | "forbidden" | "already_linked";
    }
> {
  if (!can(input.membership.role, "members.manage_claims")) {
    return { ok: false, reason: "forbidden" };
  }

  const target = await loadMemberInHousehold(
    input.membership.householdId,
    input.memberId,
  );
  if (!target) return { ok: false, reason: "not_found" };
  if (target.userId !== null) {
    return { ok: false, reason: "already_linked" };
  }

  const plaintextToken = createInviteToken();
  const expiresAt = new Date(
    Date.now() + env.CLAIM_TTL_HOURS * 60 * 60 * 1000,
  );

  const [claim] = await db
    .insert(memberAccountClaims)
    .values({
      householdId: input.membership.householdId,
      householdMemberId: input.memberId,
      createdByMemberId: input.membership.memberId,
      tokenHash: hashToken(plaintextToken),
      status: "pending",
      expiresAt,
    })
    .returning();

  await writeAudit({
    actorType: "user",
    actorId: input.membership.userId,
    action: "household.member.claim_created",
    resourceType: "member_account_claim",
    resourceId: claim.id,
    metaJson: {
      memberId: input.memberId,
      householdId: input.membership.householdId,
    },
    ip: input.ip,
  });

  return {
    ok: true,
    claim: publicClaim(claim),
    ...(isDevTokenExposureEnabled()
      ? { developmentOnlyToken: plaintextToken }
      : {}),
  };
}

export async function acceptClaimInvitation(input: {
  token: string;
  userId: string;
  ip?: string;
}): Promise<
  | {
      ok: true;
      householdId: string;
      memberId: string;
      role: string;
    }
  | {
      ok: false;
      reason:
        | "invalid_token"
        | "expired"
        | "revoked"
        | "already_accepted"
        | "already_linked"
        | "account_already_linked";
    }
> {
  const tokenHash = hashToken(input.token);
  const rows = await db
    .select()
    .from(memberAccountClaims)
    .where(eq(memberAccountClaims.tokenHash, tokenHash))
    .limit(1);

  const claim = rows[0];
  if (!claim) return { ok: false, reason: "invalid_token" };

  if (claim.status === "revoked") {
    return { ok: false, reason: "revoked" };
  }
  if (claim.status === "accepted") {
    return { ok: false, reason: "already_accepted" };
  }
  if (claim.status === "expired" || claim.expiresAt <= new Date()) {
    if (claim.status === "pending") {
      await db
        .update(memberAccountClaims)
        .set({ status: "expired" })
        .where(eq(memberAccountClaims.id, claim.id));
    }
    return { ok: false, reason: "expired" };
  }

  const members = await db
    .select()
    .from(householdMembers)
    .where(eq(householdMembers.id, claim.householdMemberId))
    .limit(1);
  const member = members[0];
  if (!member || member.status !== "active") {
    return { ok: false, reason: "invalid_token" };
  }
  if (member.userId !== null) {
    return { ok: false, reason: "already_linked" };
  }

  const otherMembership = await db
    .select({ id: householdMembers.id })
    .from(householdMembers)
    .where(
      and(
        eq(householdMembers.userId, input.userId),
        eq(householdMembers.status, "active"),
        ne(householdMembers.householdId, claim.householdId),
      ),
    )
    .limit(1);
  if (otherMembership[0]) {
    return { ok: false, reason: "account_already_linked" };
  }

  const sameHousehold = await db
    .select({ id: householdMembers.id })
    .from(householdMembers)
    .where(
      and(
        eq(householdMembers.userId, input.userId),
        eq(householdMembers.householdId, claim.householdId),
        eq(householdMembers.status, "active"),
        ne(householdMembers.id, member.id),
      ),
    )
    .limit(1);
  if (sameHousehold[0]) {
    return { ok: false, reason: "account_already_linked" };
  }

  const now = new Date();

  try {
    await db.transaction(async (tx) => {
      const locked = await tx
        .select()
        .from(householdMembers)
        .where(
          and(
            eq(householdMembers.id, member.id),
            eq(householdMembers.status, "active"),
          ),
        )
        .for("update")
        .limit(1);

      const lockedMember = locked[0];
      if (!lockedMember) {
        throw Object.assign(new Error("not_found"), { code: "CLAIM_NOT_FOUND" });
      }
      if (lockedMember.userId !== null) {
        throw Object.assign(new Error("already_linked"), {
          code: "CLAIM_ALREADY_LINKED",
        });
      }

      await tx
        .update(householdMembers)
        .set({
          userId: input.userId,
          joinedAt: lockedMember.joinedAt ?? now,
          updatedAt: now,
        })
        .where(eq(householdMembers.id, lockedMember.id));

      const claimUpdate = await tx
        .update(memberAccountClaims)
        .set({
          status: "accepted",
          acceptedAt: now,
          acceptedUserId: input.userId,
        })
        .where(
          and(
            eq(memberAccountClaims.id, claim.id),
            eq(memberAccountClaims.status, "pending"),
          ),
        )
        .returning({ id: memberAccountClaims.id });

      if (!claimUpdate[0]) {
        throw Object.assign(new Error("already_accepted"), {
          code: "CLAIM_ALREADY_ACCEPTED",
        });
      }
    });
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code === "CLAIM_ALREADY_LINKED") {
      return { ok: false, reason: "already_linked" };
    }
    if (code === "CLAIM_ALREADY_ACCEPTED") {
      return { ok: false, reason: "already_accepted" };
    }
    if (code === "CLAIM_NOT_FOUND") {
      return { ok: false, reason: "invalid_token" };
    }
    throw error;
  }

  await writeAudit({
    actorType: "user",
    actorId: input.userId,
    action: "household.member.claim_accepted",
    resourceType: "member_account_claim",
    resourceId: claim.id,
    metaJson: {
      householdId: claim.householdId,
      memberId: member.id,
    },
    ip: input.ip,
  });

  return {
    ok: true,
    householdId: claim.householdId,
    memberId: member.id,
    role: member.role,
  };
}

export async function listClaimsForHousehold(householdId: string) {
  const rows = await db
    .select({
      id: memberAccountClaims.id,
      householdId: memberAccountClaims.householdId,
      householdMemberId: memberAccountClaims.householdMemberId,
      createdByMemberId: memberAccountClaims.createdByMemberId,
      status: memberAccountClaims.status,
      expiresAt: memberAccountClaims.expiresAt,
      acceptedAt: memberAccountClaims.acceptedAt,
      acceptedUserId: memberAccountClaims.acceptedUserId,
      createdAt: memberAccountClaims.createdAt,
    })
    .from(memberAccountClaims)
    .where(eq(memberAccountClaims.householdId, householdId));

  return rows.map(publicClaim);
}
