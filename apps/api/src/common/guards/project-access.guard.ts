import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ProjectAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaClient) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.sub;
    const projectId = request.params.projectId;

    if (!userId || !projectId) {
      throw new ForbiddenException('User or project not found');
    }

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { workspace: true },
    });

    if (!project) {
      throw new ForbiddenException('Project not found');
    }

    // Check if user is a member of the project's workspace
    const membership = await this.prisma.workspaceUser.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: project.workspaceId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You do not have access to this project');
    }

    // Attach project and workspace info to request
    request.project = project;
    request.workspace = { id: project.workspaceId };
    request.userRole = membership.role;

    return true;
  }
}
