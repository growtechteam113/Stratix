import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { MarketService } from './market.service';
import { CategoryClusteringService } from './category-clustering.service';
import { OpportunityDetectionService } from './opportunity-detection.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ProjectAccessGuard } from '../../common/guards/project-access.guard';

@Controller('projects/:projectId/market')
export class MarketController {
  constructor(
    private readonly marketService: MarketService,
    private readonly clusteringService: CategoryClusteringService,
    private readonly opportunityService: OpportunityDetectionService,
  ) {}

  @Get('category-map')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async getCategoryMap(@Param('projectId') projectId: string) {
    const cluster = await this.marketService.getCategoryCluster(projectId);

    return {
      success: true,
      data: cluster,
    };
  }

  @Post('category-map/generate')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async generateCategoryMap(@Param('projectId') projectId: string) {
    const segments = await this.clusteringService.generateCategoryMap(projectId);

    return {
      success: true,
      data: {
        segments,
        message: 'Category map generated successfully',
      },
    };
  }

  @Get('opportunities')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async getOpportunities(@Param('projectId') projectId: string) {
    const zone = await this.marketService.getOpportunityZone(projectId);

    return {
      success: true,
      data: zone,
    };
  }

  @Post('opportunities/detect')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async detectOpportunities(@Param('projectId') projectId: string) {
    const opportunities = await this.opportunityService.detectOpportunities(projectId);

    return {
      success: true,
      data: {
        opportunities,
        message: 'Opportunities detected successfully',
      },
    };
  }

  @Get('analysis')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async getMarketAnalysis(@Param('projectId') projectId: string) {
    const analysis = await this.marketService.getMarketAnalysis(projectId);

    return {
      success: true,
      data: analysis,
    };
  }

  @Delete('category-map')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async deleteCategoryMap(@Param('projectId') projectId: string) {
    await this.marketService.deleteCategoryCluster(projectId);

    return {
      success: true,
      data: { message: 'Category map deleted' },
    };
  }

  @Delete('opportunities')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async deleteOpportunities(@Param('projectId') projectId: string) {
    await this.marketService.deleteOpportunityZone(projectId);

    return {
      success: true,
      data: { message: 'Opportunities deleted' },
    };
  }
}
