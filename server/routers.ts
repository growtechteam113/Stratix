import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { sdk } from "./_core/sdk";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import * as db from "./db";
import { getThreatLevel } from "@shared/stratix-types";
import { extractContext, discoverCompetitors, analyzeTerritoriesAI, generateStrategicBrief } from "./ai-service";
import bcrypt from "bcryptjs";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),

    register: publicProcedure
      .input(z.object({
        name: z.string().min(1).max(100),
        email: z.string().email(),
        password: z.string().min(8).max(100),
      }))
      .mutation(async ({ ctx, input }) => {
        const existing = await db.getUserByOpenId(input.email);
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "Email already registered" });
        }
        const hashedPassword = await bcrypt.hash(input.password, 10);
        await db.upsertUser({
          openId: input.email,
          name: input.name,
          email: input.email,
          loginMethod: "email",
          password: hashedPassword,
          lastSignedIn: new Date(),
        });
        const sessionToken = await sdk.createSessionToken(input.email, {
          name: input.name,
          expiresInMs: ONE_YEAR_MS,
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        return { success: true } as const;
      }),

    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByOpenId(input.email);
        if (!user || !user.password) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        }
        const isValid = await bcrypt.compare(input.password, user.password);
        if (!isValid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        }
        await db.upsertUser({ openId: input.email, lastSignedIn: new Date() });
        const sessionToken = await sdk.createSessionToken(input.email, {
          name: user.name || "",
          expiresInMs: ONE_YEAR_MS,
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        return { success: true } as const;
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Projects ─────────────────────────────────────────────────
  projects: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserProjects(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await db.getProjectById(input.id, ctx.user.id);
        if (!project) throw new Error("Project not found");
        return project;
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        url: z.string().url(),
        description: z.string().optional(),
        region: z.string().default("Global"),
        industry: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createProject({
          userId: ctx.user.id,
          name: input.name,
          url: input.url,
          description: input.description ?? null,
          region: input.region,
          industry: input.industry ?? null,
          status: "draft",
          step: "define",
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        url: z.string().url().optional(),
        description: z.string().optional(),
        region: z.string().optional(),
        industry: z.string().optional(),
        step: z.enum(["define", "discover", "brief"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateProject(id, ctx.user.id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteProject(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ─── Competitors ──────────────────────────────────────────────
  competitors: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        // Verify project ownership
        const project = await db.getProjectById(input.projectId, ctx.user.id);
        if (!project) throw new Error("Project not found");
        return db.getProjectCompetitors(input.projectId);
      }),

    add: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        name: z.string().min(1),
        url: z.string().url().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await db.getProjectById(input.projectId, ctx.user.id);
        if (!project) throw new Error("Project not found");
        return db.addCompetitor({
          projectId: input.projectId,
          name: input.name,
          url: input.url ?? null,
          description: input.description ?? null,
          isManual: true,
          threatLevel: "moderate",
        });
      }),

    remove: protectedProcedure
      .input(z.object({ id: z.number(), projectId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const project = await db.getProjectById(input.projectId, ctx.user.id);
        if (!project) throw new Error("Project not found");
        await db.deleteCompetitor(input.id);
        return { success: true };
      }),
  }),

  // ─── Territories ──────────────────────────────────────────────
  territories: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await db.getProjectById(input.projectId, ctx.user.id);
        if (!project) throw new Error("Project not found");
        return db.getProjectTerritories(input.projectId);
      }),
  }),

  // ─── Brief ────────────────────────────────────────────────────
  brief: router({
    get: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await db.getProjectById(input.projectId, ctx.user.id);
        if (!project) throw new Error("Project not found");
        const brief = await db.getProjectBrief(input.projectId);
        return brief ?? null;
      }),

    getPublic: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const brief = await db.getBriefBySlug(input.slug);
        if (!brief) throw new Error("Report not found");
        return brief;
      }),

    togglePublic: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const project = await db.getProjectById(input.projectId, ctx.user.id);
        if (!project) throw new Error("Project not found");
        const brief = await db.getProjectBrief(input.projectId);
        if (!brief) throw new Error("Brief not found");
        const isPublic = !brief.isPublic;
        const publicSlug = isPublic ? nanoid(12) : null;
        await db.upsertBrief(input.projectId, { isPublic, publicSlug });
        return { isPublic, publicSlug };
      }),
  }),

  // ─── Analysis ─────────────────────────────────────────────────
  analysis: router({
    // Run full analysis pipeline
    runFull: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const project = await db.getProjectById(input.projectId, ctx.user.id);
        if (!project) throw new Error("Project not found");

        // Create job
        const job = await db.createAnalysisJob({
          projectId: input.projectId,
          type: "full",
          status: "running",
          progress: 0,
          progressMessage: "Starting analysis...",
        });

        // Run analysis in background (non-blocking)
        runFullAnalysis(project, job.id).catch(err => {
          console.error("[Analysis] Full analysis failed:", err);
          db.updateAnalysisJob(job.id, {
            status: "failed",
            error: err.message || "Unknown error",
          });
          db.updateProject(project.id, project.userId, { status: "error" });
        });

        return { jobId: job.id };
      }),

    // Discover competitors only
    discoverCompetitors: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const project = await db.getProjectById(input.projectId, ctx.user.id);
        if (!project) throw new Error("Project not found");

        const job = await db.createAnalysisJob({
          projectId: input.projectId,
          type: "competitors",
          status: "running",
          progress: 0,
          progressMessage: "Discovering competitors...",
        });

        runCompetitorDiscovery(project, job.id).catch(err => {
          console.error("[Analysis] Competitor discovery failed:", err);
          db.updateAnalysisJob(job.id, { status: "failed", error: err.message });
        });

        return { jobId: job.id };
      }),

    // Generate territories
    generateTerritories: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const project = await db.getProjectById(input.projectId, ctx.user.id);
        if (!project) throw new Error("Project not found");

        const job = await db.createAnalysisJob({
          projectId: input.projectId,
          type: "territories",
          status: "running",
          progress: 0,
          progressMessage: "Mapping territories...",
        });

        runTerritoryAnalysis(project, job.id).catch(err => {
          console.error("[Analysis] Territory analysis failed:", err);
          db.updateAnalysisJob(job.id, { status: "failed", error: err.message });
        });

        return { jobId: job.id };
      }),

    // Generate strategic brief
    generateBrief: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const project = await db.getProjectById(input.projectId, ctx.user.id);
        if (!project) throw new Error("Project not found");

        const job = await db.createAnalysisJob({
          projectId: input.projectId,
          type: "brief",
          status: "running",
          progress: 0,
          progressMessage: "Generating strategic brief...",
        });

        runBriefGeneration(project, job.id).catch(err => {
          console.error("[Analysis] Brief generation failed:", err);
          db.updateAnalysisJob(job.id, { status: "failed", error: err.message });
        });

        return { jobId: job.id };
      }),

    // Get job status
    jobStatus: protectedProcedure
      .input(z.object({ jobId: z.number() }))
      .query(async ({ input }) => {
        const jobs = await db.getProjectJobs(0); // We need a direct job lookup
        // For now, use a simple approach
        return { status: "completed" };
      }),

    jobs: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await db.getProjectById(input.projectId, ctx.user.id);
        if (!project) throw new Error("Project not found");
        return db.getProjectJobs(input.projectId);
      }),
  }),
});

