import { eq } from "drizzle-orm";
import { isDatabaseConnectionError } from "../../db/errors.js";
import { db } from "../../db/client.js";
import { userAccounts } from "../../db/schema/index.js";
import { writeAudit } from "../../lib/audit.js";
import { normalizeEmail } from "../../lib/email.js";
import { hashPassword, verifyPassword } from "../auth/crypto.js";
import {
  createUserSession,
  type UserPrincipal,
} from "./session.js";

function parseOptionalDob(
  value: string | undefined,
): string | null | "invalid" {
  if (value === undefined || value === "") return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "invalid";
  const d = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return "invalid";
  if (d.toISOString().slice(0, 10) !== value) return "invalid";
  if (d.getTime() > Date.now()) return "invalid";
  return value;
}

export async function registerUser(input: {
  email: string;
  password: string;
  displayName: string;
  dateOfBirth?: string;
  preferredLocale?: string;
  ip?: string;
  userAgent?: string;
}): Promise<
  | {
      ok: true;
      principal: UserPrincipal;
      token: string;
      expiresAt: Date;
      householdId: null;
      dateOfBirth: string | null;
    }
  | {
      ok: false;
      reason:
        | "email_taken"
        | "database_unavailable"
        | "weak_password"
        | "invalid_date_of_birth";
    }
> {
  if (input.password.length < 12) {
    return { ok: false, reason: "weak_password" };
  }

  const dob = parseOptionalDob(input.dateOfBirth);
  if (dob === "invalid") {
    return { ok: false, reason: "invalid_date_of_birth" };
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

    const [user] = await db
      .insert(userAccounts)
      .values({
        email,
        passwordHash,
        displayName: input.displayName.trim(),
        dateOfBirth: dob,
        status: "active",
        updatedAt: now,
      })
      .returning({
        id: userAccounts.id,
        email: userAccounts.email,
        displayName: userAccounts.displayName,
        status: userAccounts.status,
        dateOfBirth: userAccounts.dateOfBirth,
      });

    await writeAudit({
      actorType: "user",
      actorId: user.id,
      action: "user.register",
      resourceType: "user_account",
      resourceId: user.id,
      metaJson: { email, hasDateOfBirth: Boolean(dob) },
      ip: input.ip,
    });

    const { token, expiresAt } = await createUserSession({
      userId: user.id,
      ip: input.ip,
      userAgent: input.userAgent,
    });

    return {
      ok: true,
      token,
      expiresAt,
      householdId: null,
      dateOfBirth: user.dateOfBirth ?? null,
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
