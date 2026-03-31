import { Test, TestingModule } from '@nestjs/testing';
import { ContextService } from './context.service';
import { ContextGenerationService } from './context-generation.service';
import { PrismaClient } from '@prisma/client';

describe('ContextService', () => {
  let service: ContextService;
  let generationService: ContextGenerationService;
  let prisma: PrismaClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContextService,
        {
          provide: ContextGenerationService,
          useValue: {
            generateContext: jest.fn(),
          },
        },
        {
          provide: PrismaClient,
          useValue: {
            contextFile: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            contextVersion: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ContextService>(ContextService);
    generationService = module.get<ContextGenerationService>(ContextGenerationService);
    prisma = module.get<PrismaClient>(PrismaClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOrCreateContextFile', () => {
    it('should return existing context file', async () => {
      const mockContextFile = { id: 'ctx-1', projectId: 'proj-1' };
      (prisma.contextFile.findUnique as jest.Mock).mockResolvedValue(mockContextFile);

      const result = await service.getOrCreateContextFile('proj-1');

      expect(result).toEqual(mockContextFile);
      expect(prisma.contextFile.findUnique).toHaveBeenCalledWith({
        where: { projectId: 'proj-1' },
      });
    });

    it('should create new context file if not exists', async () => {
      const mockContextFile = { id: 'ctx-1', projectId: 'proj-1' };
      (prisma.contextFile.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.contextFile.create as jest.Mock).mockResolvedValue(mockContextFile);

      const result = await service.getOrCreateContextFile('proj-1');

      expect(result).toEqual(mockContextFile);
      expect(prisma.contextFile.create).toHaveBeenCalledWith({
        data: { projectId: 'proj-1' },
      });
    });
  });

  describe('getLatestContext', () => {
    it('should return latest context version', async () => {
      const mockContextFile = {
        id: 'ctx-1',
        versions: [{ versionNumber: 1, status: 'PUBLISHED' }],
      };
      (prisma.contextFile.findUnique as jest.Mock).mockResolvedValue(mockContextFile);

      const result = await service.getLatestContext('proj-1');

      expect(result).toEqual(mockContextFile.versions[0]);
    });

    it('should return null if no context exists', async () => {
      (prisma.contextFile.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.getLatestContext('proj-1');

      expect(result).toBeNull();
    });
  });

  describe('generateAndSaveContext', () => {
    it('should generate and save new context version', async () => {
      const mockContext = {
        company_overview: 'Test company',
        product_summary: 'Test product',
        ideal_customer_profile: 'Test ICP',
        pain_points: ['Pain 1'],
        jobs_to_be_done: ['Job 1'],
        value_propositions: ['Value 1'],
        messaging_pillars: ['Pillar 1'],
        tone_of_voice: 'Professional',
        features: ['Feature 1'],
        use_cases: ['Use case 1'],
        proof_points: ['Proof 1'],
        market_category: 'SaaS',
        competitors: ['Competitor 1'],
        positioning_signals: ['Signal 1'],
        confidence_notes: 'High confidence',
      };

      (generationService.generateContext as jest.Mock).mockResolvedValue(mockContext);
      (prisma.contextFile.findUnique as jest.Mock).mockResolvedValue({
        id: 'ctx-1',
      });
      (prisma.contextVersion.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.contextVersion.create as jest.Mock).mockResolvedValue({
        id: 'cv-1',
        versionNumber: 1,
        contextData: mockContext,
      });

      const result = await service.generateAndSaveContext('proj-1', 'source text');

      expect(result.versionNumber).toBe(1);
      expect(generationService.generateContext).toHaveBeenCalledWith('proj-1', 'source text');
    });
  });
});
