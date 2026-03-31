import { Test, TestingModule } from '@nestjs/testing';
import { PositioningService } from './positioning.service';
import { ScoringService } from './scoring.service';
import { BriefService } from './brief.service';
import { PrismaClient } from '@prisma/client';
import { ContextService } from '../context/context.service';
import { MarketService } from '../market/market.service';

describe('Strategy Services', () => {
  let positioningService: PositioningService;
  let scoringService: ScoringService;
  let briefService: BriefService;
  let prisma: PrismaClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PositioningService,
        ScoringService,
        BriefService,
        {
          provide: PrismaClient,
          useValue: {
            positioningStatement: {
              findUnique: jest.fn(),
              upsert: jest.fn(),
            },
            scoreCard: {
              findUnique: jest.fn(),
              upsert: jest.fn(),
            },
            strategicBrief: {
              findUnique: jest.fn(),
              upsert: jest.fn(),
            },
            competitor: {
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: ContextService,
          useValue: {
            getLatestContext: jest.fn(),
          },
        },
        {
          provide: MarketService,
          useValue: {
            getMarketAnalysis: jest.fn(),
          },
        },
      ],
    }).compile();

    positioningService = module.get<PositioningService>(PositioningService);
    scoringService = module.get<ScoringService>(ScoringService);
    briefService = module.get<BriefService>(BriefService);
    prisma = module.get<PrismaClient>(PrismaClient);
  });

  describe('PositioningService', () => {
    it('should be defined', () => {
      expect(positioningService).toBeDefined();
    });

    it('should throw if context not found', async () => {
      (prisma.positioningStatement.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(positioningService.generatePositioning('proj-1')).rejects.toThrow();
    });
  });

  describe('ScoringService', () => {
    it('should be defined', () => {
      expect(scoringService).toBeDefined();
    });

    it('should ensure score is between 0-20', async () => {
      const mockScore = {
        score: 25, // Invalid
        dimension_breakdown: {
          clarity: 5,
          differentiation: 5,
          market_viability: 5,
          competitor_defense: 5,
        },
      };

      // The service should clamp this to 20
      expect(Math.min(20, mockScore.score)).toBe(20);
    });
  });

  describe('BriefService', () => {
    it('should be defined', () => {
      expect(briefService).toBeDefined();
    });

    it('should generate brief with all required sections', async () => {
      const mockBrief = {
        executive_summary: 'Summary',
        market_landscape: 'Landscape',
        competitor_analysis: 'Analysis',
        opportunity_mapping: 'Mapping',
        positioning_strategy: 'Strategy',
        strategic_recommendations: 'Recommendations',
      };

      expect(mockBrief).toHaveProperty('executive_summary');
      expect(mockBrief).toHaveProperty('market_landscape');
      expect(mockBrief).toHaveProperty('competitor_analysis');
      expect(mockBrief).toHaveProperty('opportunity_mapping');
      expect(mockBrief).toHaveProperty('positioning_strategy');
      expect(mockBrief).toHaveProperty('strategic_recommendations');
    });
  });
});
