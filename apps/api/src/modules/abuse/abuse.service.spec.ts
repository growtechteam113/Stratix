import { Test, TestingModule } from '@nestjs/testing';
import { AbuseService } from './abuse.service';
import { PrismaClient } from '@prisma/client';

describe('AbuseService', () => {
  let service: AbuseService;
  let prisma: PrismaClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AbuseService,
        {
          provide: PrismaClient,
          useValue: {
            abuseEvent: {
              create: jest.fn(),
              count: jest.fn(),
              findMany: jest.fn(),
            },
            user: {
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AbuseService>(AbuseService);
    prisma = module.get<PrismaClient>(PrismaClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('logAbuseEvent', () => {
    it('should create an abuse event', async () => {
      const mockEvent = {
        id: '1',
        userId: 'user1',
        ipAddress: '127.0.0.1',
        eventType: 'RATE_LIMIT_EXCEEDED',
        details: {},
        createdAt: new Date(),
      };

      jest.spyOn(prisma.abuseEvent, 'create').mockResolvedValue(mockEvent as any);
      jest.spyOn(prisma.abuseEvent, 'count').mockResolvedValue(5);

      const result = await service.logAbuseEvent(
        'RATE_LIMIT_EXCEEDED',
        'user1',
        '127.0.0.1',
      );

      expect(result).toEqual(mockEvent);
      expect(prisma.abuseEvent.create).toHaveBeenCalled();
    });
  });

  describe('checkAndSuspendIfNeeded', () => {
    it('should auto-suspend user if abuse events exceed threshold', async () => {
      jest.spyOn(prisma.abuseEvent, 'count').mockResolvedValue(11);
      jest.spyOn(prisma.user, 'update').mockResolvedValue({} as any);

      await service.checkAndSuspendIfNeeded('user1');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: expect.objectContaining({
          isSuspended: true,
        }),
      });
    });
  });
});
