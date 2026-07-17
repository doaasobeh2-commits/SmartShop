import { and, eq, gt, isNull } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";
import { env, SESSION_COOKIE_NAME } from "../../config.js";
import { db } from "../../db/client.js";
import { adminSessions, adminUsers, type AdminRole } from "../../db/schema/index.js";
import { createSessionToken, hashToken } from "./crypto.js";

export type AdminPrincipal = {
  id: string;
  email: string;
  displayName: string;
  role: AdminRole;
};

export async function createAdminSession(input: {
  userId: string;
  ip?: string;
  userAgent?: string;
}): Promise<{ token: string; expiresAt: Date }> {
  const token = createSessionToken();
  const expiresAt = new Date(
    Date.now() + env.SESSION_TTL_HOURS * 60 * 60 * 1000,
  );

  await db.insert(adminSessions).values({
    userId: input.userId,
    tokenHash: hashToken(token),
    expiresAt,
    ip: input.ip ?? null,
    userAgent: input.userAgent ?? null,
  });

  return { token, expiresAt };
}

export function setSessionCookie(
  reply: FastifyReply,
  token: string,
  expiresAt: Date,
): void {
  reply.setCookie(SESSION_COOKIE_NAME, token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: env.COOKIE_SECURE,
    domain: env.COOKIE_DOMAIN || undefined,
    expires: expiresAt,
  });
}

export function clearSessionCookie(reply: FastifyReply): void {
  reply.clearCookie(SESSION_COOKIE_NAME, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: env.COOKIE_SECURE,
    domain: env.COOKIE_DOMAIN || undefined,
  });
}

export async function resolveAdminSession(
  request: FastifyRequest,
): Promise<AdminPrincipal | null> {
  const token = request.cookies[SESSION_COOKIE_NAME];
  if (!token) return null;

  const tokenHash = hashToken(token);
  const now = new Date();

  const rows = await db
    .select({
      sessionId: adminSessions.id,
      expiresAt: adminSessions.expiresAt,
      revokedAt: adminSessions.revokedAt,
      userId: adminUsers.id,
      email: adminUsers.email,
      displayName: adminUsers.displayName,
      role: adminUsers.role,
    })
    .from(adminSessions)
    .innerJoin(adminUsers, eq(adminSessions.userId, adminUsers.id))
    .where(
      and(
        eq(adminSessions.tokenHash, tokenHash),
        isNull(adminSessions.revokedAt),
        gt(adminSessions.expiresAt, now),
      ),
    )
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  return {
    id: row.userId,
    email: row.email,
    displayName: row.displayName,
    role: row.role,
  };
}

export async function revokeSessionByToken(token: string): Promise<void> {
  const tokenHash = hashToken(token);
  await db
    .update(adminSessions)
    .set({ revokedAt: new Date() })
    .where(
      and(eq(adminSessions.tokenHash, tokenHash), isNull(adminSessions.revokedAt)),
    );
}
