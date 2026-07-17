import { and, eq, gt, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import { householdAddresses, households } from "../../db/schema/index.js";
import {
  normalizeAddress,
  type AddressInput,
} from "../../lib/addressNormalize.js";

export type AddressDiscoverResult = {
  possibleMatch: boolean;
  matchCountBand: "none" | "one" | "multiple";
};

/**
 * Privacy-safe address discovery: returns only match bands.
 * Never returns household ids, names, members, emails, or addresses.
 */
export async function discoverAddressMatch(
  address: AddressInput,
): Promise<AddressDiscoverResult> {
  const normalized = normalizeAddress(address);

  const rows = await db
    .select({
      householdId: householdAddresses.householdId,
    })
    .from(householdAddresses)
    .innerJoin(
      households,
      and(
        eq(householdAddresses.householdId, households.id),
        sql`${households.deletedAt} is null`,
      ),
    )
    .where(
      and(
        eq(
          householdAddresses.normalizedAddressHash,
          normalized.normalizedAddressHash,
        ),
        eq(householdAddresses.isPrimary, true),
      ),
    );

  const uniqueHouseholds = new Set(rows.map((r) => r.householdId));
  const count = uniqueHouseholds.size;

  if (count === 0) {
    return { possibleMatch: false, matchCountBand: "none" };
  }
  if (count === 1) {
    return { possibleMatch: true, matchCountBand: "one" };
  }
  return { possibleMatch: true, matchCountBand: "multiple" };
}

export async function findHouseholdIdsByAddressHash(
  hash: string,
): Promise<string[]> {
  const rows = await db
    .select({
      householdId: householdAddresses.householdId,
    })
    .from(householdAddresses)
    .innerJoin(
      households,
      and(
        eq(householdAddresses.householdId, households.id),
        sql`${households.deletedAt} is null`,
      ),
    )
    .where(
      and(
        eq(householdAddresses.normalizedAddressHash, hash),
        eq(householdAddresses.isPrimary, true),
        gt(households.createdAt, new Date(0)),
      ),
    );

  return [...new Set(rows.map((r) => r.householdId))];
}
