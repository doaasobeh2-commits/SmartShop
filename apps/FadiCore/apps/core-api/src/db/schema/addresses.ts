import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { households, householdMembers, type MemberRole } from "./households.js";
import { platformApplications, type PlatformApplicationKey } from "./enrollments.js";
import { userAccounts } from "./users.js";

export const householdAddresses = pgTable(
  "household_addresses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    householdId: uuid("household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
    countryCode: varchar("country_code", { length: 2 }).notNull(),
    postalCode: varchar("postal_code", { length: 32 }).notNull(),
    city: varchar("city", { length: 120 }).notNull(),
    street: varchar("street", { length: 200 }).notNull(),
    houseNumber: varchar("house_number", { length: 32 }).notNull(),
    unit: varchar("unit", { length: 64 }),
    normalizedAddressHash: text("normalized_address_hash").notNull(),
    isPrimary: boolean("is_primary").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("household_addresses_household_id_idx").on(table.householdId),
    index("household_addresses_hash_idx").on(table.normalizedAddressHash),
    uniqueIndex("household_addresses_primary_uidx")
      .on(table.householdId)
      .where(sql`${table.isPrimary} = true`),
  ],
);

export const joinRequestStatuses = [
  "pending",
  "approved",
  "rejected",
  "expired",
] as const;
export type JoinRequestStatus = (typeof joinRequestStatuses)[number];

export const householdJoinRequests = pgTable(
  "household_join_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    requesterUserId: uuid("requester_user_id")
      .notNull()
      .references(() => userAccounts.id, { onDelete: "cascade" }),
    targetHouseholdId: uuid("target_household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
    requestedRole: varchar("requested_role", { length: 32 })
      .notNull()
      .$type<MemberRole>()
      .default("adult"),
    status: varchar("status", { length: 32 })
      .notNull()
      .$type<JoinRequestStatus>()
      .default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    resolvedByMemberId: uuid("resolved_by_member_id").references(
      () => householdMembers.id,
      { onDelete: "set null" },
    ),
  },
  (table) => [
    index("household_join_requests_household_idx").on(table.targetHouseholdId),
    index("household_join_requests_requester_idx").on(table.requesterUserId),
    uniqueIndex("household_join_requests_pending_uidx")
      .on(table.requesterUserId, table.targetHouseholdId)
      .where(sql`${table.status} = 'pending'`),
  ],
);

export const parentalApprovalStatuses = [
  "pending",
  "approved",
  "revoked",
  "expired",
] as const;
export type ParentalApprovalStatus = (typeof parentalApprovalStatuses)[number];

export const parentalApprovals = pgTable(
  "parental_approvals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    householdMemberId: uuid("household_member_id")
      .notNull()
      .references(() => householdMembers.id, { onDelete: "cascade" }),
    applicationKey: varchar("application_key", { length: 32 })
      .notNull()
      .$type<PlatformApplicationKey>()
      .references(() => platformApplications.key, { onDelete: "restrict" }),
    status: varchar("status", { length: 32 })
      .notNull()
      .$type<ParentalApprovalStatus>()
      .default("pending"),
    approvedByMemberId: uuid("approved_by_member_id").references(
      () => householdMembers.id,
      { onDelete: "set null" },
    ),
    requesterUserId: uuid("requester_user_id").references(() => userAccounts.id, {
      onDelete: "set null",
    }),
    parentEmailNormalized: varchar("parent_email_normalized", { length: 255 }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("parental_approvals_member_idx").on(table.householdMemberId),
    uniqueIndex("parental_approvals_active_uidx")
      .on(table.householdMemberId, table.applicationKey)
      .where(sql`${table.status} IN ('pending', 'approved')`),
  ],
);
