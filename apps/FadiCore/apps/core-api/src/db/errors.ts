/**
 * Detect common Postgres / driver connection failures so callers can
 * return a clear 503 instead of an opaque 500.
 */
export function isDatabaseConnectionError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const err = error as {
    code?: string;
    errno?: string | number;
    message?: string;
    cause?: unknown;
  };

  const code = String(err.code ?? err.errno ?? "");
  const message = String(err.message ?? "").toLowerCase();

  const connectionCodes = new Set([
    "ECONNREFUSED",
    "ENOTFOUND",
    "EAI_AGAIN",
    "ETIMEDOUT",
    "ECONNRESET",
    "57P01", // admin_shutdown
    "57P02", // crash_shutdown
    "57P03", // cannot_connect_now
    "08001", // sqlclient_unable_to_establish_sqlconnection
    "08006", // connection_failure
  ]);

  if (connectionCodes.has(code)) return true;

  if (
    message.includes("econnrefused") ||
    message.includes("connect econnrefused") ||
    message.includes("connection refused") ||
    message.includes("getaddrinfo") ||
    message.includes("timeout expired") ||
    message.includes("could not connect") ||
    message.includes("connection terminated")
  ) {
    return true;
  }

  if (err.cause) {
    return isDatabaseConnectionError(err.cause);
  }

  return false;
}
