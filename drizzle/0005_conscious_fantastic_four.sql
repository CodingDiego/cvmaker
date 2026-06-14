CREATE TABLE "polar_checkouts" (
	"checkout_id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"status" text NOT NULL,
	"applied_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "polar_checkouts" ADD CONSTRAINT "polar_checkouts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "polar_checkouts_user_idx" ON "polar_checkouts" USING btree ("user_id");