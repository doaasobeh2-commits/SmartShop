/**
 * Pino/Fastify logger redact paths for request bodies and headers.
 * Internal logs may still include error stacks via toLoggableError — never
 * return those fields to HTTP clients.
 */
export const LOGGER_REDACT_PATHS = [
  "req.headers.authorization",
  "req.headers.cookie",
  "req.headers['set-cookie']",
  "req.body.password",
  "req.body.token",
  "req.body.dateOfBirth",
  "req.body.date_of_birth",
] as const;
