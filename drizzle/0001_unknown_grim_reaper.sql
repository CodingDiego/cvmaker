CREATE TABLE "assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"content_type" text DEFAULT 'application/octet-stream' NOT NULL,
	"size" text,
	"private_pathname" text NOT NULL,
	"private_url" text NOT NULL,
	"shared" boolean DEFAULT false NOT NULL,
	"public_pathname" text,
	"public_url" text,
	"sync_run_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assets_user_idx" ON "assets" USING btree ("user_id");