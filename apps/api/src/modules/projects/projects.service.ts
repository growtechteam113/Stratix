import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { EventsService } from '../events/events.service';
import { slugify } from '../../common/utils/slugify';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly eventsService: EventsService,
  ) {}

  async createProject(
    workspaceId: string,
    userId: string,
    name: string,
    description?: string,
  ) {
    const slug = slugify(name);

    // Check if slug already exists in this workspace
    const existing = await this.prisma.project.findUnique({
      where: {
        workspaceId_slug: {
          workspaceId,
          slug,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Project with this name already exists');
    }

    const project = await this.prisma.project.create({
      data: {
        workspaceId,
        userId,
        name,
        slug,
        description,
        status: 'ACTIVE',
      },
    });

    // Log activity
    await this.eventsService.recordActivityEvent(
      userId,
      'project_created',
      'project',
      workspaceId,
      { projectId: project.id, projectName: name },
    );

    return project;
  }

  async getProject(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
        sources: {
          select: {
            id: true,
            type: true,
            title: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async listProjects(workspaceId: string, skip: number = 0, take: number = 20) {
    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where: {
          workspaceId,
          status: 'ACTIVE',
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { email: true, name: true },
          },
          sources: {
            select: { id: true },
          },
        },
      }),
      this.prisma.project.count({
        where: {
          workspaceId,
          status: 'ACTIVE',
        },
      }),
    ]);

    return {
      projects: projects.map((p) => ({
        ...p,
        sourceCount: p.sources.length,
        sources: undefined,
      })),
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
    };
  }

  async updateProject(
    projectId: string,
    userId: string,
    updates: { name?: string; description?: string },
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Only the creator can update
    if (project.userId !== userId) {
      throw new BadRequestException('Only the project creator can update it');
    }

    const updated = await this.prisma.project.update({
      where: { id: projectId },
      data: updates,
    });

    // Log activity
    await this.eventsService.recordActivityEvent(
      userId,
      'project_updated',
      'project',
      project.workspaceId,
      { projectId, updates },
    );

    return updated;
  }

  async deleteProject(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Only the creator can delete
    if (project.userId !== userId) {
      throw new BadRequestException('Only the project creator can delete it');
    }

    // Soft delete by archiving
    await this.prisma.project.update({
      where: { id: projectId },
      data: { status: 'ARCHIVED' },
    });

    // Log activity
    await this.eventsService.recordActivityEvent(
      userId,
      'project_deleted',
      'project',
      project.workspaceId,
      { projectId },
    );

    return { message: 'Project deleted successfully' };
  }
}
