import {
  pgTable,
  uuid,
  timestamp,
  varchar,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const actorTypes = ["admin", "app", "system", "user"] as const;
export type ActorType = (typeof actorTypes)[number];

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorType: varchar("actor_type", { length: 16 }).notNull().$type<ActorType>(),
    actorId: varchar("actor_id", { length: 64 }),
    action: varchar("action", { length: 120 }).notNull(),
    resourceType: varchar("resource_type", { length: 64 }),
    resourceId: varchar("resource_id", { length: 64 }),
    metaJson: jsonb("meta_json").$type<Record<string, unknown>>().default({}),
    ip: varchar("ip", { length: 64 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("audit_logs_created_at_idx").on(table.createdAt),
    index("audit_logs_action_idx").on(table.action),
  ],
);
