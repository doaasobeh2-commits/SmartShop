import { createHash, randomBytes } from "node:crypto";
import * as argon2 from "argon2";

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
  });
}

export async function verifyPassword(
  passwordHash: string,
  password: string,
): Promise<boolean> {
  try {
    return await argon2.verify(passwordHash, password);
  } catch {
    return false;
  }
}

export function createSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createApiKey(appCode: string): {
  plaintext: string;
  prefix: string;
  hash: string;
} {
  const secret = randomBytes(24).toString("base64url");
  const plaintext = `fadi_${appCode}_${secret}`;
  const prefix = plaintext.slice(0, 18);
  return {
    plaintext,
    prefix,
    hash: hashToken(plaintext),
  };
}