// ─── Background analysis functions ──────────────────────────────

async function runCompetitorDiscovery(project: any, jobId: number) {
  try {
    await db.updateAnalysisJob(jobId, { progress: 10, progressMessage: "Extracting company context..." });
    await db.updateProject(project.id, project.userId, { status: "analyzing" });

    // Step 1: Extract context
    const context = await extractContext(project.url, project.name);
    await db.updateProject(project.id, project.userId, {
      contextSummary: context.description || context.valueProposition,
      industry: context.industry || project.industry,
    });

    await db.updateAnalysisJob(jobId, { progress: 40, progressMessage: "Discovering competitors..." });

    // Step 2: Discover competitors
    const competitorsList = await discoverCompetitors(
      project.name,
      context.industry || project.industry || "Technology",
      context.description || project.description || "",
      project.region || "Global"
    );

    await db.updateAnalysisJob(jobId, { progress: 70, progressMessage: "Saving competitor data..." });

    // Step 3: Save competitors
    const competitorRecords = competitorsList.map((c: any) => ({
      projectId: project.id,
      name: (c.name || "").substring(0, 255),
      url: c.url ? (c.url + "").substring(0, 2048) : null,
      description: c.description ? (c.description + "").substring(0, 65535) : null,
      threatScore: Math.min(20, Math.max(1, c.threatScore || 10)),
      threatLevel: getThreatLevel(c.threatScore || 10),
      funding: c.funding ? (c.funding + "").substring(0, 255) : null,
      founded: c.founded ? (c.founded + "").substring(0, 50) : null,
      employees: c.employees ? (c.employees + "").substring(0, 100) : null,
      headquarters: c.headquarters ? (c.headquarters + "").substring(0, 255) : null,
      strengths: Array.isArray(c.strengths) ? c.strengths.map((s: any) => (s + "").substring(0, 500)) : [],
      weaknesses: Array.isArray(c.weaknesses) ? c.weaknesses.map((w: any) => (w + "").substring(0, 500)) : [],
      keyDifferentiators: Array.isArray(c.keyDifferentiators) ? c.keyDifferentiators.map((d: any) => (d + "").substring(0, 500)) : [],
      overlapAreas: Array.isArray(c.overlapAreas) ? c.overlapAreas.map((o: any) => (o + "").substring(0, 500)) : [],
      isManual: false,
    }));

    await db.bulkInsertCompetitors(competitorRecords);

    await db.updateProject(project.id, project.userId, { step: "discover" });
    await db.updateAnalysisJob(jobId, {
      status: "completed",
      progress: 100,
      progressMessage: `Discovered ${competitorRecords.length} competitors`,
    });
  } catch (error: any) {
    await db.updateAnalysisJob(jobId, { status: "failed", error: error.message });
    throw error;
  }
}

