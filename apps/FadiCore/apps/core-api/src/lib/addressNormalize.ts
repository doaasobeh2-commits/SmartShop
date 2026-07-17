import { createHash } from "node:crypto";

export type AddressInput = {
  countryCode: string;
  postalCode: string;
  city: string;
  street: string;
  houseNumber: string;
  unit?: string | null;
};

export type NormalizedAddress = {
  countryCode: string;
  postalCode: string;
  city: string;
  street: string;
  houseNumber: string;
  unit: string | null;
  /** Internal only — never return to clients. */
  normalizedAddressHash: string;
};

function collapseWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function stripDiacritics(value: string): string {
  return value.normalize("NFKD").replace(/\p{M}/gu, "");
}

function normalizePart(value: string): string {
  return stripDiacritics(collapseWhitespace(value)).toUpperCase();
}

/**
 * Normalize address fields and compute a stable SHA-256 hash.
 * Hash is for server-side discovery matching only — never expose to clients.
 */
export function normalizeAddress(input: AddressInput): NormalizedAddress {
  const countryCode = collapseWhitespace(input.countryCode).toUpperCase().slice(0, 2);
  const postalCode = normalizePart(input.postalCode).replace(/[^A-Z0-9]/g, "");
  const city = normalizePart(input.city);
  const street = normalizePart(input.street);
  const houseNumber = normalizePart(input.houseNumber).replace(/\s+/g, "");
  const unitRaw = input.unit?.trim();
  const unit = unitRaw ? normalizePart(unitRaw) : null;

  const canonical = [
    countryCode,
    postalCode,
    city,
    street,
    houseNumber,
    unit ?? "",
  ].join("|");

  const normalizedAddressHash = createHash("sha256")
    .update(canonical)
    .digest("hex");

  return {
    countryCode,
    postalCode: collapseWhitespace(input.postalCode).toUpperCase(),
    city: collapseWhitespace(input.city),
    street: collapseWhitespace(input.street),
    houseNumber: collapseWhitespace(input.houseNumber),
    unit: unitRaw ? collapseWhitespace(unitRaw) : null,
    normalizedAddressHash,
  };
}

/** Privacy-safe postal preview for admin (first 3 chars + ***). */
export function postalCodePrefix(postalCode: string): string {
  const cleaned = collapseWhitespace(postalCode);
  if (cleaned.length <= 3) return `${cleaned}***`;
  return `${cleaned.slice(0, 3)}***`;
}
