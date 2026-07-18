import type { IncomingMessage, ServerResponse } from "node:http";
import type { AuthContextVerifier } from "@recipe-ai/food-core/auth";
import { sendJson, verifyRequestAuth } from "../http";

/**
 * Auth middleware for future protected routes (A2.4+).
 * Not applied to GET /health in A2.1.
 */
export async function requireAuth(
  verifier: AuthContextVerifier,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<boolean> {
  const auth = await verifyRequestAuth(verifier, req);
  if (!auth.ok) {
    const status = auth.code === "NOT_IMPLEMENTED" ? 501 : 401;
    sendJson(res, status, { error: auth.code, message: auth.message });
    return false;
  }
  return true;
}
