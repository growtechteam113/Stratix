import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaClient, SourceStatus } from '@prisma/client';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    private readonly prisma: PrismaClient,
    @InjectQueue('ingestion') private readonly ingestionQueue: Queue,
  ) {}

  async startIngestion(sourceId: string): Promise<void> {
    // Fetch source
    const source = await this.prisma.source.findUnique({
      where: { id: sourceId },
      include: { project: true },
    });

    if (!source) {
      throw new BadRequestException('Source not found');
    }

    if (source.status !== SourceStatus.PENDING) {
      throw new BadRequestException(
        `Source is already being processed or completed`,
      );
    }

    try {
      // Enqueue ingestion job
      const job = await this.ingestionQueue.add(
        {
          sourceId,
          projectId: source.projectId,
          type: source.type,
          url: source.sourceUrl,
          fileKey: source.fileKey,
          mimeType: source.mimeType,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: false,
        },
      );

      // Create job progress record
      await this.prisma.jobProgress.create({
        data: {
          sourceId,
          jobId: job.id.toString(),
        },
      });

      this.logger.log(`Ingestion job enqueued for source ${sourceId}`);
    } catch (error) {
      this.logger.error(`Failed to enqueue ingestion job: ${error}`);
      throw error;
    }
  }

  async getIngestionProgress(sourceId: string): Promise<any> {
    const jobProgress = await this.prisma.jobProgress.findFirst({
      where: { sourceId },
      orderBy: { createdAt: 'desc' },
    });

    if (!jobProgress) {
      return null;
    }

    return {
      status: jobProgress.status,
      progress: jobProgress.progress,
      totalChunks: jobProgress.totalChunks,
      processedChunks: jobProgress.processedChunks,
      errorMessage: jobProgress.errorMessage,
    };
  }

  async updateJobProgress(
    sourceId: string,
    progress: number,
    totalChunks?: number,
    processedChunks?: number,
  ): Promise<void> {
    await this.prisma.jobProgress.updateMany({
      where: { sourceId },
      data: {
        progress,
        totalChunks: totalChunks ?? undefined,
        processedChunks: processedChunks ?? undefined,
      },
    });
  }

  async markJobFailed(sourceId: string, errorMessage: string): Promise<void> {
    await this.prisma.jobProgress.updateMany({
      where: { sourceId },
      data: {
        status: 'FAILED',
        errorMessage,
      },
    });
  }
}
