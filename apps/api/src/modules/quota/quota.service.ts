import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class QuotaService {

  constructor(private readonly prisma: PrismaClient) {}

  async getOrCreateQuota(userId: string) {
    let quota = await this.prisma.userQuota.findUnique({
      where: { userId },
    });

    if (!quota) {
      quota = await this.prisma.userQuota.create({
        data: {
          userId,
          analysesLimit: 50,
          activeJobsLimit: 5,
        },
      });
    }

    return quota;
  }

  async checkAnalysisQuota(userId: string) {
    const quota = await this.getOrCreateQuota(userId);

    // Reset daily quota if needed
    const now = new Date();
    const lastReset = new Date(quota.lastResetAt);
    if (now.getDate() !== lastReset.getDate()) {
      await this.prisma.userQuota.update({
        where: { userId },
        data: {
          analysesUsed: 0,
          lastResetAt: now,
        },
      });
      quota.analysesUsed = 0;
    }

    if (quota.analysesUsed >= quota.analysesLimit) {
      throw new BadRequestException(
        `Daily analysis limit (${quota.analysesLimit}) exceeded. Please try again tomorrow.`,
      );
    }

    return quota;
  }

  async incrementAnalysisUsage(userId: string) {
    await this.checkAnalysisQuota(userId);

    return this.prisma.userQuota.update({
      where: { userId },
      data: {
        analysesUsed: {
          increment: 1,
        },
      },
    });
  }

  async checkActiveJobsQuota(userId: string) {
    const quota = await this.getOrCreateQuota(userId);

    if (quota.activeJobsCount >= quota.activeJobsLimit) {
      throw new BadRequestException(
        `Active job limit (${quota.activeJobsLimit}) exceeded. Please wait for existing jobs to complete.`,
      );
    }

    return quota;
  }

  async incrementActiveJobs(userId: string) {
    await this.checkActiveJobsQuota(userId);

    return this.prisma.userQuota.update({
      where: { userId },
      data: {
        activeJobsCount: {
          increment: 1,
        },
      },
    });
  }

  async decrementActiveJobs(userId: string) {
    return this.prisma.userQuota.update({
      where: { userId },
      data: {
        activeJobsCount: {
          decrement: 1,
        },
      },
    });
  }

  async resetDailyQuota(userId: string) {
    return this.prisma.userQuota.update({
      where: { userId },
      data: {
        analysesUsed: 0,
        lastResetAt: new Date(),
      },
    });
  }
}
