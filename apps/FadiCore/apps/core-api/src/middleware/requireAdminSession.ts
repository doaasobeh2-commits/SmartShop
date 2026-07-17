import type { FastifyReply, FastifyRequest } from "fastify";
import { resolveAdminSession, type AdminPrincipal } from "../modules/auth/session.js";

declare module "fastify" {
  interface FastifyRequest {
    admin?: AdminPrincipal;
  }
}

export async function requireAdminSession(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const principal = await resolveAdminSession(request);
  if (!principal) {
    return reply.code(401).send({ error: "unauthorized" });
  }
  request.admin = principal;
}
