import { Controller, Get, Post, Put, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ProjectAccessGuard } from '../../common/guards/project-access.guard';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('published')
  async listPublishedReports(
    @Query('limit') limit: string = '10',
    @Query('offset') offset: string = '0',
  ) {
    // Return empty list for now - can be implemented later
    return {
      success: true,
      data: {
        reports: [],
        total: 0,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    };
  }

  @Get('public/:slug')
  async getPublicReport(@Param('slug') slug: string) {
    const report = await this.reportsService.getPublicReport(slug);

    return {
      success: true,
      data: report,
    };
  }

  @Post('projects/:projectId/create')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async createReport(
    @Param('projectId') projectId: string,
    @Body() body: { title: string; description?: string },
  ) {
    const report = await this.reportsService.createOrUpdatePublicReport(
      projectId,
      body.title,
      body.description,
    );

    return {
      success: true,
      data: report,
    };
  }

  @Put('projects/:projectId/publish')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async publishReport(@Param('projectId') projectId: string) {
    // Get the report first
    const reports = await this.reportsService.getProjectReports(projectId);
    if (reports.length === 0) {
      throw new Error('No report found for this project');
    }

    const report = await this.reportsService.publishReport(reports[0].id);

    return {
      success: true,
      data: report,
      message: 'Report published successfully',
    };
  }

  @Put('projects/:projectId/unpublish')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async unpublishReport(@Param('projectId') projectId: string) {
    // Get the report first
    const reports = await this.reportsService.getProjectReports(projectId);
    if (reports.length === 0) {
      throw new Error('No report found for this project');
    }

    const report = await this.reportsService.unpublishReport(reports[0].id);

    return {
      success: true,
      data: report,
      message: 'Report unpublished successfully',
    };
  }

  @Get('projects/:projectId')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async getProjectReports(@Param('projectId') projectId: string) {
    const reports = await this.reportsService.getProjectReports(projectId);

    return {
      success: true,
      data: reports,
    };
  }
}
