import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CompetitorsService } from './competitors.service';
import { CompetitorDiscoveryService } from './competitor-discovery.service';
import { CompetitorAnalysisService } from './competitor-analysis.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ProjectAccessGuard } from '../../common/guards/project-access.guard';

@Controller('projects/:projectId/competitors')
export class CompetitorsController {
  constructor(
    private readonly competitorsService: CompetitorsService,
    private readonly discoveryService: CompetitorDiscoveryService,
    private readonly analysisService: CompetitorAnalysisService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async getCompetitors(
    @Param('projectId') projectId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.competitorsService.getCompetitorsByProject(
      projectId,
      parseInt(page || '1'),
      parseInt(limit || '20'),
    );

    return {
      success: true,
      data: result,
    };
  }

  @Get(':competitorId')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async getCompetitorDetail(@Param('competitorId') competitorId: string) {
    const competitor = await this.competitorsService.getCompetitorDetail(competitorId);

    return {
      success: true,
      data: competitor,
    };
  }

  @Post('discover')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async discoverCompetitors(@Param('projectId') projectId: string) {
    const discovered = await this.discoveryService.discoverCompetitors(projectId);
    const added = await this.discoveryService.addDiscoveredCompetitors(
      projectId,
      discovered,
    );

    return {
      success: true,
      data: {
        discovered: discovered.length,
        added: added.length,
        competitors: added,
      },
    };
  }

  @Post('add')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async addCompetitor(
    @Param('projectId') projectId: string,
    @Body() body: { name: string; website?: string },
  ) {
    const competitor = await this.discoveryService.addCompetitor(
      projectId,
      body.name,
      body.website,
    );

    return {
      success: true,
      data: competitor,
    };
  }

  @Post(':competitorId/analyze')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async analyzeCompetitor(@Param('competitorId') competitorId: string) {
    const insight = await this.analysisService.analyzeCompetitor(competitorId);

    return {
      success: true,
      data: {
        insight,
        message: 'Competitor analyzed successfully',
      },
    };
  }

  @Delete(':competitorId')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async deleteCompetitor(@Param('competitorId') competitorId: string) {
    const result = await this.competitorsService.deleteCompetitor(competitorId);

    return {
      success: true,
      data: result,
    };
  }

  @Get(':competitorId/sources')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async getCompetitorSources(@Param('competitorId') competitorId: string) {
    const sources = await this.competitorsService.getCompetitorSources(competitorId);

    return {
      success: true,
      data: { sources },
    };
  }
}
