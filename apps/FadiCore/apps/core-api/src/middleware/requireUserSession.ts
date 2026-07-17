import type { FastifyReply, FastifyRequest } from "fastify";
import { resolveUserSession, type UserPrincipal } from "../modules/users/session.js";

declare module "fastify" {
  interface FastifyRequest {
    user?: UserPrincipal;
  }
}

export async function requireUserSession(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const principal = await resolveUserSession(request);
  if (!principal) {
    reply.code(401).send({ error: "unauthorized" });
    return;
  }
  request.user = principal;
}
