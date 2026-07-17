import { eq } from "drizzle-orm";
import { isDatabaseConnectionError } from "../../db/errors.js";
import { db } from "../../db/client.js";
import { adminUsers, auditLogs } from "../../db/schema/index.js";
import { verifyPassword } from "./crypto.js";
import {
  createAdminSession,
  type AdminPrincipal,
} from "./session.js";

export async function loginAdmin(input: {
  email: string;
  password: string;
  ip?: string;
  userAgent?: string;
}): Promise<
  | { ok: true; principal: AdminPrincipal; token: string; expiresAt: Date }
  | { ok: false; reason: "invalid_credentials" | "database_unavailable" }
> {
  try {
    const email = input.email.trim().toLowerCase();
    const users = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, email))
      .limit(1);

    const user = users[0];
    if (!user) {
      return { ok: false, reason: "invalid_credentials" };
    }

    const valid = await verifyPassword(user.passwordHash, input.password);
    if (!valid) {
      return { ok: false, reason: "invalid_credentials" };
    }

    const { token, expiresAt } = await createAdminSession({
      userId: user.id,
      ip: input.ip,
      userAgent: input.userAgent,
    });

    await db
      .update(adminUsers)
      .set({ lastLoginAt: new Date() })
      .where(eq(adminUsers.id, user.id));

    await db.insert(auditLogs).values({
      actorType: "admin",
      actorId: user.id,
      action: "admin.auth.login",
      resourceType: "admin_user",
      resourceId: user.id,
      metaJson: { email: user.email },
      ip: input.ip ?? null,
    });

    return {
      ok: true,
      token,
      expiresAt,
      principal: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
    };
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return { ok: false, reason: "database_unavailable" };
    }
    throw error;
  }
}
