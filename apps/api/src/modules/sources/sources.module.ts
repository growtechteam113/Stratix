import { Module } from '@nestjs/common';
import { SourcesService } from './sources.service';
import { SourcesController } from './sources.controller';
import { PrismaClient } from '@prisma/client';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule],
  controllers: [SourcesController],
  providers: [SourcesService, PrismaClient],
  exports: [SourcesService],
})
export class SourcesModule {}
