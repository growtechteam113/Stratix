import { Test, TestingModule } from '@nestjs/testing';
import { CompetitorDiscoveryService } from './competitor-discovery.service';
import { ContextService } from '../context/context.service';
import { PrismaClient } from '@prisma/client';

describe('CompetitorDiscoveryService', () => {
  let service: CompetitorDiscoveryService;
  let contextService: ContextService;
  let prisma: PrismaClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompetitorDiscoveryService,
        {
          provide: ContextService,
          useValue: {
            getLatestContext: jest.fn(),
          },
        },
        {
          provide: PrismaClient,
          useValue: {
            competitor: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CompetitorDiscoveryService>(CompetitorDiscoveryService);
    contextService = module.get<ContextService>(ContextService);
    prisma = module.get<PrismaClient>(PrismaClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addCompetitor', () => {
    it('should add a new competitor', async () => {
      const mockCompetitor = {
        id: 'comp-1',
        projectId: 'proj-1',
        name: 'Salesforce',
        website: 'https://salesforce.com',
        status: 'DISCOVERED',
      };

      (prisma.competitor.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.competitor.create as jest.Mock).mockResolvedValue(mockCompetitor);

      const result = await service.addCompetitor(
        'proj-1',
        'Salesforce',
        'https://salesforce.com',
      );

      expect(result).toEqual(mockCompetitor);
      expect(prisma.competitor.create).toHaveBeenCalledWith({
        data: {
          projectId: 'proj-1',
          name: 'Salesforce',
          website: 'https://salesforce.com',
          status: 'DISCOVERED',
        },
      });
    });

    it('should throw error if competitor already exists', async () => {
      (prisma.competitor.findUnique as jest.Mock).mockResolvedValue({
        id: 'comp-1',
      });

      await expect(
        service.addCompetitor('proj-1', 'Salesforce'),
      ).rejects.toThrow('Competitor already exists');
    });
  });

  describe('addDiscoveredCompetitors', () => {
    it('should add multiple competitors', async () => {
      const mockCompetitor = {
        id: 'comp-1',
        projectId: 'proj-1',
        name: 'Salesforce',
        status: 'DISCOVERED',
      };

      (prisma.competitor.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.competitor.create as jest.Mock).mockResolvedValue(mockCompetitor);

      const result = await service.addDiscoveredCompetitors('proj-1', [
        'Salesforce',
        'HubSpot',
      ]);

      expect(result.length).toBeGreaterThan(0);
    });
  });
});
