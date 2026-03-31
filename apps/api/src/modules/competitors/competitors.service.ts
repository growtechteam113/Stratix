import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class CompetitorsService {
  private readonly logger = new Logger(CompetitorsService.name);

  constructor(private readonly prisma: PrismaClient) {}

  async getCompetitorsByProject(projectId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [competitors, total] = await Promise.all([
      this.prisma.competitor.findMany({
        where: { projectId },
        include: { insight: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.competitor.count({ where: { projectId } }),
    ]);

    return {
      competitors,
      total,
      page,
      pageSize: limit,
    };
  }

  async getCompetitorDetail(competitorId: string) {
    const competitor = await this.prisma.competitor.findUnique({
      where: { id: competitorId },
      include: {
        sources: true,
        insight: true,
      },
    });

    if (!competitor) {
      throw new NotFoundException('Competitor not found');
    }

    return competitor;
  }

  async deleteCompetitor(competitorId: string) {
    const competitor = await this.prisma.competitor.findUnique({
      where: { id: competitorId },
    });

    if (!competitor) {
      throw new NotFoundException('Competitor not found');
    }

    await this.prisma.competitor.delete({
      where: { id: competitorId },
    });

    this.logger.log(`Deleted competitor ${competitorId}`);

    return { success: true, message: 'Competitor deleted' };
  }

  async addSourceToCompetitor(
    competitorId: string,
    sourceUrl?: string,
    extractedText?: string,
  ) {
    const competitor = await this.prisma.competitor.findUnique({
      where: { id: competitorId },
    });

    if (!competitor) {
      throw new NotFoundException('Competitor not found');
    }

    const source = await this.prisma.competitorSource.create({
      data: {
        competitorId,
        sourceUrl,
        extractedText,
      },
    });

    return source;
  }

  async getCompetitorSources(competitorId: string) {
    const sources = await this.prisma.competitorSource.findMany({
      where: { competitorId },
    });

    return sources;
  }
}
