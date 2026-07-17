import {
  pgTable,
  uuid,
  timestamp,
  varchar,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

/**
 * Canonical household identity lives in Fadi Core.
 * No personal names, emails, or addresses are stored here in Phase 1.
 */
export const households = pgTable(
  "households",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    publicAlias: varchar("public_alias", { length: 32 }).notNull(),
    region: varchar("region", { length: 64 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("households_public_alias_uidx").on(table.publicAlias),
    index("households_deleted_at_idx").on(table.deletedAt),
  ],
);
