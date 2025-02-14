CREATE TABLE "pillars" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"weight" numeric(5, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pps_goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"description" text NOT NULL,
	"verification" text NOT NULL,
	"weight" numeric(5, 2) NOT NULL,
	"kpi_id" integer,
	"review_cycle_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "progress_tracking" (
	"id" serial PRIMARY KEY NOT NULL,
	"goal_id" integer,
	"employee_id" integer,
	"current_progress" numeric(5, 2) DEFAULT '0.00',
	"target" numeric(5, 2) NOT NULL,
	"evidence" text,
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "kpis" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "kpis" ADD COLUMN "pillar_id" integer;--> statement-breakpoint
ALTER TABLE "kpis" ADD COLUMN "weight" numeric(5, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "review_cycles" ADD COLUMN "is_pms_active" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "pps_goals" ADD CONSTRAINT "pps_goals_kpi_id_kpis_id_fk" FOREIGN KEY ("kpi_id") REFERENCES "public"."kpis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pps_goals" ADD CONSTRAINT "pps_goals_review_cycle_id_review_cycles_id_fk" FOREIGN KEY ("review_cycle_id") REFERENCES "public"."review_cycles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress_tracking" ADD CONSTRAINT "progress_tracking_goal_id_pps_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."pps_goals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress_tracking" ADD CONSTRAINT "progress_tracking_employee_id_users_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kpis" ADD CONSTRAINT "kpis_pillar_id_pillars_id_fk" FOREIGN KEY ("pillar_id") REFERENCES "public"."pillars"("id") ON DELETE no action ON UPDATE no action;