import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  timestamp,
  varchar,
  uniqueIndex,
  index,
  text,
} from "drizzle-orm/pg-core";
import { userAccounts } from "./users.js";

export const memberRoles = [
  "owner",
  "adult",
  "teen",
  "child",
  "caregiver",
] as const;
export type MemberRole = (typeof memberRoles)[number];

export const memberStatuses = [
  "invited",
  "active",
  "suspended",
  "removed",
] as const;
export type MemberStatus = (typeof memberStatuses)[number];

export const invitationStatuses = [
  "pending",
  "accepted",
  "expired",
  "revoked",
] as const;
export type InvitationStatus = (typeof invitationStatuses)[number];

/**
 * Canonical household identity.
 * Phase 1: public_alias only.
 * Phase 2: name, owner, locale — still no home address / IP identity.
 */
export const households = pgTable(
  "households",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    publicAlias: varchar("public_alias", { length: 32 }).notNull(),
    name: varchar("name", { length: 120 }).notNull().default("My household"),
    ownerUserId: uuid("owner_user_id").references(() => userAccounts.id, {
      onDelete: "restrict",
    }),
    preferredLocale: varchar("preferred_locale", { length: 16 })
      .notNull()
      .default("en"),
    /** Optional coarse region label — never used as household identity. */
    region: varchar("region", { length: 64 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("households_public_alias_uidx").on(table.publicAlias),
    index("households_deleted_at_idx").on(table.deletedAt),
    index("households_owner_user_id_idx").on(table.ownerUserId),
  ],
);

export const householdMembers = pgTable(
  "household_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    householdId: uuid("household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => userAccounts.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 32 }).notNull().$type<MemberRole>(),
    status: varchar("status", { length: 32 }).notNull().$type<MemberStatus>(),
    joinedAt: timestamp("joined_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("household_members_household_id_idx").on(table.householdId),
    index("household_members_user_id_idx").on(table.userId),
    uniqueIndex("household_members_active_uidx")
      .on(table.householdId, table.userId)
      .where(sql`${table.status} = 'active'`),
    uniqueIndex("household_members_one_active_owner_uidx")
      .on(table.householdId)
      .where(sql`${table.role} = 'owner' AND ${table.status} = 'active'`),
  ],
);

export const householdInvitations = pgTable(
  "household_invitations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    householdId: uuid("household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 255 }).notNull(),
    invitedByUserId: uuid("invited_by_user_id")
      .notNull()
      .references(() => userAccounts.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 32 }).notNull().$type<MemberRole>(),
    tokenHash: text("token_hash").notNull(),
    status: varchar("status", { length: 32 })
      .notNull()
      .$type<InvitationStatus>()
      .default("pending"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("household_invitations_token_hash_uidx").on(table.tokenHash),
    index("household_invitations_household_id_idx").on(table.householdId),
    index("household_invitations_email_idx").on(table.email),
    index("household_invitations_status_idx").on(table.status),
  ],
);
