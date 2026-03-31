import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { PositioningService } from './positioning.service';
import { ScoringService } from './scoring.service';
import { BriefService } from './brief.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ProjectAccessGuard } from '../../common/guards/project-access.guard';
import { PrismaClient } from '@prisma/client';

@Controller('strategy')
export class StrategyController {
  constructor(
    private readonly positioningService: PositioningService,
    private readonly scoringService: ScoringService,
    private readonly briefService: BriefService,
    private readonly prisma: PrismaClient,
  ) {}

  @Get('positioning')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async getPositioning(@Param('projectId') projectId: string) {
    const positioning = await this.prisma.positioningStatement.findUnique({
      where: { projectId },
    });

    return {
      success: true,
      data: positioning,
    };
  }

  @Post('positioning/generate')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async generatePositioning(@Param('projectId') projectId: string) {
    const positioning = await this.positioningService.generatePositioning(projectId);

    return {
      success: true,
      data: {
        positioning,
        message: 'Positioning generated successfully',
      },
    };
  }

  @Get('score')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async getScore(@Param('projectId') projectId: string) {
    const scoreCard = await this.prisma.scoreCard.findUnique({
      where: { projectId },
    });

    return {
      success: true,
      data: scoreCard,
    };
  }

  @Post('score/generate')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async generateScore(@Param('projectId') projectId: string) {
    const score = await this.scoringService.generateScore(projectId);

    return {
      success: true,
      data: {
        score,
        message: 'Score generated successfully',
      },
    };
  }

  @Get('brief')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async getBrief(@Param('projectId') projectId: string) {
    const brief = await this.prisma.strategicBrief.findUnique({
      where: { projectId },
    });

    return {
      success: true,
      data: brief,
    };
  }

  @Post('brief/generate')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async generateBrief(@Param('projectId') projectId: string) {
    const brief = await this.briefService.generateStrategicBrief(projectId);

    return {
      success: true,
      data: {
        brief,
        message: 'Strategic brief generated successfully',
      },
    };
  }

  @Get('summary')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async getStrategySummary(@Param('projectId') projectId: string) {
    const [positioning, scoreCard, brief] = await Promise.all([
      this.prisma.positioningStatement.findUnique({ where: { projectId } }),
      this.prisma.scoreCard.findUnique({ where: { projectId } }),
      this.prisma.strategicBrief.findUnique({ where: { projectId } }),
    ]);

    return {
      success: true,
      data: {
        positioning,
        scoreCard,
        brief,
      },
    };
  }
}
