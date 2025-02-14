import { 
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  date,
  index,
  boolean,
  uniqueIndex,
  decimal,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ['employee', 'manager', 'super_admin'] }).notNull(),
  department: text("department"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (users) => ({
  emailIndex: uniqueIndex("email_idx").on(users.email),
  roleIndex: uniqueIndex("role_idx").on(users.role)
}));

export const reviewCycles = pgTable("review_cycles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  isPmsActive: boolean('is_pms_active').default(false),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const pillars = pgTable('pillars', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  weight: decimal('weight', { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const kpis = pgTable("kpis", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => users.id).notNull(),
  reviewCycleId: integer("review_cycle_id").references(() => reviewCycles.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  target: text("target"),
  selfRating: integer("self_rating"),
  selfComment: text("self_comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  name: text('name').notNull(),
  pillarId: integer('pillar_id').references(() => pillars.id),
  weight: decimal('weight', { precision: 5, scale: 2 }).notNull(),
}, (table) => ({
  employeeIdx: index("kpis_employee_id_idx").on(table.employeeId),
  reviewCycleIdx: index("kpis_review_cycle_id_idx").on(table.reviewCycleId),
}));

export const ppsGoals = pgTable('pps_goals', {
  id: serial('id').primaryKey(),
  description: text('description').notNull(),
  verification: text('verification').notNull(),
  weight: decimal('weight', { precision: 5, scale: 2 }).notNull(),
  kpiId: integer('kpi_id').references(() => kpis.id),
  reviewCycleId: integer('review_cycle_id').references(() => reviewCycles.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const progressTracking = pgTable('progress_tracking', {
  id: serial('id').primaryKey(),
  weight: decimal('weight', { precision: 5, scale: 2 }).notNull(),
  goalId: integer('goal_id').references(() => ppsGoals.id),
  employeeId: integer('employee_id').references(() => users.id),
  currentProgress: decimal('current_progress', { precision: 5, scale: 2 }).default('0.00'),
  target: decimal('target', { precision: 5, scale: 2 }).notNull(),
  evidence: text('evidence'),
  status: text('status').$type<'pending'|'approved'|'rejected'>().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const managerReviews = pgTable("manager_reviews", {
  id: serial("id").primaryKey(),
  kpiId: integer("kpi_id").references(() => kpis.id).notNull(),
  managerId: integer("manager_id").references(() => users.id).notNull(),
  rating: integer("rating"),
  comment: text("comment").notNull(),
  approved: boolean("approved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (table) => ({
  kpiIdx: index("manager_reviews_kpi_id_idx").on(table.kpiId),
}));

export const ceoOverrides = pgTable("ceo_overrides", {
  id: serial("id").primaryKey(),
  kpiId: integer("kpi_id").references(() => kpis.id).notNull(),
  superAdminId: integer("super_admin_id").references(() => users.id).notNull(),
  overrideRating: integer("override_rating"),
  overrideComment: text("override_comment").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (table) => ({
  kpiIdx: index("ceo_overrides_kpi_id_idx").on(table.kpiId),
}));
