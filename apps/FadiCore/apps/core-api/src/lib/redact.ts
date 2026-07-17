const SECRET_KEY_PATTERN =
  /(password|token|hash|secret|api[_-]?key|authorization|cookie)/i;

/** Strip secret-looking keys from audit metadata for admin responses. */
export function redactAuditMeta(
  meta: Record<string, unknown> | null | undefined,
): Record<string, unknown> {
  if (!meta || typeof meta !== "object") return {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    if (SECRET_KEY_PATTERN.test(key)) continue;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      out[key] = redactAuditMeta(value as Record<string, unknown>);
    } else if (typeof value === "string" && /^(fadi_|argon2|\$argon2)/i.test(value)) {
      continue;
    } else {
      out[key] = value;
    }
  }
  return out;
}

export function assertNoSecretsInJson(payload: unknown): void {
  const text = JSON.stringify(payload);
  if (
    /passwordHash|password_hash|tokenHash|token_hash|keyHash|key_hash/i.test(
      text,
    )
  ) {
    throw new Error("Refusing to serialize secret fields to admin response");
  }
}
