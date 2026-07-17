import type { FastifyReply, FastifyRequest } from "fastify";
import { requireAdminSession } from "./requireAdminSession.js";

/** Phase 3 admin reads require the bootstrap owner role. */
export async function requireAdminOwner(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  await requireAdminSession(request, reply);
  if (reply.sent) return;

  if (request.admin?.role !== "owner") {
    reply.code(403).send({ error: "forbidden", message: "Owner admin role required." });
  }
}
