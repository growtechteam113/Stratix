import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class MarketService {
  private readonly logger = new Logger(MarketService.name);

  constructor(private readonly prisma: PrismaClient) {}

  async getCategoryCluster(projectId: string) {
    const cluster = await this.prisma.categoryCluster.findUnique({
      where: { projectId },
    });

    if (!cluster) {
      return null;
    }

    return {
      id: cluster.id,
      projectId: cluster.projectId,
      segments: cluster.clusterData,
      generatedAt: cluster.generatedAt,
    };
  }

  async getOpportunityZone(projectId: string) {
    const zone = await this.prisma.opportunityZone.findUnique({
      where: { projectId },
    });

    if (!zone) {
      return null;
    }

    return {
      id: zone.id,
      projectId: zone.projectId,
      opportunities: zone.opportunityData,
      generatedAt: zone.generatedAt,
    };
  }

  async getMarketAnalysis(projectId: string) {
    const [cluster, zone] = await Promise.all([
      this.getCategoryCluster(projectId),
      this.getOpportunityZone(projectId),
    ]);

    return {
      categoryCluster: cluster,
      opportunityZone: zone,
    };
  }

  async deleteCategoryCluster(projectId: string) {
    await this.prisma.categoryCluster.delete({
      where: { projectId },
    });

    this.logger.log(`Deleted category cluster for project ${projectId}`);
  }

  async deleteOpportunityZone(projectId: string) {
    await this.prisma.opportunityZone.delete({
      where: { projectId },
    });

    this.logger.log(`Deleted opportunity zone for project ${projectId}`);
  }
}
