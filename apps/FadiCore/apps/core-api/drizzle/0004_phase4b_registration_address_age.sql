-- Phase 4b: registration without auto-household, addresses, join requests,
-- DOB/age policy support, application scope, parental approvals.
-- Forward-only. Do not rewrite 0001–0003.

ALTER TABLE "user_accounts" ADD COLUMN IF NOT EXISTS "date_of_birth" date;
--> statement-breakpoint

ALTER TABLE "platform_applications" ADD COLUMN IF NOT EXISTS "scope" varchar(32);
--> statement-breakpoint
UPDATE "platform_applications" SET "scope" = 'household' WHERE "key" IN ('recipe', 'smart_shop');
--> statement-breakpoint
UPDATE "platform_applications" SET "scope" = 'member' WHERE "key" = 'fitness';
--> statement-breakpoint
UPDATE "platform_applications" SET "scope" = 'household' WHERE "scope" IS NULL;
--> statement-breakpoint
ALTER TABLE "platform_applications" ALTER COLUMN "scope" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "platform_applications" ALTER COLUMN "scope" SET DEFAULT 'household';
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "household_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_id" uuid NOT NULL,
	"country_code" varchar(2) NOT NULL,
	"postal_code" varchar(32) NOT NULL,
	"city" varchar(120) NOT NULL,
	"street" varchar(200) NOT NULL,
	"house_number" varchar(32) NOT NULL,
	"unit" varchar(64),
	"normalized_address_hash" text NOT NULL,
	"is_primary" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "household_addresses" ADD CONSTRAINT "household_addresses_household_fk"
  FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "household_addresses_household_id_idx"
  ON "household_addresses" USING btree ("household_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "household_addresses_hash_idx"
  ON "household_addresses" USING btree ("normalized_address_hash");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "household_addresses_primary_uidx"
  ON "household_addresses" USING btree ("household_id")
  WHERE "is_primary" = true;
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "household_join_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requester_user_id" uuid NOT NULL,
	"target_household_id" uuid NOT NULL,
	"requested_role" varchar(32) DEFAULT 'adult' NOT NULL,
	"status" varchar(32) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"resolved_at" timestamp with time zone,
	"resolved_by_member_id" uuid
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "household_join_requests" ADD CONSTRAINT "household_join_requests_requester_fk"
  FOREIGN KEY ("requester_user_id") REFERENCES "public"."user_accounts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "household_join_requests" ADD CONSTRAINT "household_join_requests_household_fk"
  FOREIGN KEY ("target_household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "household_join_requests" ADD CONSTRAINT "household_join_requests_resolved_by_fk"
  FOREIGN KEY ("resolved_by_member_id") REFERENCES "public"."household_members"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "household_join_requests_household_idx"
  ON "household_join_requests" USING btree ("target_household_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "household_join_requests_requester_idx"
  ON "household_join_requests" USING btree ("requester_user_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "household_join_requests_pending_uidx"
  ON "household_join_requests" USING btree ("requester_user_id", "target_household_id")
  WHERE "status" = 'pending';
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "parental_approvals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_member_id" uuid NOT NULL,
	"application_key" varchar(32) NOT NULL,
	"status" varchar(32) DEFAULT 'pending' NOT NULL,
	"approved_by_member_id" uuid,
	"requester_user_id" uuid,
	"parent_email_normalized" varchar(255),
	"approved_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "parental_approvals" ADD CONSTRAINT "parental_approvals_member_fk"
  FOREIGN KEY ("household_member_id") REFERENCES "public"."household_members"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "parental_approvals" ADD CONSTRAINT "parental_approvals_app_fk"
  FOREIGN KEY ("application_key") REFERENCES "public"."platform_applications"("key") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "parental_approvals" ADD CONSTRAINT "parental_approvals_approved_by_fk"
  FOREIGN KEY ("approved_by_member_id") REFERENCES "public"."household_members"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "parental_approvals" ADD CONSTRAINT "parental_approvals_requester_fk"
  FOREIGN KEY ("requester_user_id") REFERENCES "public"."user_accounts"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "parental_approvals_member_idx"
  ON "parental_approvals" USING btree ("household_member_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "parental_approvals_active_uidx"
  ON "parental_approvals" USING btree ("household_member_id", "application_key")
  WHERE "status" IN ('pending', 'approved');
