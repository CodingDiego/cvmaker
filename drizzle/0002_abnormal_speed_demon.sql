ALTER TABLE "cvs" ADD COLUMN "is_public" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "cvs" ADD COLUMN "public_pdf_url" text;--> statement-breakpoint
ALTER TABLE "cvs" ADD COLUMN "public_docx_url" text;--> statement-breakpoint
ALTER TABLE "cvs" ADD COLUMN "shared_at" timestamp with time zone;