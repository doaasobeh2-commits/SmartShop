import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { isDatabaseConnectionError } from "../db/errors.js";

/** Stable client-facing codes only — never free-form exception text. */
export type OpaqueErrorCode =
  | "bad_request"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "too_many_requests"
  | "database_unavailable"
  | "internal_error";

const SAFE_CODE_RE = /^[a-z][a-z0-9_]{1,64}$/;

const STATUS_TO_CODE: Record<number, OpaqueErrorCode> = {
  400: "bad_request",
  401: "unauthorized",
  403: "forbidden",
  404: "not_found",
  409: "conflict",
  429: "too_many_requests",
  503: "database_unavailable",
};

export type OpaqueErrorEnvelope = {
  error: string;
};

export function isSafeErrorCode(value: unknown): value is string {
  return typeof value === "string" && SAFE_CODE_RE.test(value);
}

export function statusToOpaqueCode(statusCode: number): OpaqueErrorCode {
  if (STATUS_TO_CODE[statusCode]) return STATUS_TO_CODE[statusCode];
  if (statusCode >= 500) return "internal_error";
  if (statusCode >= 400) return "bad_request";
  return "internal_error";
}

/**
 * Resolve HTTP status + opaque code for an unexpected/thrown error.
 * Never uses exception messages as client-facing codes unless they are
 * already a safe snake_case code (e.g. "not_found").
 */
export function resolveThrownError(error: unknown): {
  statusCode: number;
  code: string;
} {
  if (isDatabaseConnectionError(error)) {
    return { statusCode: 503, code: "database_unavailable" };
  }

  const statusFromError = readStatusCode(error);
  const candidateCode = readCandidateCode(error);

  if (statusFromError !== undefined && statusFromError >= 400 && statusFromError < 600) {
    const code =
      candidateCode && isSafeErrorCode(candidateCode)
        ? candidateCode
        : statusToOpaqueCode(statusFromError);
    return { statusCode: statusFromError, code };
  }

  if (candidateCode && isSafeErrorCode(candidateCode)) {
    const statusCode = codeToDefaultStatus(candidateCode);
    return { statusCode, code: candidateCode };
  }

  return { statusCode: 500, code: "internal_error" };
}

function codeToDefaultStatus(code: string): number {
  switch (code) {
    case "bad_request":
    case "invalid_body":
    case "weak_password":
      return 400;
    case "unauthorized":
    case "invalid_credentials":
      return 401;
    case "forbidden":
      return 403;
    case "not_found":
      return 404;
    case "conflict":
    case "email_taken":
      return 409;
    case "too_many_requests":
      return 429;
    case "database_unavailable":
      return 503;
    default:
      return 500;
  }
}

function readStatusCode(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined;
  const statusCode = (error as { statusCode?: unknown }).statusCode;
  if (typeof statusCode === "number" && Number.isFinite(statusCode)) {
    return statusCode;
  }
  const status = (error as { status?: unknown }).status;
  if (typeof status === "number" && Number.isFinite(status)) {
    return status;
  }
  return undefined;
}

function readCandidateCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  const withCode = error as { code?: unknown; error?: unknown; message?: unknown };

  if (isSafeErrorCode(withCode.error)) return withCode.error;

  // Prefer our intentional Error("not_found") messages; reject Fastify FST_ERR_* codes.
  if (isSafeErrorCode(withCode.message)) return withCode.message;

  if (isSafeErrorCode(withCode.code) && !String(withCode.code).startsWith("FST_")) {
    return withCode.code;
  }

  return undefined;
}

/** Shape logged server-side — may include diagnostics, never returned to clients. */
export function toLoggableError(error: unknown): Record<string, unknown> {
  if (!error || typeof error !== "object") {
    return { type: typeof error, value: "[non-object]" };
  }

  const err = error as {
    name?: string;
    message?: string;
    code?: string | number;
    statusCode?: number;
    stack?: string;
  };

  return {
    type: err.name ?? "Error",
    code: err.code,
    statusCode: err.statusCode,
    // Keep message for operators; clients never see this object.
    message: typeof err.message === "string" ? redactLogString(err.message) : undefined,
    stack: typeof err.stack === "string" ? redactLogString(err.stack) : undefined,
  };
}

export function redactLogString(value: string): string {
  return value
    .replace(/(postgres(?:ql)?:\/\/)[^\s"']+/gi, "$1[Redacted]")
    .replace(/(password|passwd|pwd)\s*[:=]\s*\S+/gi, "$1=[Redacted]")
    .replace(/(authorization|api[_-]?key|token)\s*[:=]\s*\S+/gi, "$1=[Redacted]")
    .replace(/\bBearer\s+[A-Za-z0-9._\-+=/]+\b/gi, "Bearer [Redacted]")
    .replace(/\b(fadi_[a-z]+_|fadik_)[A-Za-z0-9._\-]+\b/gi, "[RedactedCredential]");
}

export function opaqueEnvelope(code: string): OpaqueErrorEnvelope {
  return { error: isSafeErrorCode(code) ? code : "internal_error" };
}

export async function registerSafeErrorHandlers(app: FastifyInstance): Promise<void> {
  app.setErrorHandler(
    (error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply) => {
      if (reply.sent) return;

      const resolved = resolveThrownError(error);

      request.log.error(
        {
          err: toLoggableError(error),
          requestId: request.id,
          routeUrl: request.url,
          method: request.method,
        },
        "request_failed",
      );

      return reply.code(resolved.statusCode).send(opaqueEnvelope(resolved.code));
    },
  );

  app.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
    request.log.info(
      { requestId: request.id, routeUrl: request.url, method: request.method },
      "route_not_found",
    );
    return reply.code(404).send(opaqueEnvelope("not_found"));
  });
}
