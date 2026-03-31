import { Test, TestingModule } from '@nestjs/testing';
import { MarketService } from './market.service';
import { PrismaClient } from '@prisma/client';

describe('MarketService', () => {
  let service: MarketService;
  let prisma: PrismaClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketService,
        {
          provide: PrismaClient,
          useValue: {
            categoryCluster: {
              findUnique: jest.fn(),
              upsert: jest.fn(),
              delete: jest.fn(),
            },
            opportunityZone: {
              findUnique: jest.fn(),
              upsert: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<MarketService>(MarketService);
    prisma = module.get<PrismaClient>(PrismaClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCategoryCluster', () => {
    it('should retrieve category cluster', async () => {
      const mockCluster = {
        id: 'cluster-1',
        projectId: 'proj-1',
        clusterData: { segments: [] },
        generatedAt: new Date(),
      };

      (prisma.categoryCluster.findUnique as jest.Mock).mockResolvedValue(mockCluster);

      const result = await service.getCategoryCluster('proj-1');

      expect(result).toBeDefined();
      expect(result?.projectId).toBe('proj-1');
    });

    it('should return null if cluster not found', async () => {
      (prisma.categoryCluster.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.getCategoryCluster('proj-1');

      expect(result).toBeNull();
    });
  });

  describe('getOpportunityZone', () => {
    it('should retrieve opportunity zone', async () => {
      const mockZone = {
        id: 'zone-1',
        projectId: 'proj-1',
        opportunityData: { whitespace: [] },
        generatedAt: new Date(),
      };

      (prisma.opportunityZone.findUnique as jest.Mock).mockResolvedValue(mockZone);

      const result = await service.getOpportunityZone('proj-1');

      expect(result).toBeDefined();
      expect(result?.projectId).toBe('proj-1');
    });
  });

  describe('getMarketAnalysis', () => {
    it('should retrieve both cluster and zone', async () => {
      const mockCluster = {
        id: 'cluster-1',
        projectId: 'proj-1',
        clusterData: { segments: [] },
        generatedAt: new Date(),
      };

      const mockZone = {
        id: 'zone-1',
        projectId: 'proj-1',
        opportunityData: { whitespace: [] },
        generatedAt: new Date(),
      };

      (prisma.categoryCluster.findUnique as jest.Mock).mockResolvedValue(mockCluster);
      (prisma.opportunityZone.findUnique as jest.Mock).mockResolvedValue(mockZone);

      const result = await service.getMarketAnalysis('proj-1');

      expect(result.categoryCluster).toBeDefined();
      expect(result.opportunityZone).toBeDefined();
    });
  });
});
