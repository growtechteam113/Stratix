import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AdminAnalyticsService {
  private readonly logger = new Logger(AdminAnalyticsService.name);

  constructor(private readonly prisma: PrismaClient) {}

  async getSystemHealth() {
    try {
      const [
        totalUsers,
        activeProjects,
        totalSources,
        publishedReports,
        suspendedUsers,
        failedLogins,
      ] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.project.count({ where: { status: 'ACTIVE' } }),
        this.prisma.source.count(),
        this.prisma.publicReport.count({ where: { isPublished: true } }),
        this.prisma.user.count({ where: { isSuspended: true } }),
        this.prisma.loginEvent.count({ where: { status: 'FAILED' } }),
      ]);

      const recentSignups = await this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      });

      return {
        totalUsers,
        activeProjects,
        totalSources,
        publishedReports,
        suspendedUsers,
        failedLogins,
        recentSignups,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to get system health: ${error}`);
      throw error;
    }
  }

  async getUsersList(limit: number = 20, offset: number = 0) {
    try {
      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          select: {
            id: true,
            email: true,
            name: true,
            globalRole: true,
            isSuspended: true,
            suspendedAt: true,
            createdAt: true,
            _count: {
              select: {
                projects: true,
                loginEvents: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        this.prisma.user.count(),
      ]);

      return {
        users,
        total,
        limit,
        offset,
      };
    } catch (error) {
      this.logger.error(`Failed to get users list: ${error}`);
      throw error;
    }
  }

  async getLoginHistory(limit: number = 50, offset: number = 0) {
    try {
      const [events, total] = await Promise.all([
        this.prisma.loginEvent.findMany({
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        this.prisma.loginEvent.count(),
      ]);

      return {
        events,
        total,
        limit,
        offset,
      };
    } catch (error) {
      this.logger.error(`Failed to get login history: ${error}`);
      throw error;
    }
  }

  async getUserActivityHistory(limit: number = 50, offset: number = 0) {
    try {
      const [events, total] = await Promise.all([
        this.prisma.userActivityEvent.findMany({
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        this.prisma.userActivityEvent.count(),
      ]);

      return {
        events,
        total,
        limit,
        offset,
      };
    } catch (error) {
      this.logger.error(`Failed to get user activity history: ${error}`);
      throw error;
    }
  }

  async getAuditLogs(limit: number = 50, offset: number = 0) {
    try {
      const [logs, total] = await Promise.all([
        this.prisma.auditLog.findMany({
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        this.prisma.auditLog.count(),
      ]);

      return {
        logs,
        total,
        limit,
        offset,
      };
    } catch (error) {
      this.logger.error(`Failed to get audit logs: ${error}`);
      throw error;
    }
  }

  async getRateLimitEvents(limit: number = 50, offset: number = 0) {
    try {
      const [events, total] = await Promise.all([
        this.prisma.rateLimitEvent.findMany({
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        this.prisma.rateLimitEvent.count(),
      ]);

      return {
        events,
        total,
        limit,
        offset,
      };
    } catch (error) {
      this.logger.error(`Failed to get rate limit events: ${error}`);
      throw error;
    }
  }
}
