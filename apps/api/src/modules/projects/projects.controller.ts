import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceMemberGuard } from '../../common/guards/workspace-member.guard';
import { ProjectAccessGuard } from '../../common/guards/project-access.guard';

@Controller('workspaces/:workspaceId/projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, WorkspaceMemberGuard)
  async createProject(
    @Param('workspaceId') workspaceId: string,
    @Request() req: any,
    @Body() body: { name: string; description?: string },
  ) {
    const project = await this.projectsService.createProject(
      workspaceId,
      req.user.sub,
      body.name,
      body.description,
    );

    return {
      success: true,
      data: project,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, WorkspaceMemberGuard)
  async listProjects(
    @Param('workspaceId') workspaceId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const result = await this.projectsService.listProjects(
      workspaceId,
      skip,
      parseInt(limit),
    );

    return {
      success: true,
      data: result,
    };
  }
}

@Controller('projects')
export class ProjectDetailController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get(':projectId')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async getProject(@Param('projectId') projectId: string) {
    const project = await this.projectsService.getProject(projectId);

    return {
      success: true,
      data: project,
    };
  }

  @Patch(':projectId')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async updateProject(
    @Param('projectId') projectId: string,
    @Request() req: any,
    @Body() body: { name?: string; description?: string },
  ) {
    const project = await this.projectsService.updateProject(
      projectId,
      req.user.sub,
      body,
    );

    return {
      success: true,
      data: project,
    };
  }

  @Delete(':projectId')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async deleteProject(
    @Param('projectId') projectId: string,
    @Request() req: any,
  ) {
    const result = await this.projectsService.deleteProject(
      projectId,
      req.user.sub,
    );

    return {
      success: true,
      data: result,
    };
  }
}
