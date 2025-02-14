ALTER TABLE "review_cycles" ALTER COLUMN "name" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "review_cycles" ALTER COLUMN "start_date" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "review_cycles" ALTER COLUMN "end_date" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "review_cycles" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "review_cycles_start_date_idx" ON "review_cycles" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "review_cycles_end_date_idx" ON "review_cycles" USING btree ("end_date");--> statement-breakpoint
ALTER TABLE "review_cycles" DROP COLUMN "is_pms_active";