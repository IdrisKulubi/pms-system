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
  createdAt: timestamp("created_at").defaultNow().notNull()
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
  updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (table) => ({
  employeeIdx: index("kpis_employee_id_idx").on(table.employeeId),
  reviewCycleIdx: index("kpis_review_cycle_id_idx").on(table.reviewCycleId),
}));

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
