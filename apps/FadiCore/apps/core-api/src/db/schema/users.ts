import {
  pgTable,
  uuid,
  text,
  timestamp,
  varchar,
  uniqueIndex,
  index,
  date,
} from "drizzle-orm/pg-core";

export const userAccountStatuses = ["active", "suspended", "deleted"] as const;
export type UserAccountStatus = (typeof userAccountStatuses)[number];

/**
 * End-user Fadi accounts (separate from admin_users).
 * Identity for household linking — never IP-based.
 */
export const userAccounts = pgTable(
  "user_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    displayName: varchar("display_name", { length: 120 }).notNull(),
    /** Optional ISO date of birth for age-gated product access. */
    dateOfBirth: date("date_of_birth"),
    status: varchar("status", { length: 32 })
      .notNull()
      .$type<UserAccountStatus>()
      .default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  },
  (table) => [uniqueIndex("user_accounts_email_uidx").on(table.email)],
);

/** User app sessions — separate cookie/table from admin_sessions. */
export const userSessions = pgTable(
  "user_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => userAccounts.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    ip: varchar("ip", { length: 64 }),
    userAgent: text("user_agent"),
  },
  (table) => [
    uniqueIndex("user_sessions_token_hash_uidx").on(table.tokenHash),
    index("user_sessions_user_id_idx").on(table.userId),
  ],
);
