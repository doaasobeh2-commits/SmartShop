import {
  pgTable,
  uuid,
  text,
  timestamp,
  varchar,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const appCodes = ["smartshop", "recipe", "fitness"] as const;
export type AppCode = (typeof appCodes)[number];

export const appClients = pgTable(
  "app_clients",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    appCode: varchar("app_code", { length: 32 }).notNull().$type<AppCode>(),
    name: varchar("name", { length: 120 }).notNull(),
    status: varchar("status", { length: 32 }).notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("app_clients_app_code_uidx").on(table.appCode)],
);

export const appApiKeys = pgTable(
  "app_api_keys",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    appClientId: uuid("app_client_id")
      .notNull()
      .references(() => appClients.id, { onDelete: "cascade" }),
    keyPrefix: varchar("key_prefix", { length: 32 }).notNull(),
    keyHash: text("key_hash").notNull(),
    scopes: jsonb("scopes").$type<string[]>().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("app_api_keys_key_hash_uidx").on(table.keyHash),
    index("app_api_keys_app_client_id_idx").on(table.appClientId),
  ],
);
