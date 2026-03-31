import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AbuseService {
  private readonly logger = new Logger(AbuseService.name);

  constructor(private readonly prisma: PrismaClient) {}

  async logAbuseEvent(
    eventType: string,
    userId?: string,
    ipAddress?: string,
    details?: Record<string, any>,
  ) {
    try {
      const event = await this.prisma.abuseEvent.create({
        data: {
          eventType,
          userId,
          ipAddress,
          details,
        },
      });

      this.logger.warn(`Abuse event logged: ${eventType}`, {
        userId,
        ipAddress,
        details,
      });

      // Check if we should auto-suspend the user
      if (userId) {
        await this.checkAndSuspendIfNeeded(userId);
      }

      return event;
    } catch (error) {
      this.logger.error(`Failed to log abuse event: ${error}`);
      throw error;
    }
  }

  async checkAndSuspendIfNeeded(userId: string) {
    // Count abuse events in the last 24 hours
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const abuseCount = await this.prisma.abuseEvent.count({
      where: {
        userId,
        createdAt: { gte: last24Hours },
      },
    });

    // Auto-suspend if more than 10 abuse events in 24 hours
    if (abuseCount > 10) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          isSuspended: true,
          suspendedAt: new Date(),
          suspendedReason: 'Auto-suspended due to excessive abuse events',
        },
      });

      this.logger.error(`User ${userId} auto-suspended due to abuse events`);
    }
  }

  async getAbuseHistory(userId: string, limit: number = 50) {
    return this.prisma.abuseEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getRecentAbuseEvents(hours: number = 24, limit: number = 100) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    return this.prisma.abuseEvent.findMany({
      where: {
        createdAt: { gte: since },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }
}