async function runTerritoryAnalysis(project: any, jobId: number) {
  try {
    await db.updateAnalysisJob(jobId, { progress: 10, progressMessage: "Loading competitor data..." });

    const competitorsList = await db.getProjectCompetitors(project.id);
    const competitorsData = JSON.stringify(competitorsList.map(c => ({
      name: c.name,
      description: c.description,
      threatScore: c.threatScore,
      strengths: c.strengths,
      overlapAreas: c.overlapAreas,
    })));

    await db.updateAnalysisJob(jobId, { progress: 30, progressMessage: "Analyzing positioning territories..." });

    const territoriesList = await analyzeTerritoriesAI(
      project.name,
      project.industry || "Technology",
      competitorsData
    );

    await db.updateAnalysisJob(jobId, { progress: 70, progressMessage: "Saving territory data..." });

    // Clear existing territories and insert new ones
    await db.clearProjectTerritories(project.id);
    const territoryRecords = territoriesList.map((t: any) => ({
      projectId: project.id,
      type: t.type as "owned" | "unoccupied" | "contested" | "indefensible",
      title: t.title,
      description: t.description || null,
      evidence: t.evidence || null,
      competitors: t.competitors || [],
      strength: t.strength || 5,
      opportunity: t.opportunity || 5,
    }));

    await db.bulkInsertTerritories(territoryRecords);

    await db.updateAnalysisJob(jobId, {
      status: "completed",
      progress: 100,
      progressMessage: `Mapped ${territoryRecords.length} territories`,
    });
  } catch (error: any) {
    await db.updateAnalysisJob(jobId, { status: "failed", error: error.message });
    throw error;
  }
}

async function runBriefGeneration(project: any, jobId: number) {
  try {
    await db.updateAnalysisJob(jobId, { progress: 10, progressMessage: "Loading analysis data..." });

    const competitorsList = await db.getProjectCompetitors(project.id);
    const territoriesList = await db.getProjectTerritories(project.id);

    const competitorsData = JSON.stringify(competitorsList.map(c => ({
      name: c.name, description: c.description, threatScore: c.threatScore,
      strengths: c.strengths, weaknesses: c.weaknesses,
    })));
    const territoriesData = JSON.stringify(territoriesList.map(t => ({
      type: t.type, title: t.title, description: t.description,
    })));

    await db.updateAnalysisJob(jobId, { progress: 30, progressMessage: "Generating strategic brief..." });

    const briefData = await generateStrategicBrief(
      project.name,
      project.industry || "Technology",
      competitorsData,
      territoriesData
    );

    await db.updateAnalysisJob(jobId, { progress: 70, progressMessage: "Saving brief..." });

    await db.upsertBrief(project.id, {
      overallScore: Math.min(20, Math.max(1, briefData.overallScore || 10)),
      scoreExplanation: briefData.scoreExplanation || null,
      executiveSummary: briefData.executiveSummary || null,
      marketPosition: briefData.marketPosition || null,
      competitiveAdvantages: briefData.competitiveAdvantages || [],
      strategicRecommendations: briefData.strategicRecommendations || [],
      riskFactors: briefData.riskFactors || [],
      opportunities: briefData.opportunities || [],
    });

    await db.updateProject(project.id, project.userId, { step: "brief", status: "ready" });
    await db.updateAnalysisJob(jobId, {
      status: "completed",
      progress: 100,
      progressMessage: "Strategic brief generated",
    });
  } catch (error: any) {
    await db.updateAnalysisJob(jobId, { status: "failed", error: error.message });
    throw error;
  }
}

