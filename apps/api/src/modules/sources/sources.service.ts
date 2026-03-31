import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaClient, SourceType, SourceStatus } from '@prisma/client';
import { EventsService } from '../events/events.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SourcesService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor(
    private readonly prisma: PrismaClient,
    private readonly eventsService: EventsService,
  ) {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async addUrlSource(
    projectId: string,
    userId: string,
    url: string,
    title?: string,
  ) {
    // Validate URL format
    try {
      new URL(url);
    } catch {
      throw new BadRequestException('Invalid URL format');
    }

    // Check if project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const source = await this.prisma.source.create({
      data: {
        projectId,
        type: SourceType.URL,
        title: title || url,
        sourceUrl: url,
        status: SourceStatus.PENDING,
      },
    });

    // Log activity
    await this.eventsService.recordActivityEvent(
      userId,
      'source_added',
      'source',
      project.workspaceId,
      { projectId, sourceId: source.id, sourceUrl: url },
    );

    return source;
  }

  async uploadFile(
    projectId: string,
    userId: string,
    file: any,
    title?: string,
  ) {
    // Validate file type
    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/html',
    ];

    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Allowed: PDF, DOCX, TXT, HTML',
      );
    }

    // Check if project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Generate unique file key
    const fileKey = `${projectId}/${Date.now()}-${file.originalname}`;
    const filePath = path.join(this.uploadDir, fileKey);

    // Create directory if it doesn't exist
    const fileDir = path.dirname(filePath);
    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }

    // Save file to disk
    fs.writeFileSync(filePath, file.buffer);

    const source = await this.prisma.source.create({
      data: {
        projectId,
        type: SourceType.FILE,
        title: title || file.originalname,
        fileKey,
        mimeType: file.mimetype,
        metadata: JSON.parse(JSON.stringify({
          originalName: file.originalname,
          size: file.size,
          uploadedAt: new Date().toISOString(),
        })),
        status: SourceStatus.PENDING,
      },
    });

    // Log activity
    await this.eventsService.recordActivityEvent(
      userId,
      'file_uploaded',
      'source',
      project.workspaceId,
      { projectId, sourceId: source.id, fileName: file.originalname },
    );

    return source;
  }

  async listSources(projectId: string, skip: number = 0, take: number = 20) {
    const [sources, total] = await Promise.all([
      this.prisma.source.findMany({
        where: { projectId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.source.count({ where: { projectId } }),
    ]);

    return {
      sources,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
    };
  }

  async getSource(sourceId: string) {
    const source = await this.prisma.source.findUnique({
      where: { id: sourceId },
      include: {
        chunks: {
          select: { id: true, content: true, order: true },
        },
      },
    });

    if (!source) {
      throw new NotFoundException('Source not found');
    }

    return source;
  }

  async deleteSource(sourceId: string, userId: string) {
    const source = await this.prisma.source.findUnique({
      where: { id: sourceId },
      include: { project: true },
    });

    if (!source) {
      throw new NotFoundException('Source not found');
    }

    // Delete associated file if it exists
    if (source.type === SourceType.FILE && source.fileKey) {
      const filePath = path.join(this.uploadDir, source.fileKey);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete source and associated chunks
    await this.prisma.source.delete({
      where: { id: sourceId },
    });

    // Log activity
    await this.eventsService.recordActivityEvent(
      userId,
      'source_deleted',
      'source',
      source.project.workspaceId,
      { projectId: source.projectId, sourceId },
    );

    return { message: 'Source deleted successfully' };
  }

  async updateSourceStatus(
    sourceId: string,
    status: SourceStatus,
    metadata?: any,
  ) {
    const existingSource = await this.prisma.source.findUnique({
      where: { id: sourceId },
    });

    const updated = await this.prisma.source.update({
      where: { id: sourceId },
      data: {
        status,
        metadata: metadata ? JSON.parse(JSON.stringify({ ...(existingSource?.metadata as any || {}), ...metadata })) : undefined,
      },
    });

    return updated;
  }
}
