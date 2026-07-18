import type { FastifyReply, FastifyRequest } from "fastify";
import { opaqueEnvelope, toLoggableError } from "./safeErrors.js";

/**
 * Handled (non-thrown) infrastructure failures.
 * Logs redacted diagnostics once here — do not rethrow (avoids global handler double-log).
 */
export function replyDatabaseUnavailable(
  reply: FastifyReply,
  request: FastifyRequest,
  error?: unknown,
): ReturnType<FastifyReply["send"]> {
  if (error !== undefined) {
    request.log.error(
      { err: toLoggableError(error) },
      "handled_infrastructure_error",
    );
  } else {
    request.log.error(
      { code: "database_unavailable" },
      "handled_infrastructure_error",
    );
  }
  return reply.code(503).send(opaqueEnvelope("database_unavailable"));
}

/** @fastify/rate-limit errorResponseBuilder body — no human message. */
export function rateLimitErrorBody(): {
  statusCode: number;
  error: "too_many_requests";
} {
  return {
    statusCode: 429,
    error: "too_many_requests",
  };
}
