import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { PrismaClient } from '@prisma/client';

@Module({
  providers: [EventsService, PrismaClient],
  exports: [EventsService],
})
export class EventsModule {}
