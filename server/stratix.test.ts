import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the AI service to avoid real LLM calls in tests
vi.mock("./ai-service", () => ({
  extractContext: vi.fn().mockResolvedValue({
    companyName: "TestCo",
    industry: "Technology",
    description: "A test company that does things",
    targetMarket: "Developers",
    valueProposition: "Makes testing easier",
    keyProducts: ["Product A"],
    businessModel: "SaaS",
    estimatedSize: "startup",
    keyTerms: ["testing"],
  }),
  discoverCompetitors: vi.fn().mockResolvedValue([
    {
      name: "Competitor A",
      url: "https://competitor-a.com",
      description: "A competitor",
      threatScore: 15,
      funding: "Series B - $30M",
      founded: "2020",
      employees: "50-200",
      headquarters: "San Francisco, US",
      strengths: ["Strong brand"],
      weaknesses: ["Limited features"],
      keyDifferentiators: ["AI-first"],
      overlapAreas: ["Testing"],
    },
  ]),
  analyzeTerritoriesAI: vi.fn().mockResolvedValue([
    {
      type: "owned",
      title: "Developer Testing",
      description: "Strong position in developer testing tools",
      evidence: "Market leader in this segment",
      competitors: ["Competitor A"],
      strength: 8,
      opportunity: 6,
    },
  ]),
  generateStrategicBrief: vi.fn().mockResolvedValue({
    overallScore: 14,
    scoreExplanation: "Strong position with room for growth",
    executiveSummary: "TestCo has a solid market position",
    marketPosition: "Well-positioned in the developer tools space",
    competitiveAdvantages: ["Strong brand", "Developer community"],
    strategicRecommendations: [{ title: "Expand", description: "Expand to enterprise", priority: "high" }],
    riskFactors: [{ title: "Competition", description: "Increasing competition", severity: "medium" }],
    opportunities: [{ title: "Enterprise", description: "Enterprise market", impact: "significant" }],
  }),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId = 1): { ctx: TrpcContext; clearedCookies: any[] } {
  const clearedCookies: any[] = [];
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  const ctx: TrpcContext = {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };
  return { ctx, clearedCookies };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("STRATIX AI - Projects", () => {
  it("creates a project successfully", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.projects.create({
      name: "Test Company",
      url: "https://testcompany.com",
      region: "Global",
    });

    expect(result).toBeDefined();
    expect(result.name).toBe("Test Company");
    expect(result.url).toBe("https://testcompany.com");
    expect(result.status).toBe("draft");
    expect(result.step).toBe("define");
  });

  it("lists projects for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const projects = await caller.projects.list();
    expect(Array.isArray(projects)).toBe(true);
  });

  it("gets a project by id", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a project first
    const created = await caller.projects.create({
      name: "Get Test",
      url: "https://gettest.com",
    });

    if (created.id) {
      const project = await caller.projects.get({ id: created.id });
      expect(project).toBeDefined();
      expect(project.name).toBe("Get Test");
    }
  });

  it("updates a project", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const created = await caller.projects.create({
      name: "Update Test",
      url: "https://updatetest.com",
    });

    if (created.id) {
      const result = await caller.projects.update({
        id: created.id,
        name: "Updated Name",
        region: "North America",
      });
      expect(result.success).toBe(true);

      const updated = await caller.projects.get({ id: created.id });
      expect(updated.name).toBe("Updated Name");
      expect(updated.region).toBe("North America");
    }
  });

  it("deletes a project", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const created = await caller.projects.create({
      name: "Delete Test",
      url: "https://deletetest.com",
    });

    if (created.id) {
      const result = await caller.projects.delete({ id: created.id });
      expect(result.success).toBe(true);

      await expect(caller.projects.get({ id: created.id })).rejects.toThrow();
    }
  });
});

describe("STRATIX AI - Competitors", () => {
  it("adds a manual competitor", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const project = await caller.projects.create({
      name: "Comp Test",
      url: "https://comptest.com",
    });

    if (project.id) {
      const comp = await caller.competitors.add({
        projectId: project.id,
        name: "Manual Competitor",
        url: "https://manual-comp.com",
        description: "A manually added competitor",
      });

      expect(comp).toBeDefined();
      expect(comp.name).toBe("Manual Competitor");

      const list = await caller.competitors.list({ projectId: project.id });
      expect(list.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("removes a competitor", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const project = await caller.projects.create({
      name: "Remove Comp Test",
      url: "https://removecomp.com",
    });

    if (project.id) {
      const comp = await caller.competitors.add({
        projectId: project.id,
        name: "To Remove",
      });

      if (comp.id) {
        const result = await caller.competitors.remove({ id: comp.id, projectId: project.id });
        expect(result.success).toBe(true);
      }
    }
  });
});

describe("STRATIX AI - Analysis", () => {
  it("triggers competitor discovery", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const project = await caller.projects.create({
      name: "Analysis Test",
      url: "https://analysistest.com",
    });

    if (project.id) {
      const result = await caller.analysis.discoverCompetitors({ projectId: project.id });
      expect(result).toBeDefined();
      expect(result.jobId).toBeDefined();
    }
  });

  it("triggers full analysis", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const project = await caller.projects.create({
      name: "Full Analysis Test",
      url: "https://fullanalysis.com",
    });

    if (project.id) {
      const result = await caller.analysis.runFull({ projectId: project.id });
      expect(result).toBeDefined();
      expect(result.jobId).toBeDefined();
    }
  });

  it("lists analysis jobs", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const project = await caller.projects.create({
      name: "Jobs Test",
      url: "https://jobstest.com",
    });

    if (project.id) {
      const jobs = await caller.analysis.jobs({ projectId: project.id });
      expect(Array.isArray(jobs)).toBe(true);
    }
  });
});

describe("STRATIX AI - Brief", () => {
  it("returns null for project without brief", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const project = await caller.projects.create({
      name: "No Brief Test",
      url: "https://nobrief.com",
    });

    if (project.id) {
      const brief = await caller.brief.get({ projectId: project.id });
      expect(brief).toBeNull();
    }
  });

  it("public report returns error for non-existent slug", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.brief.getPublic({ slug: "nonexistent" })).rejects.toThrow();
  });
});

describe("STRATIX AI - Auth", () => {
  it("returns user for authenticated context", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const me = await caller.auth.me();
    expect(me).toBeDefined();
    expect(me?.name).toBe("Test User 1");
  });

  it("returns null for unauthenticated context", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const me = await caller.auth.me();
    expect(me).toBeNull();
  });
});
