import { Test, TestingModule } from '@nestjs/testing';
import { QuotaService } from './quota.service';
import { BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

describe('QuotaService', () => {
  let service: QuotaService;
  let prisma: PrismaClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuotaService,
        {
          provide: PrismaClient,
          useValue: {
            userQuota: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<QuotaService>(QuotaService);
    prisma = module.get<PrismaClient>(PrismaClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkAnalysisQuota', () => {
    it('should throw error if daily limit exceeded', async () => {
      const mockQuota = {
        id: '1',
        userId: 'user1',
        analysesUsed: 50,
        analysesLimit: 50,
        activeJobsCount: 0,
        activeJobsLimit: 5,
        lastResetAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.userQuota, 'findUnique').mockResolvedValue(mockQuota);

      await expect(service.checkAnalysisQuota('user1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should allow analysis if within quota', async () => {
      const mockQuota = {
        id: '1',
        userId: 'user1',
        analysesUsed: 10,
        analysesLimit: 50,
        activeJobsCount: 0,
        activeJobsLimit: 5,
        lastResetAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.userQuota, 'findUnique').mockResolvedValue(mockQuota);

      const result = await service.checkAnalysisQuota('user1');
      expect(result).toEqual(mockQuota);
    });
  });

  describe('checkActiveJobsQuota', () => {
    it('should throw error if active job limit exceeded', async () => {
      const mockQuota = {
        id: '1',
        userId: 'user1',
        analysesUsed: 0,
        analysesLimit: 50,
        activeJobsCount: 5,
        activeJobsLimit: 5,
        lastResetAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.userQuota, 'findUnique').mockResolvedValue(mockQuota);

      await expect(service.checkActiveJobsQuota('user1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
