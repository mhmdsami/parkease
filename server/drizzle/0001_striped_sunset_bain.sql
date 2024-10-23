DO $$ BEGIN
 CREATE TYPE "public"."locker_state" AS ENUM('online', 'available', 'in_use', 'error');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lockers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"machine_id" text NOT NULL,
	"ip_addr" text NOT NULL,
	"state" "locker_state" DEFAULT 'available' NOT NULL,
	"is_alive" boolean DEFAULT true NOT NULL,
	"last_ping" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "lockers_machine_id_unique" UNIQUE("machine_id")
);
