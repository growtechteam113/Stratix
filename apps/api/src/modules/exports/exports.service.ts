import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ExportsService {
  private readonly logger = new Logger(ExportsService.name);

  constructor(private readonly prisma: PrismaClient) {}

  async exportProjectAsJSON(projectId: string) {
    try {
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        include: {
          context: {
            include: {
              versions: {
                where: { status: 'PUBLISHED' },
                take: 1,
                orderBy: { versionNumber: 'desc' },
              },
            },
          },
          competitors: {
            include: {
              insight: true,
            },
          },
          categoryCluster: true,
          opportunityZone: true,
          positioning: true,
          scoreCard: true,
          strategicBrief: true,
        },
      });

      if (!project) {
        throw new BadRequestException('Project not found');
      }

      const exportData = {
        project: {
          id: project.id,
          name: project.name,
          slug: project.slug,
          description: project.description,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        },
        context: project.context?.versions?.[0]?.contextData || null,
        competitors: project.competitors.map((c) => ({
          name: c.name,
          website: c.website,
          insight: c.insight?.insightData || null,
        })),
        market: {
          categoryCluster: project.categoryCluster?.clusterData || null,
          opportunityZone: project.opportunityZone?.opportunityData || null,
        },
        strategy: {
          positioning: project.positioning?.statementData || null,
          scoreCard: project.scoreCard?.scoreData || null,
          strategicBrief: project.strategicBrief?.briefData || null,
        },
      };

      this.logger.log(`Exported project ${projectId} as JSON`);
      return exportData;
    } catch (error) {
      this.logger.error(`Failed to export project: ${error}`);
      throw error;
    }
  }

  async exportContextAsJSON(projectId: string) {
    try {
      const context = await this.prisma.contextFile.findUnique({
        where: { projectId },
        include: {
          versions: {
            where: { status: 'PUBLISHED' },
            take: 1,
            orderBy: { versionNumber: 'desc' },
          },
        },
      });

      if (!context || !context.versions?.[0]) {
        throw new BadRequestException('No published context found');
      }

      const exportData = {
        projectId,
        versionNumber: context.versions[0].versionNumber,
        context: context.versions[0].contextData,
        generatedAt: context.versions[0].generatedAt,
      };

      this.logger.log(`Exported context for project ${projectId}`);
      return exportData;
    } catch (error) {
      this.logger.error(`Failed to export context: ${error}`);
      throw error;
    }
  }

  async exportStrategicBriefAsJSON(projectId: string) {
    try {
      const brief = await this.prisma.strategicBrief.findUnique({
        where: { projectId },
      });

      if (!brief) {
        throw new BadRequestException('No strategic brief found');
      }

      const exportData = {
        projectId,
        brief: brief.briefData,
        generatedAt: brief.generatedAt,
      };

      this.logger.log(`Exported strategic brief for project ${projectId}`);
      return exportData;
    } catch (error) {
      this.logger.error(`Failed to export strategic brief: ${error}`);
      throw error;
    }
  }

  generateJSONFileName(projectSlug: string, type: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    return `${projectSlug}-${type}-${timestamp}.json`;
  }
}
