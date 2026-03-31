import { Module } from '@nestjs/common';
import { CompetitorsService } from './competitors.service';
import { CompetitorsController } from './competitors.controller';
import { CompetitorDiscoveryService } from './competitor-discovery.service';
import { CompetitorAnalysisService } from './competitor-analysis.service';
import { PrismaClient } from '@prisma/client';
import { ContextModule } from '../context/context.module';

@Module({
  imports: [ContextModule],
  controllers: [CompetitorsController],
  providers: [
    CompetitorsService,
    CompetitorDiscoveryService,
    CompetitorAnalysisService,
    PrismaClient,
  ],
  exports: [CompetitorsService],
})
export class CompetitorsModule {}
