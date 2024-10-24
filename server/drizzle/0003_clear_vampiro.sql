ALTER TYPE "locker_state" ADD VALUE 'offline';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "locker_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"locker_id" uuid,
	"location_id" uuid NOT NULL,
	"row" integer NOT NULL,
	"column" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "locker_item_locker_id_unique" UNIQUE("locker_id"),
	CONSTRAINT "locker_item_location_id_row_column_unique" UNIQUE("location_id","row","column")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "locker_item" ADD CONSTRAINT "locker_item_locker_id_lockers_id_fk" FOREIGN KEY ("locker_id") REFERENCES "public"."lockers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "locker_item" ADD CONSTRAINT "locker_item_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
