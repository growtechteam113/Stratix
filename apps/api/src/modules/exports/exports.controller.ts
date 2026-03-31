import { Controller, Get, Param, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { ExportsService } from './exports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ProjectAccessGuard } from '../../common/guards/project-access.guard';
import { PrismaClient } from '@prisma/client';

@Controller('exports')
export class ExportsController {
  constructor(
    private readonly exportsService: ExportsService,
    private readonly prisma: PrismaClient,
  ) {}

  @Get('projects/:projectId/full')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async exportProjectFull(
    @Param('projectId') projectId: string,
    @Res() res: Response,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { slug: true },
    });

    const data = await this.exportsService.exportProjectAsJSON(projectId);
    const fileName = this.exportsService.generateJSONFileName(project!.slug, 'full-export');

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(JSON.stringify(data, null, 2));
  }

  @Get('projects/:projectId/context')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async exportContext(
    @Param('projectId') projectId: string,
    @Res() res: Response,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { slug: true },
    });

    const data = await this.exportsService.exportContextAsJSON(projectId);
    const fileName = this.exportsService.generateJSONFileName(project!.slug, 'context');

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(JSON.stringify(data, null, 2));
  }

  @Get('projects/:projectId/brief')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async exportBrief(
    @Param('projectId') projectId: string,
    @Res() res: Response,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { slug: true },
    });

    const data = await this.exportsService.exportStrategicBriefAsJSON(projectId);
    const fileName = this.exportsService.generateJSONFileName(project!.slug, 'brief');

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(JSON.stringify(data, null, 2));
  }
}
