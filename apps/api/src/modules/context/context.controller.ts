import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ContextService } from './context.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ProjectAccessGuard } from '../../common/guards/project-access.guard';
import { Context } from './context.schema';

@Controller('projects/:projectId/context')
export class ContextController {
  constructor(private readonly contextService: ContextService) {}

  @Get('latest')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async getLatestContext(@Param('projectId') projectId: string) {
    const context = await this.contextService.getLatestContext(projectId);

    if (!context) {
      return {
        success: true,
        data: null,
      };
    }

    return {
      success: true,
      data: {
        versionNumber: context.versionNumber,
        status: context.status,
        context: context.contextData,
        generatedAt: context.generatedAt,
      },
    };
  }

  @Get('versions')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async getAllVersions(@Param('projectId') projectId: string) {
    const versions = await this.contextService.getAllVersions(projectId);

    return {
      success: true,
      data: versions.map((v) => ({
        versionNumber: v.versionNumber,
        status: v.status,
        generatedAt: v.generatedAt,
      })),
    };
  }

  @Get('version/:versionNumber')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async getContextVersion(
    @Param('projectId') projectId: string,
    @Param('versionNumber') versionNumber: string,
  ) {
    const context = await this.contextService.getContextVersion(
      projectId,
      parseInt(versionNumber),
    );

    return {
      success: true,
      data: {
        versionNumber: context.versionNumber,
        status: context.status,
        context: context.contextData,
        generatedAt: context.generatedAt,
      },
    };
  }

  @Post('generate')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async generateContext(
    @Param('projectId') projectId: string,
    @Body() body: { sourceText: string },
  ) {
    if (!body.sourceText || body.sourceText.trim().length === 0) {
      throw new BadRequestException('sourceText is required');
    }

    const newVersion = await this.contextService.generateAndSaveContext(
      projectId,
      body.sourceText,
    );

    return {
      success: true,
      data: {
        versionNumber: newVersion.versionNumber,
        status: newVersion.status,
        message: 'Context generated successfully',
      },
    };
  }

  @Put('version/:versionNumber/publish')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async publishVersion(
    @Param('projectId') projectId: string,
    @Param('versionNumber') versionNumber: string,
  ) {
    const updated = await this.contextService.publishVersion(
      projectId,
      parseInt(versionNumber),
    );

    return {
      success: true,
      data: {
        versionNumber: updated.versionNumber,
        status: updated.status,
        message: 'Context version published',
      },
    };
  }

  @Put('update')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async updateContext(
    @Param('projectId') projectId: string,
    @Body() body: Partial<Context>,
  ) {
    const newVersion = await this.contextService.updateContextManually(
      projectId,
      body,
    );

    return {
      success: true,
      data: {
        versionNumber: newVersion.versionNumber,
        status: newVersion.status,
        message: 'Context updated successfully',
      },
    };
  }
}
