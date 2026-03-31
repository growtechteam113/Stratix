import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
  InsertUser, users, projects, competitors, territories, briefs, analysisJobs
} from "../drizzle/schema";
import type {
  InsertProject, InsertCompetitor, InsertTerritory, InsertBrief, InsertAnalysisJob
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const dbUrl = process.env.DATABASE_URL!;
      const isLocal = dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1");
      const pool = new Pool({
        connectionString: dbUrl,
        ...(isLocal ? {} : { ssl: { rejectUnauthorized: false } }),
      });
      _db = drizzle(pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── User helpers ───────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod", "password"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet as any,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Project helpers ────────────────────────────────────────────

export async function createProject(data: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(projects).values(data).returning({ id: projects.id });
  const id = result[0].id;
  return { id, ...data };
}

export async function getUserProjects(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.createdAt));
}

export async function getProjectById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(projects).where(and(eq(projects.id, id), eq(projects.userId, userId))).limit(1);
  return result[0];
}

export async function updateProject(id: number, userId: number, data: Partial<InsertProject>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(projects).set(data).where(and(eq(projects.id, id), eq(projects.userId, userId)));
}

export async function deleteProject(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(competitors).where(eq(competitors.projectId, id));
  await db.delete(territories).where(eq(territories.projectId, id));
  await db.delete(briefs).where(eq(briefs.projectId, id));
  await db.delete(analysisJobs).where(eq(analysisJobs.projectId, id));
  await db.delete(projects).where(and(eq(projects.id, id), eq(projects.userId, userId)));
}

// ─── Competitor helpers ─────────────────────────────────────────

export async function getProjectCompetitors(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(competitors).where(eq(competitors.projectId, projectId)).orderBy(desc(competitors.threatScore));
}

export async function addCompetitor(data: InsertCompetitor) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(competitors).values(data).returning({ id: competitors.id });
  return { id: result[0].id, ...data };
}

export async function updateCompetitor(id: number, data: Partial<InsertCompetitor>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(competitors).set(data).where(eq(competitors.id, id));
}

export async function deleteCompetitor(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(competitors).where(eq(competitors.id, id));
}

export async function bulkInsertCompetitors(dataList: InsertCompetitor[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (dataList.length === 0) return;
  await db.insert(competitors).values(dataList);
}

// ─── Territory helpers ──────────────────────────────────────────

export async function getProjectTerritories(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(territories).where(eq(territories.projectId, projectId));
}

export async function bulkInsertTerritories(dataList: InsertTerritory[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (dataList.length === 0) return;
  await db.insert(territories).values(dataList);
}

export async function clearProjectTerritories(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(territories).where(eq(territories.projectId, projectId));
}

// ─── Brief helpers ──────────────────────────────────────────────

export async function getProjectBrief(projectId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(briefs).where(eq(briefs.projectId, projectId)).limit(1);
  return result[0];
}

export async function upsertBrief(projectId: number, data: Partial<InsertBrief>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getProjectBrief(projectId);
  if (existing) {
    await db.update(briefs).set(data).where(eq(briefs.id, existing.id));
    return { ...existing, ...data };
  } else {
    const result = await db.insert(briefs).values({ projectId, ...data }).returning({ id: briefs.id });
    return { id: result[0].id, projectId, ...data };
  }
}

export async function getBriefBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(briefs).where(and(eq(briefs.publicSlug, slug), eq(briefs.isPublic, true))).limit(1);
  return result[0];
}

// ─── Analysis Job helpers ───────────────────────────────────────

export async function createAnalysisJob(data: InsertAnalysisJob) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(analysisJobs).values(data).returning({ id: analysisJobs.id });
  return { id: result[0].id, ...data };
}

export async function updateAnalysisJob(id: number, data: Partial<InsertAnalysisJob>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(analysisJobs).set(data).where(eq(analysisJobs.id, id));
}

export async function getProjectJobs(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(analysisJobs).where(eq(analysisJobs.projectId, projectId)).orderBy(desc(analysisJobs.createdAt));
}
