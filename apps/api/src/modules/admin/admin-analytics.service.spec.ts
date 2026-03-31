import { Test, TestingModule } from '@nestjs/testing';
import { AdminAnalyticsService } from './admin-analytics.service';
import { PrismaClient } from '@prisma/client';

describe('AdminAnalyticsService', () => {
  let service: AdminAnalyticsService;
  let prisma: PrismaClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminAnalyticsService,
        {
          provide: PrismaClient,
          useValue: {
            user: {
              count: jest.fn(),
              findMany: jest.fn(),
            },
            project: {
              count: jest.fn(),
            },
            source: {
              count: jest.fn(),
            },
            publicReport: {
              count: jest.fn(),
            },
            loginEvent: {
              count: jest.fn(),
              findMany: jest.fn(),
            },
            userActivityEvent: {
              count: jest.fn(),
              findMany: jest.fn(),
            },
            auditLog: {
              count: jest.fn(),
              findMany: jest.fn(),
            },
            rateLimitEvent: {
              count: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AdminAnalyticsService>(AdminAnalyticsService);
    prisma = module.get<PrismaClient>(PrismaClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSystemHealth', () => {
    it('should return system health metrics', async () => {
      const mockCounts = {
        totalUsers: 100,
        activeProjects: 50,
        totalSources: 500,
        publishedReports: 25,
        suspendedUsers: 5,
        failedLogins: 10,
        recentSignups: 8,
      };

      jest.spyOn(prisma.user, 'count').mockResolvedValue(mockCounts.totalUsers);
      jest.spyOn(prisma.project, 'count').mockResolvedValue(mockCounts.activeProjects);
      jest.spyOn(prisma.source, 'count').mockResolvedValue(mockCounts.totalSources);
      jest.spyOn(prisma.publicReport, 'count').mockResolvedValue(mockCounts.publishedReports);
      jest.spyOn(prisma.loginEvent, 'count').mockResolvedValue(mockCounts.failedLogins);

      const result = await service.getSystemHealth();

      expect(result).toHaveProperty('totalUsers');
      expect(result).toHaveProperty('activeProjects');
      expect(result).toHaveProperty('timestamp');
    });
  });

  describe('getUsersList', () => {
    it('should return paginated users list', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'user@example.com',
          name: 'Test User',
          globalRole: 'USER',
          isSuspended: false,
          suspendedAt: null,
          createdAt: new Date(),
          _count: { projects: 5, loginEvents: 10 },
        },
      ];

      jest.spyOn(prisma.user, 'findMany').mockResolvedValue(mockUsers as any);
      jest.spyOn(prisma.user, 'count').mockResolvedValue(1);

      const result = await service.getUsersList(20, 0);

      expect(result).toHaveProperty('users');
      expect(result).toHaveProperty('total');
      expect(result.users.length).toBe(1);
    });
  });

  describe('getLoginHistory', () => {
    it('should return paginated login history', async () => {
      const mockEvents = [
        {
          id: '1',
          userId: 'user1',
          status: 'SUCCESS',
          createdAt: new Date(),
          user: { id: 'user1', email: 'user@example.com', name: 'Test User' },
        },
      ];

      jest.spyOn(prisma.loginEvent, 'findMany').mockResolvedValue(mockEvents as any);
      jest.spyOn(prisma.loginEvent, 'count').mockResolvedValue(1);

      const result = await service.getLoginHistory(50, 0);

      expect(result).toHaveProperty('events');
      expect(result).toHaveProperty('total');
      expect(result.events.length).toBe(1);
    });
  });
});
