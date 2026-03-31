import { Module } from '@nestjs/common';
import { ContextService } from './context.service';
import { ContextController } from './context.controller';
import { ContextGenerationService } from './context-generation.service';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [ContextController],
  providers: [ContextService, ContextGenerationService, PrismaClient],
  exports: [ContextService],
})
export class ContextModule {}
