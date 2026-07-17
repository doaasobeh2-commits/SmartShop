import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { householdMembers } from "./households.js";
import { households } from "./households.js";
import { userAccounts } from "./users.js";

/** Stable application keys — extend by INSERT, not schema rewrite. */
export const platformApplicationKeys = [
  "recipe",
  "fitness",
  "smart_shop",
] as const;
export type PlatformApplicationKey = (typeof platformApplicationKeys)[number];

export const applicationScopes = ["household", "member"] as const;
export type ApplicationScope = (typeof applicationScopes)[number];

export const platformApplications = pgTable("platform_applications", {
  key: varchar("key", { length: 32 }).primaryKey().$type<PlatformApplicationKey>(),
  name: varchar("name", { length: 120 }).notNull(),
  status: varchar("status", { length: 32 }).notNull().default("active"),
  scope: varchar("scope", { length: 32 })
    .notNull()
    .$type<ApplicationScope>()
    .default("household"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const enrollmentStatuses = [
  "invited",
  "active",
  "suspended",
  "removed",
] as const;
export type EnrollmentStatus = (typeof enrollmentStatuses)[number];

export const memberAppEnrollments = pgTable(
  "member_app_enrollments",
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
      .$type<EnrollmentStatus>()
      .default("active"),
    enrolledAt: timestamp("enrolled_at", { withTimezone: true }).defaultNow().notNull(),
    enrolledByMemberId: uuid("enrolled_by_member_id").references(
      () => householdMembers.id,
      { onDelete: "set null" },
    ),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("member_app_enrollments_member_app_uidx").on(
      table.householdMemberId,
      table.applicationKey,
    ),
    index("member_app_enrollments_app_idx").on(table.applicationKey),
  ],
);

export const claimStatuses = [
  "pending",
  "accepted",
  "expired",
  "revoked",
] as const;
export type ClaimStatus = (typeof claimStatuses)[number];

export const memberAccountClaims = pgTable(
  "member_account_claims",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    householdId: uuid("household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
    householdMemberId: uuid("household_member_id")
      .notNull()
      .references(() => householdMembers.id, { onDelete: "cascade" }),
    createdByMemberId: uuid("created_by_member_id")
      .notNull()
      .references(() => householdMembers.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    status: varchar("status", { length: 32 })
      .notNull()
      .$type<ClaimStatus>()
      .default("pending"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    acceptedUserId: uuid("accepted_user_id").references(() => userAccounts.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("member_account_claims_token_hash_uidx").on(table.tokenHash),
    index("member_account_claims_member_idx").on(table.householdMemberId),
    index("member_account_claims_status_idx").on(table.status),
  ],
);
