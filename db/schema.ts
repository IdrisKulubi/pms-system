import { 
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  
  index,
  boolean,
  uniqueIndex,
  decimal,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';
import { and, eq } from 'drizzle-orm';
import db from "./drizzle";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).$type<'super_admin' | 'manager' | 'employee'>().notNull(),
  department: text("department"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (users) => ({
  emailIndex: uniqueIndex("email_idx").on(users.email),
  roleIndex: uniqueIndex("role_idx").on(users.role)
}));

// Define relations for users
export const usersRelations = relations(users, ({ many }) => ({
  feedback: many(feedback),
  givenFeedback: many(feedback, { relationName: 'adminFeedback' }),
}));

export const reviewCycles = pgTable("review_cycles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  startDateIdx: index("review_cycles_start_date_idx").on(table.startDate),
  endDateIdx: index("review_cycles_end_date_idx").on(table.endDate),
}));

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
  weight: decimal('weight', { precision: 5, scale: 2 }).notNull().default('0.00'),
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

export const feedback = pgTable('feedback', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  adminId: integer('admin_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  comment: text('comment').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('feedback_user_id_idx').on(table.userId),
  adminIdIdx: index('feedback_admin_id_idx').on(table.adminId),
}));

// Define relations for feedback
export const feedbackRelations = relations(feedback, ({ one }) => ({
  user: one(users, {
    fields: [feedback.userId],
    references: [users.id],
  }),
  admin: one(users, {
    fields: [feedback.adminId],
    references: [users.id],
    relationName: 'adminFeedback',
  }),
}));

// Update the User type to include feedback relations
export type User = typeof users.$inferSelect & {
  feedback?: (typeof feedback.$inferSelect)[];
  givenFeedback?: (typeof feedback.$inferSelect)[];
};

export type Feedback = typeof feedback.$inferSelect & {
  user?: User;
  admin?: User;
};

export const kpisRelations = relations(kpis, ({ one, many }) => ({
  employee: one(users, {
    fields: [kpis.employeeId],
    references: [users.id],
  }),
  managerReviews: many(managerReviews),
  ceoOverrides: many(ceoOverrides),
  pillar: one(pillars, {
    fields: [kpis.pillarId],
    references: [pillars.id],
  }),
}));

export const managerReviewsRelations = relations(managerReviews, ({ one }) => ({
  kpi: one(kpis, {
    fields: [managerReviews.kpiId],
    references: [kpis.id],
  }),
  manager: one(users, {
    fields: [managerReviews.managerId],
    references: [users.id],
  }),
}));

export const ceoOverridesRelations = relations(ceoOverrides, ({ one }) => ({
  kpi: one(kpis, {
    fields: [ceoOverrides.kpiId],
    references: [kpis.id],
  }),
  superAdmin: one(users, {
    fields: [ceoOverrides.superAdminId],
    references: [users.id],
  }),
}));

// Update the KPI type to include relations
export type KPI = typeof kpis.$inferSelect & {
  employee?: typeof users.$inferSelect;
  managerReviews?: (typeof managerReviews.$inferSelect & {
    manager?: typeof users.$inferSelect;
  })[];
  ceoOverrides?: (typeof ceoOverrides.$inferSelect & {
    superAdmin?: typeof users.$inferSelect;
  })[];
};

// Add a helper function to calculate weights
export async function calculateKPIWeights(employeeId: number, reviewCycleId: number) {
  const totalKPIs = await db.query.kpis.findMany({
    where: and(
      eq(kpis.employeeId, employeeId),
      eq(kpis.reviewCycleId, reviewCycleId)
    )
  });

  const weightPerKPI = totalKPIs.length > 0 ? (100 / totalKPIs.length).toFixed(2) : '0.00';
  
  // Update all KPIs with equal weights
  await db.update(kpis)
    .set({ weight: weightPerKPI })
    .where(and(
      eq(kpis.employeeId, employeeId),
      eq(kpis.reviewCycleId, reviewCycleId)
    ));

  return weightPerKPI;
}
