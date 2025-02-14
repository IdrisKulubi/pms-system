// requirements.ts
import { pgTable, serial, text, integer, timestamp, date, boolean } from "drizzle-orm/pg-core";

/**
 * Users Table
 *
 * Stores all users in the system. Each user has a role:
 * - "employee": submits KPIs and self-assessments.
 * - "manager": reviews employee KPIs and adds managerial comments.
 * - "super_admin": (CEO) can override manager reviews.
 *
 * Additional fields (e.g., department) may be used to align with your company’s PMS structure.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(), // Consider adding a unique constraint
  password: text("password").notNull(),
  role: text("role").notNull(), // Allowed values: "employee", "manager", "super_admin"
  department: text("department"), // Optional: helps segment users by department
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Review Cycles Table
 *
 * This table manages different appraisal periods (e.g., "2024 H1 Performance Review").
 * Associating KPIs with a review cycle helps in segregating performance data by period.
 */
export const reviewCycles = pgTable("review_cycles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // E.g., "2024 H1 Performance Review"
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  isActive: boolean("is_active").default(false).notNull(), // Indicates the current active cycle
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * KPIs Table
 *
 * Each KPI record is entered by an employee for a specific review cycle.
 * It contains the target, self-rating, and an optional self-comment.
 */
export const kpis = pgTable("kpis", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => users.id),
  reviewCycleId: integer("review_cycle_id").notNull().references(() => reviewCycles.id),
  title: text("title").notNull(),         // Short title or name of the KPI
  description: text("description"),         // Detailed description of the KPI
  target: text("target"),                   // E.g., "Increase sales by 15%"
  selfRating: integer("self_rating"),       // Optional: employee's self-assessment score
  selfComment: text("self_comment"),        // Optional: comments from the employee
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Manager Reviews Table
 *
 * Managers review KPIs submitted by employees.
 * This table captures the manager's rating, comments, and decision (e.g., approval status).
 */
export const managerReviews = pgTable("manager_reviews", {
  id: serial("id").primaryKey(),
  kpiId: integer("kpi_id").notNull().references(() => kpis.id),
  managerId: integer("manager_id").notNull().references(() => users.id), // Must have role "manager"
  rating: integer("rating"),                 // Manager's rating for the KPI
  comment: text("comment").notNull(),        // Manager's detailed feedback
  approved: boolean("approved").default(false).notNull(), // Manager’s decision (approved/requires improvement)
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * CEO Overrides Table
 *
 * The CEO (super admin) can override or adjust the manager’s review.
 * This table captures the override rating and comment.
 */
export const ceoOverrides = pgTable("ceo_overrides", {
  id: serial("id").primaryKey(),
  kpiId: integer("kpi_id").notNull().references(() => kpis.id),
  superAdminId: integer("super_admin_id").notNull().references(() => users.id), // Must have role "super_admin"
  overrideRating: integer("override_rating"),    // Optional: revised rating
  overrideComment: text("override_comment").notNull(), // CEO's overriding feedback
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