async function runFullAnalysis(project: any, jobId: number) {
  try {
    await db.updateProject(project.id, project.userId, { status: "analyzing" });

    // Step 1: Context extraction
    await db.updateAnalysisJob(jobId, { progress: 5, progressMessage: "Extracting company context..." });
    const context = await extractContext(project.url, project.name);
    await db.updateProject(project.id, project.userId, {
      contextSummary: context.description || context.valueProposition,
      industry: context.industry || project.industry,
    });

    // Step 2: Competitor discovery
    await db.updateAnalysisJob(jobId, { progress: 20, progressMessage: "Discovering competitors..." });
    const competitorsList = await discoverCompetitors(
      project.name,
      context.industry || project.industry || "Technology",
      context.description || project.description || "",
      project.region || "Global"
    );

    const competitorRecords = competitorsList.map((c: any) => ({
      projectId: project.id,
      name: (c.name || "").substring(0, 255),
      url: c.url ? (c.url + "").substring(0, 2048) : null,
      description: c.description ? (c.description + "").substring(0, 65535) : null,
      threatScore: Math.min(20, Math.max(1, c.threatScore || 10)),
      threatLevel: getThreatLevel(c.threatScore || 10),
      funding: c.funding ? (c.funding + "").substring(0, 255) : null,
      founded: c.founded ? (c.founded + "").substring(0, 50) : null,
      employees: c.employees ? (c.employees + "").substring(0, 100) : null,
      headquarters: c.headquarters ? (c.headquarters + "").substring(0, 255) : null,
      strengths: Array.isArray(c.strengths) ? c.strengths.map((s: any) => (s + "").substring(0, 500)) : [],
      weaknesses: Array.isArray(c.weaknesses) ? c.weaknesses.map((w: any) => (w + "").substring(0, 500)) : [],
      keyDifferentiators: Array.isArray(c.keyDifferentiators) ? c.keyDifferentiators.map((d: any) => (d + "").substring(0, 500)) : [],
      overlapAreas: Array.isArray(c.overlapAreas) ? c.overlapAreas.map((o: any) => (o + "").substring(0, 500)) : [],
      isManual: false,
    }));
    await db.bulkInsertCompetitors(competitorRecords);
    await db.updateProject(project.id, project.userId, { step: "discover" });

    // Step 3: Territory analysis
    await db.updateAnalysisJob(jobId, { progress: 45, progressMessage: "Mapping positioning territories..." });
    const competitorsData = JSON.stringify(competitorRecords.map((c: any) => ({
      name: c.name, description: c.description, threatScore: c.threatScore,
      strengths: c.strengths, overlapAreas: c.overlapAreas,
    })));
    const territoriesList = await analyzeTerritoriesAI(
      project.name,
      context.industry || project.industry || "Technology",
      competitorsData
    );
    await db.clearProjectTerritories(project.id);
    const territoryRecords = territoriesList.map((t: any) => ({
      projectId: project.id,
      type: t.type as "owned" | "unoccupied" | "contested" | "indefensible",
      title: t.title,
      description: t.description || null,
      evidence: t.evidence || null,
      competitors: t.competitors || [],
      strength: t.strength || 5,
      opportunity: t.opportunity || 5,
    }));
    await db.bulkInsertTerritories(territoryRecords);

    // Step 4: Strategic brief
    await db.updateAnalysisJob(jobId, { progress: 70, progressMessage: "Generating strategic brief..." });
    const territoriesData = JSON.stringify(territoryRecords.map((t: any) => ({
      type: t.type, title: t.title, description: t.description,
    })));
    const briefData = await generateStrategicBrief(
      project.name,
      context.industry || project.industry || "Technology",
      competitorsData,
      territoriesData
    );

    await db.upsertBrief(project.id, {
      overallScore: Math.min(20, Math.max(1, briefData.overallScore || 10)),
      scoreExplanation: briefData.scoreExplanation || null,
      executiveSummary: briefData.executiveSummary || null,
      marketPosition: briefData.marketPosition || null,
      competitiveAdvantages: briefData.competitiveAdvantages || [],
      strategicRecommendations: briefData.strategicRecommendations || [],
      riskFactors: briefData.riskFactors || [],
      opportunities: briefData.opportunities || [],
    });

    await db.updateProject(project.id, project.userId, { step: "brief", status: "ready" });
    await db.updateAnalysisJob(jobId, {
      status: "completed",
      progress: 100,
      progressMessage: "Full analysis complete",
    });
  } catch (error: any) {
    await db.updateAnalysisJob(jobId, { status: "failed", error: error.message });
    await db.updateProject(project.id, project.userId, { status: "error" });
    throw error;
  }
}

export type AppRouter = typeof appRouter;
