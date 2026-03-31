import { Module } from '@nestjs/common';
import { MarketService } from './market.service';
import { MarketController } from './market.controller';
import { CategoryClusteringService } from './category-clustering.service';
import { OpportunityDetectionService } from './opportunity-detection.service';
import { PrismaClient } from '@prisma/client';
import { ContextModule } from '../context/context.module';

@Module({
  imports: [ContextModule],
  controllers: [MarketController],
  providers: [
    MarketService,
    CategoryClusteringService,
    OpportunityDetectionService,
    PrismaClient,
  ],
  exports: [MarketService],
})
export class MarketModule {}
