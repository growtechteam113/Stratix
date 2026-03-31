import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { IngestionService } from './ingestion.service';
import { IngestionController } from './ingestion.controller';
import { CrawlerService } from './crawler.service';
import { ParserService } from './parser.service';
import { ChunkingService } from './chunking.service';
import { EmbeddingsService } from './embeddings.service';
import { PrismaClient } from '@prisma/client';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    BullModule.registerQueue({
      name: 'ingestion',
    }),
  ],
  controllers: [IngestionController],
  providers: [
    IngestionService,
    CrawlerService,
    ParserService,
    ChunkingService,
    EmbeddingsService,
    PrismaClient,
  ],
  exports: [IngestionService],
})
export class IngestionModule {}
