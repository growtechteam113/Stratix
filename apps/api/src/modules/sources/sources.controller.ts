import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SourcesService } from './sources.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ProjectAccessGuard } from '../../common/guards/project-access.guard';

@Controller('projects/:projectId/sources')
export class SourcesController {
  constructor(private readonly sourcesService: SourcesService) {}

  @Post('url')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async addUrlSource(
    @Param('projectId') projectId: string,
    @Request() req: any,
    @Body() body: { url: string; title?: string },
  ) {
    const source = await this.sourcesService.addUrlSource(
      projectId,
      req.user.sub,
      body.url,
      body.title,
    );

    return {
      success: true,
      data: source,
    };
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('projectId') projectId: string,
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const source = await this.sourcesService.uploadFile(
      projectId,
      req.user.sub,
      file,
    );

    return {
      success: true,
      data: source,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async listSources(
    @Param('projectId') projectId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const result = await this.sourcesService.listSources(
      projectId,
      skip,
      parseInt(limit),
    );

    return {
      success: true,
      data: result,
    };
  }

  @Get(':sourceId')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async getSourceDetail(@Param('sourceId') sourceId: string) {
    const source = await this.sourcesService.getSource(sourceId);

    return {
      success: true,
      data: source,
    };
  }

  @Delete(':sourceId')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async deleteSourceById(
    @Param('sourceId') sourceId: string,
    @Request() req: any,
  ) {
    const result = await this.sourcesService.deleteSource(
      sourceId,
      req.user.sub,
    );

    return {
      success: true,
      data: result,
    };
  }
}
