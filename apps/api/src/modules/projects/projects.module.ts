import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController, ProjectDetailController } from './projects.controller';
import { PrismaClient } from '@prisma/client';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule],
  controllers: [ProjectsController, ProjectDetailController],
  providers: [ProjectsService, PrismaClient],
  exports: [ProjectsService],
})
export class ProjectsModule {}
