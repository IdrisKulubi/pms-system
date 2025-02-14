CREATE TABLE "ceo_overrides" (
	"id" serial PRIMARY KEY NOT NULL,
	"kpi_id" integer NOT NULL,
	"super_admin_id" integer NOT NULL,
	"override_rating" integer,
	"override_comment" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kpis" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"review_cycle_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"target" text,
	"self_rating" integer,
	"self_comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "manager_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"kpi_id" integer NOT NULL,
	"manager_id" integer NOT NULL,
	"rating" integer,
	"comment" text NOT NULL,
	"approved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_cycles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" text NOT NULL,
	"department" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "ceo_overrides" ADD CONSTRAINT "ceo_overrides_kpi_id_kpis_id_fk" FOREIGN KEY ("kpi_id") REFERENCES "public"."kpis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ceo_overrides" ADD CONSTRAINT "ceo_overrides_super_admin_id_users_id_fk" FOREIGN KEY ("super_admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kpis" ADD CONSTRAINT "kpis_employee_id_users_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kpis" ADD CONSTRAINT "kpis_review_cycle_id_review_cycles_id_fk" FOREIGN KEY ("review_cycle_id") REFERENCES "public"."review_cycles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manager_reviews" ADD CONSTRAINT "manager_reviews_kpi_id_kpis_id_fk" FOREIGN KEY ("kpi_id") REFERENCES "public"."kpis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manager_reviews" ADD CONSTRAINT "manager_reviews_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ceo_overrides_kpi_id_idx" ON "ceo_overrides" USING btree ("kpi_id");--> statement-breakpoint
CREATE INDEX "kpis_employee_id_idx" ON "kpis" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "kpis_review_cycle_id_idx" ON "kpis" USING btree ("review_cycle_id");--> statement-breakpoint
CREATE INDEX "manager_reviews_kpi_id_idx" ON "manager_reviews" USING btree ("kpi_id");--> statement-breakpoint
CREATE UNIQUE INDEX "email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "role_idx" ON "users" USING btree ("role");