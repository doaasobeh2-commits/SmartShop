import {
  pgTable,
  uuid,
  text,
  timestamp,
  varchar,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const adminRoles = ["owner", "operator", "viewer"] as const;
export type AdminRole = (typeof adminRoles)[number];

export const adminUsers = pgTable(
  "admin_users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    displayName: varchar("display_name", { length: 120 }).notNull(),
    role: varchar("role", { length: 32 }).notNull().$type<AdminRole>(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  },
  (table) => [uniqueIndex("admin_users_email_uidx").on(table.email)],
);

export const adminSessions = pgTable(
  "admin_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    ip: varchar("ip", { length: 64 }),
    userAgent: text("user_agent"),
  },
  (table) => [
    uniqueIndex("admin_sessions_token_hash_uidx").on(table.tokenHash),
    index("admin_sessions_user_id_idx").on(table.userId),
  ],
);
