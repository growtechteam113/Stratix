import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaClient) {}

  async bootstrap(email: string, password: string, name?: string) {
    // Check if any users exist
    const userCount = await this.prisma.user.count();

    if (userCount > 0) {
      throw new BadRequestException(
        'Bootstrap is only available when no users exist',
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create superadmin user
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        globalRole: 'SUPERADMIN',
      },
    });

    // Create default workspace
    const workspace = await this.prisma.workspace.create({
      data: {
        name: `${name || email}'s Workspace`,
        slug: `workspace-${randomBytes(4).toString('hex')}`,
      },
    });

    // Assign user to workspace as OWNER
    await this.prisma.workspaceUser.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        role: 'OWNER',
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        globalRole: user.globalRole,
      },
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
      },
      message: 'Superadmin user created successfully',
    };
  }

  async listUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        globalRole: true,
        createdAt: true,
      },
    });
  }

  async suspendUser(userId: string, reason?: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        isSuspended: true,
        suspendedAt: new Date(),
        suspendedReason: reason,
      },
    });

    // Log the action
    await this.prisma.auditLog.create({
      data: {
        userId: 'system', // In real implementation, get from request context
        action: 'USER_SUSPENDED',
        resource: 'user',
        changes: { suspendedReason: reason },
      },
    });

    return user;
  }

  async restoreUser(userId: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        isSuspended: false,
        suspendedAt: null,
        suspendedReason: null,
      },
    });

    // Log the action
    await this.prisma.auditLog.create({
      data: {
        userId: 'system',
        action: 'USER_RESTORED',
        resource: 'user',
      },
    });

    return user;
  }
}
