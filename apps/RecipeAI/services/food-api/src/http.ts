import type { IncomingMessage, ServerResponse } from "node:http";
import type { AuthContextVerifier } from "@recipe-ai/food-core/auth";

export type RequestContext = {
  auth: Awaited<ReturnType<AuthContextVerifier["verify"]>>;
};

export async function verifyRequestAuth(
  verifier: AuthContextVerifier,
  req: IncomingMessage,
): Promise<RequestContext["auth"]> {
  const headers: Record<string, string | string[] | undefined> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== undefined) {
      headers[key] = value;
    }
  }
  return verifier.verify({ headers });
}

export function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}
