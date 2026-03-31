import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaClient, ContextVersionStatus } from '@prisma/client';
import { Context } from './context.schema';
import { ContextGenerationService } from './context-generation.service';

@Injectable()
export class ContextService {
  private readonly logger = new Logger(ContextService.name);

  constructor(
    private readonly prisma: PrismaClient,
    private readonly generationService: ContextGenerationService,
  ) {}

  async getOrCreateContextFile(projectId: string) {
    let contextFile = await this.prisma.contextFile.findUnique({
      where: { projectId },
    });

    if (!contextFile) {
      contextFile = await this.prisma.contextFile.create({
        data: { projectId },
      });
    }

    return contextFile;
  }

  async getLatestContext(projectId: string) {
    const contextFile = await this.prisma.contextFile.findUnique({
      where: { projectId },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
        },
      },
    });

    if (!contextFile || contextFile.versions.length === 0) {
      return null;
    }

    return contextFile.versions[0];
  }

  async getAllVersions(projectId: string) {
    const contextFile = await this.prisma.contextFile.findUnique({
      where: { projectId },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
        },
      },
    });

    return contextFile?.versions || [];
  }

  async getContextVersion(projectId: string, versionNumber: number) {
    const contextFile = await this.prisma.contextFile.findUnique({
      where: { projectId },
    });

    if (!contextFile) {
      throw new NotFoundException('Context file not found');
    }

    const version = await this.prisma.contextVersion.findUnique({
      where: {
        contextFileId_versionNumber: {
          contextFileId: contextFile.id,
          versionNumber,
        },
      },
    });

    if (!version) {
      throw new NotFoundException(`Context version ${versionNumber} not found`);
    }

    return version;
  }

  async generateAndSaveContext(projectId: string, sourceText: string) {
    // Check if context already exists
    const existingContext = await this.getLatestContext(projectId);
    if (existingContext && existingContext.status === ContextVersionStatus.PUBLISHED) {
      this.logger.warn(
        `Context already exists for project ${projectId}. Creating draft version.`,
      );
    }

    // Generate context using OpenAI
    const generatedContext = await this.generationService.generateContext(
      sourceText,
    );

    // Get or create context file
    const contextFile = await this.getOrCreateContextFile(projectId);

    // Determine next version number
    const lastVersion = await this.prisma.contextVersion.findFirst({
      where: { contextFileId: contextFile.id },
      orderBy: { versionNumber: 'desc' },
    });

    const nextVersionNumber = (lastVersion?.versionNumber || 0) + 1;

    // Save new version
    const newVersion = await this.prisma.contextVersion.create({
      data: {
        contextFileId: contextFile.id,
        versionNumber: nextVersionNumber,
        contextData: generatedContext,
        status: ContextVersionStatus.DRAFT,
      },
    });

    this.logger.log(
      `Created context version ${nextVersionNumber} for project ${projectId}`,
    );

    return newVersion;
  }

  async publishVersion(projectId: string, versionNumber: number) {
    const contextFile = await this.prisma.contextFile.findUnique({
      where: { projectId },
    });

    if (!contextFile) {
      throw new NotFoundException('Context file not found');
    }

    // Unpublish any previously published version
    await this.prisma.contextVersion.updateMany({
      where: {
        contextFileId: contextFile.id,
        status: ContextVersionStatus.PUBLISHED,
      },
      data: { status: ContextVersionStatus.ARCHIVED },
    });

    // Publish the requested version
    const updated = await this.prisma.contextVersion.update({
      where: {
        contextFileId_versionNumber: {
          contextFileId: contextFile.id,
          versionNumber,
        },
      },
      data: { status: ContextVersionStatus.PUBLISHED },
    });

    this.logger.log(
      `Published context version ${versionNumber} for project ${projectId}`,
    );

    return updated;
  }

  async updateContextManually(
    projectId: string,
    contextData: Partial<Context>,
  ) {
    const contextFile = await this.getOrCreateContextFile(projectId);
    const latestVersion = await this.getLatestContext(projectId);

    // Merge with existing context if available
    let mergedContext: Context;
    if (latestVersion) {
      mergedContext = { ...latestVersion.contextData as Context, ...contextData };
    } else {
      mergedContext = contextData as Context;
    }

    // Determine next version number
    const nextVersionNumber = (latestVersion?.versionNumber || 0) + 1;

    // Create new version with manual updates
    const newVersion = await this.prisma.contextVersion.create({
      data: {
        contextFileId: contextFile.id,
        versionNumber: nextVersionNumber,
        contextData: mergedContext,
        status: ContextVersionStatus.DRAFT,
      },
    });

    this.logger.log(
      `Created manual context version ${nextVersionNumber} for project ${projectId}`,
    );

    return newVersion;
  }
}
