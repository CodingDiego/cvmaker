ALTER TABLE "users" ADD COLUMN "billing_plan" text DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "polar_customer_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "polar_subscription_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "polar_subscription_status" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "polar_state_synced_at" timestamp with time zone;