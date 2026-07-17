CREATE TABLE IF NOT EXISTS "recipe_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_account_id" uuid NOT NULL,
	"household_id" uuid NOT NULL,
	"display_name" varchar(120) NOT NULL,
	"preferred_language" varchar(16) DEFAULT 'en' NOT NULL,
	"country" varchar(80) DEFAULT '' NOT NULL,
	"region" varchar(120),
	"cooking_skill" varchar(32) DEFAULT 'beginner' NOT NULL,
	"household_cooking_role" varchar(32) DEFAULT 'owner' NOT NULL,
	"halal_required" boolean DEFAULT false NOT NULL,
	"vegetarian" boolean DEFAULT false NOT NULL,
	"vegan" boolean DEFAULT false NOT NULL,
	"allergies" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"disliked_ingredients" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"favorite_cuisines" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"measurement_system" varchar(16) DEFAULT 'metric' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recipe_profiles" ADD CONSTRAINT "recipe_profiles_user_account_id_user_accounts_id_fk" FOREIGN KEY ("user_account_id") REFERENCES "public"."user_accounts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recipe_profiles" ADD CONSTRAINT "recipe_profiles_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "recipe_profiles_user_account_uidx" ON "recipe_profiles" USING btree ("user_account_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recipe_profiles_household_id_idx" ON "recipe_profiles" USING btree ("household_id");
