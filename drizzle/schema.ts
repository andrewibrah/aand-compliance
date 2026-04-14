import { int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Dealership profiles
export const dealerships = mysqlTable("dealerships", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  address: text("address"),
  city: text("city"),
  state: varchar("state", { length: 2 }),
  dmsVendor: varchar("dms_vendor", { length: 64 }),
  rooftopCount: int("rooftop_count").default(1),
  qualifiedIndividual: text("qualified_individual"),
  qiEmail: varchar("qi_email", { length: 320 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Dealership = typeof dealerships.$inferSelect;
export type InsertDealership = typeof dealerships.$inferInsert;

// Compliance answers per section
export const complianceAnswers = mysqlTable("compliance_answers", {
  id: int("id").autoincrement().primaryKey(),
  dealershipId: int("dealership_id").notNull().references(() => dealerships.id),
  section: int("section").notNull(),
  sectionName: text("section_name").notNull(),
  answers: json("answers").notNull(),
  score: int("score"),
  completed: int("completed").default(0),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ComplianceAnswer = typeof complianceAnswers.$inferSelect;
export type InsertComplianceAnswer = typeof complianceAnswers.$inferInsert;

// Generated documents (WISP, board report)
export const generatedDocuments = mysqlTable("generated_documents", {
  id: int("id").autoincrement().primaryKey(),
  dealershipId: int("dealership_id").notNull().references(() => dealerships.id),
  docType: varchar("doc_type", { length: 64 }).notNull(),
  version: int("version").default(1),
  storagePath: text("storage_path"),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
});

export type GeneratedDocument = typeof generatedDocuments.$inferSelect;
export type InsertGeneratedDocument = typeof generatedDocuments.$inferInsert;

// Subscriptions
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  dealershipId: int("dealership_id").notNull().references(() => dealerships.id),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  plan: varchar("plan", { length: 64 }).default("free"),
  status: varchar("status", { length: 64 }).default("active"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;