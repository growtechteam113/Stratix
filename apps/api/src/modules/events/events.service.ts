import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaClient) {}

  async recordLoginEvent(
    userId: string | null,
    emailAttempted: string,
    ipAddress: string | null,
    userAgent: string | null,
    status: 'SUCCESS' | 'FAILED',
  ) {
    return this.prisma.loginEvent.create({
      data: {
        userId,
        emailAttempted,
        ipAddress,
        userAgent,
        status,
      },
    });
  }

  async recordActivityEvent(
    userId: string,
    action: string,
    resource: string,
    workspaceId?: string,
    metadata?: any,
  ) {
    return this.prisma.userActivityEvent.create({
      data: {
        userId,
        workspaceId,
        action,
        resource,
        metadata,
      },
    });
  }

  async getLoginHistory(userId: string, limit: number = 20) {
    return this.prisma.loginEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getActivityHistory(userId: string, workspaceId?: string, limit: number = 50) {
    return this.prisma.userActivityEvent.findMany({
      where: {
        userId,
        ...(workspaceId && { workspaceId }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
