import { eq } from "drizzle-orm";
import { isDatabaseConnectionError } from "../../db/errors.js";
import { db } from "../../db/client.js";
import {
  householdMembers,
  households,
  userAccounts,
} from "../../db/schema/index.js";
import { createPublicAlias, writeAudit } from "../../lib/audit.js";
import { normalizeEmail } from "../../lib/email.js";
import { hashPassword, verifyPassword } from "../auth/crypto.js";
import {
  createUserSession,
  type UserPrincipal,
} from "./session.js";

export async function registerUser(input: {
  email: string;
  password: string;
  displayName: string;
  householdName?: string;
  preferredLocale?: string;
  ip?: string;
  userAgent?: string;
}): Promise<
  | {
      ok: true;
      principal: UserPrincipal;
      token: string;
      expiresAt: Date;
      householdId: string;
    }
  | {
      ok: false;
      reason: "email_taken" | "database_unavailable" | "weak_password";
    }
> {
  if (input.password.length < 12) {
    return { ok: false, reason: "weak_password" };
  }

  const email = normalizeEmail(input.email);

  try {
    const existing = await db
      .select({ id: userAccounts.id })
      .from(userAccounts)
      .where(eq(userAccounts.email, email))
      .limit(1);
    if (existing[0]) {
      return { ok: false, reason: "email_taken" };
    }

    const passwordHash = await hashPassword(input.password);
    const now = new Date();

    const result = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(userAccounts)
        .values({
          email,
          passwordHash,
          displayName: input.displayName.trim(),
          status: "active",
          updatedAt: now,
        })
        .returning({
          id: userAccounts.id,
          email: userAccounts.email,
          displayName: userAccounts.displayName,
          status: userAccounts.status,
        });

      const [household] = await tx
        .insert(households)
        .values({
          publicAlias: createPublicAlias(),
          name: (input.householdName?.trim() || `${user.displayName}'s household`).slice(
            0,
            120,
          ),
          ownerUserId: user.id,
          preferredLocale: input.preferredLocale?.trim() || "en",
          updatedAt: now,
        })
        .returning({ id: households.id });

      await tx.insert(householdMembers).values({
        householdId: household.id,
        userId: user.id,
        role: "owner",
        status: "active",
        joinedAt: now,
        updatedAt: now,
      });

      return { user, householdId: household.id };
    });

    await writeAudit({
      actorType: "user",
      actorId: result.user.id,
      action: "user.register",
      resourceType: "user_account",
      resourceId: result.user.id,
      metaJson: { email },
      ip: input.ip,
    });

    await writeAudit({
      actorType: "user",
      actorId: result.user.id,
      action: "household.created",
      resourceType: "household",
      resourceId: result.householdId,
      metaJson: { ownerUserId: result.user.id },
      ip: input.ip,
    });

    const { token, expiresAt } = await createUserSession({
      userId: result.user.id,
      ip: input.ip,
      userAgent: input.userAgent,
    });

    return {
      ok: true,
      token,
      expiresAt,
      householdId: result.householdId,
      principal: {
        id: result.user.id,
        email: result.user.email,
        displayName: result.user.displayName,
        status: result.user.status,
      },
    };
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return { ok: false, reason: "database_unavailable" };
    }
    throw error;
  }
}

export async function loginUser(input: {
  email: string;
  password: string;
  ip?: string;
  userAgent?: string;
}): Promise<
  | { ok: true; principal: UserPrincipal; token: string; expiresAt: Date }
  | { ok: false; reason: "invalid_credentials" | "database_unavailable" }
> {
  try {
    const email = normalizeEmail(input.email);
    const users = await db
      .select()
      .from(userAccounts)
      .where(eq(userAccounts.email, email))
      .limit(1);

    const user = users[0];
    if (!user || user.status !== "active") {
      return { ok: false, reason: "invalid_credentials" };
    }

    const valid = await verifyPassword(user.passwordHash, input.password);
    if (!valid) {
      return { ok: false, reason: "invalid_credentials" };
    }

    const { token, expiresAt } = await createUserSession({
      userId: user.id,
      ip: input.ip,
      userAgent: input.userAgent,
    });

    await db
      .update(userAccounts)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(userAccounts.id, user.id));

    await writeAudit({
      actorType: "user",
      actorId: user.id,
      action: "user.login",
      resourceType: "user_account",
      resourceId: user.id,
      metaJson: { email: user.email },
      ip: input.ip,
    });

    return {
      ok: true,
      token,
      expiresAt,
      principal: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        status: user.status,
      },
    };
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return { ok: false, reason: "database_unavailable" };
    }
    throw error;
  }
}
