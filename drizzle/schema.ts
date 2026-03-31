import { boolean, integer, jsonb, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  password: varchar("password", { length: 255 }),
  role: text("role").$type<"user" | "admin">().default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(() => new Date()).notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  url: varchar("url", { length: 2048 }).notNull(),
  description: text("description"),
  region: varchar("region", { length: 100 }).default("Global"),
  industry: varchar("industry", { length: 255 }),
  status: text("status").$type<"draft" | "analyzing" | "ready" | "error">().default("draft").notNull(),
  step: text("step").$type<"define" | "discover" | "brief">().default("define").notNull(),
  contextSummary: text("contextSummary"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(() => new Date()).notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

export const competitors = pgTable("competitors", {
  id: serial("id").primaryKey(),
  projectId: integer("projectId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  url: varchar("url", { length: 2048 }),
  description: text("description"),
  threatScore: integer("threatScore"),
  threatLevel: text("threatLevel").$type<"critical" | "high" | "moderate" | "low">().default("moderate"),
  funding: varchar("funding", { length: 255 }),
  founded: varchar("founded", { length: 50 }),
  employees: varchar("employees", { length: 100 }),
  headquarters: varchar("headquarters", { length: 255 }),
  strengths: jsonb("strengths").$type<string[]>(),
  weaknesses: jsonb("weaknesses").$type<string[]>(),
  keyDifferentiators: jsonb("keyDifferentiators").$type<string[]>(),
  overlapAreas: jsonb("overlapAreas").$type<string[]>(),
  isManual: boolean("isManual").default(false),
  aiAnalysis: text("aiAnalysis"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(() => new Date()).notNull(),
});

export type Competitor = typeof competitors.$inferSelect;
export type InsertCompetitor = typeof competitors.$inferInsert;

export const territories = pgTable("territories", {
  id: serial("id").primaryKey(),
  projectId: integer("projectId").notNull(),
  type: text("type").$type<"owned" | "unoccupied" | "contested" | "indefensible">().notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  evidence: text("evidence"),
  competitors: jsonb("competitors").$type<string[]>(),
  strength: integer("strength"),
  opportunity: integer("opportunity"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Territory = typeof territories.$inferSelect;
export type InsertTerritory = typeof territories.$inferInsert;

export const briefs = pgTable("briefs", {
  id: serial("id").primaryKey(),
  projectId: integer("projectId").notNull(),
  overallScore: integer("overallScore"),
  scoreExplanation: text("scoreExplanation"),
  executiveSummary: text("executiveSummary"),
  marketPosition: text("marketPosition"),
  competitiveAdvantages: jsonb("competitiveAdvantages").$type<string[]>(),
  strategicRecommendations: jsonb("strategicRecommendations").$type<{ title: string; description: string; priority: string }[]>(),
  riskFactors: jsonb("riskFactors").$type<{ title: string; description: string; severity: string }[]>(),
  opportunities: jsonb("opportunities").$type<{ title: string; description: string; impact: string }[]>(),
  isPublic: boolean("isPublic").default(false),
  publicSlug: varchar("publicSlug", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(() => new Date()).notNull(),
});

export type Brief = typeof briefs.$inferSelect;
export type InsertBrief = typeof briefs.$inferInsert;

export const analysisJobs = pgTable("analysisJobs", {
  id: serial("id").primaryKey(),
  projectId: integer("projectId").notNull(),
  type: text("type").$type<"context" | "competitors" | "territories" | "brief" | "full">().notNull(),
  status: text("status").$type<"pending" | "running" | "completed" | "failed">().default("pending").notNull(),
  progress: integer("progress").default(0),
  progressMessage: varchar("progressMessage", { length: 500 }),
  result: text("result"),
  error: text("error"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(() => new Date()).notNull(),
});

export type AnalysisJob = typeof analysisJobs.$inferSelect;
export type InsertAnalysisJob = typeof analysisJobs.$inferInsert;
