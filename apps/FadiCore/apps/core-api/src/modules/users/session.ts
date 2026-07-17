import { and, eq, gt, isNull } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";
import { env, USER_SESSION_COOKIE_NAME } from "../../config.js";
import { db } from "../../db/client.js";
import {
  userAccounts,
  userSessions,
  type UserAccountStatus,
} from "../../db/schema/index.js";
import { createSessionToken, hashToken } from "../auth/crypto.js";

export type UserPrincipal = {
  id: string;
  email: string;
  displayName: string;
  status: UserAccountStatus;
};

export async function createUserSession(input: {
  userId: string;
  ip?: string;
  userAgent?: string;
}): Promise<{ token: string; expiresAt: Date }> {
  const token = createSessionToken();
  const expiresAt = new Date(
    Date.now() + env.SESSION_TTL_HOURS * 60 * 60 * 1000,
  );

  await db.insert(userSessions).values({
    userId: input.userId,
    tokenHash: hashToken(token),
    expiresAt,
    ip: input.ip ?? null,
    userAgent: input.userAgent ?? null,
  });

  return { token, expiresAt };
}

export function setUserSessionCookie(
  reply: FastifyReply,
  token: string,
  expiresAt: Date,
): void {
  reply.setCookie(USER_SESSION_COOKIE_NAME, token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: env.COOKIE_SECURE,
    domain: env.COOKIE_DOMAIN || undefined,
    expires: expiresAt,
  });
}

export function clearUserSessionCookie(reply: FastifyReply): void {
  reply.clearCookie(USER_SESSION_COOKIE_NAME, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: env.COOKIE_SECURE,
    domain: env.COOKIE_DOMAIN || undefined,
  });
}

export async function resolveUserSession(
  request: FastifyRequest,
): Promise<UserPrincipal | null> {
  const token = request.cookies[USER_SESSION_COOKIE_NAME];
  if (!token) return null;

  const tokenHash = hashToken(token);
  const now = new Date();

  const rows = await db
    .select({
      userId: userAccounts.id,
      email: userAccounts.email,
      displayName: userAccounts.displayName,
      status: userAccounts.status,
    })
    .from(userSessions)
    .innerJoin(userAccounts, eq(userSessions.userId, userAccounts.id))
    .where(
      and(
        eq(userSessions.tokenHash, tokenHash),
        isNull(userSessions.revokedAt),
        gt(userSessions.expiresAt, now),
        eq(userAccounts.status, "active"),
      ),
    )
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  return {
    id: row.userId,
    email: row.email,
    displayName: row.displayName,
    status: row.status,
  };
}

export async function revokeUserSessionByToken(token: string): Promise<void> {
  const tokenHash = hashToken(token);
  await db
    .update(userSessions)
    .set({ revokedAt: new Date() })
    .where(
      and(eq(userSessions.tokenHash, tokenHash), isNull(userSessions.revokedAt)),
    );
}
