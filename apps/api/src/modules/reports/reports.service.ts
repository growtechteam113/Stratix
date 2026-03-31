import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private readonly prisma: PrismaClient) {}

  async createOrUpdatePublicReport(projectId: string, title: string, description?: string) {
    try {
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        throw new Error('Project not found');
      }

      const slug = uuidv4();

      let report = await this.prisma.publicReport.findFirst({
        where: { projectId },
      });

      if (report) {
        report = await this.prisma.publicReport.update({
          where: { id: report.id },
          data: { title, description, slug },
        });
      } else {
        report = await this.prisma.publicReport.create({
          data: {
            projectId,
            title,
            description,
            slug,
            isPublished: false,
          },
        });
      }

      return report;
    } catch (error) {
      this.logger.error(`Failed to create/update public report: ${error}`);
      throw error;
    }
  }

  async publishReport(reportId: string) {
    try {
      const report = await this.prisma.publicReport.update({
        where: { id: reportId },
        data: { isPublished: true },
      });

      return report;
    } catch (error) {
      this.logger.error(`Failed to publish report: ${error}`);
      throw error;
    }
  }

  async unpublishReport(reportId: string) {
    try {
      const report = await this.prisma.publicReport.update({
        where: { id: reportId },
        data: { isPublished: false },
      });

      return report;
    } catch (error) {
      this.logger.error(`Failed to unpublish report: ${error}`);
      throw error;
    }
  }

  async getPublicReport(slug: string) {
    try {
      const report = await this.prisma.publicReport.findUnique({
        where: { slug },
        include: { project: true },
      });

      return report;
    } catch (error) {
      this.logger.error(`Failed to get public report: ${error}`);
      throw error;
    }
  }

  async getProjectReports(projectId: string) {
    try {
      const reports = await this.prisma.publicReport.findMany({
        where: { projectId },
      });

      return reports;
    } catch (error) {
      this.logger.error(`Failed to get project reports: ${error}`);
      throw error;
    }
  }
}
