-- Phase 4 correction: shared family members + application enrollment.
-- Forward-only. Migration 0002 left recipe_profiles empty/unreleased — drop it.
-- Fresh DBs applying 0001 → 0002 → 0003 reach the same final schema.

DROP TABLE IF EXISTS "recipe_profiles";
--> statement-breakpoint

ALTER TABLE "household_members" ADD COLUMN IF NOT EXISTS "display_name" varchar(120);
--> statement-breakpoint
UPDATE "household_members" AS hm
SET "display_name" = ua."display_name"
FROM "user_accounts" AS ua
WHERE hm."user_id" = ua."id" AND (hm."display_name" IS NULL OR hm."display_name" = '');
--> statement-breakpoint
UPDATE "household_members" SET "display_name" = 'Member' WHERE "display_name" IS NULL;
--> statement-breakpoint
ALTER TABLE "household_members" ALTER COLUMN "display_name" SET NOT NULL;
--> statement-breakpoint

ALTER TABLE "household_members" ADD COLUMN IF NOT EXISTS "preferred_locale" varchar(16);
--> statement-breakpoint
ALTER TABLE "household_members" ADD COLUMN IF NOT EXISTS "created_by_member_id" uuid;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "household_members" ADD CONSTRAINT "household_members_created_by_member_id_fk"
  FOREIGN KEY ("created_by_member_id") REFERENCES "public"."household_members"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

ALTER TABLE "household_members" ALTER COLUMN "user_id" DROP NOT NULL;
--> statement-breakpoint

DROP INDEX IF EXISTS "household_members_active_uidx";
--> statement-breakpoint
CREATE UNIQUE INDEX "household_members_active_uidx"
  ON "household_members" USING btree ("household_id","user_id")
  WHERE "status" = 'active' AND "user_id" IS NOT NULL;
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "platform_applications" (
	"key" varchar(32) PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"status" varchar(32) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
INSERT INTO "platform_applications" ("key", "name", "status")
VALUES
  ('recipe', 'RecipeAI', 'active'),
  ('fitness', 'FitnessAI', 'active'),
  ('smart_shop', 'Smart Shop', 'active')
ON CONFLICT ("key") DO NOTHING;
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "member_app_enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_member_id" uuid NOT NULL,
	"application_key" varchar(32) NOT NULL,
	"status" varchar(32) DEFAULT 'active' NOT NULL,
	"enrolled_at" timestamp with time zone DEFAULT now() NOT NULL,
	"enrolled_by_member_id" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "member_app_enrollments" ADD CONSTRAINT "member_app_enrollments_member_fk"
  FOREIGN KEY ("household_member_id") REFERENCES "public"."household_members"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "member_app_enrollments" ADD CONSTRAINT "member_app_enrollments_app_fk"
  FOREIGN KEY ("application_key") REFERENCES "public"."platform_applications"("key") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "member_app_enrollments" ADD CONSTRAINT "member_app_enrollments_enrolled_by_fk"
  FOREIGN KEY ("enrolled_by_member_id") REFERENCES "public"."household_members"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "member_app_enrollments_member_app_uidx"
  ON "member_app_enrollments" USING btree ("household_member_id","application_key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "member_app_enrollments_app_idx"
  ON "member_app_enrollments" USING btree ("application_key");
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "member_account_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"household_id" uuid NOT NULL,
	"household_member_id" uuid NOT NULL,
	"created_by_member_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"status" varchar(32) DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"accepted_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "member_account_claims" ADD CONSTRAINT "member_account_claims_household_fk"
  FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "member_account_claims" ADD CONSTRAINT "member_account_claims_member_fk"
  FOREIGN KEY ("household_member_id") REFERENCES "public"."household_members"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "member_account_claims" ADD CONSTRAINT "member_account_claims_created_by_fk"
  FOREIGN KEY ("created_by_member_id") REFERENCES "public"."household_members"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "member_account_claims" ADD CONSTRAINT "member_account_claims_accepted_user_fk"
  FOREIGN KEY ("accepted_user_id") REFERENCES "public"."user_accounts"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "member_account_claims_token_hash_uidx"
  ON "member_account_claims" USING btree ("token_hash");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "member_account_claims_member_idx"
  ON "member_account_claims" USING btree ("household_member_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "member_account_claims_status_idx"
  ON "member_account_claims" USING btree ("status");
