import { Module } from '@nestjs/common';
import { StrategyController } from './strategy.controller';
import { PositioningService } from './positioning.service';
import { ScoringService } from './scoring.service';
import { BriefService } from './brief.service';
import { PrismaClient } from '@prisma/client';
import { ContextModule } from '../context/context.module';
import { MarketModule } from '../market/market.module';

@Module({
  imports: [ContextModule, MarketModule],
  controllers: [StrategyController],
  providers: [
    PositioningService,
    ScoringService,
    BriefService,
    PrismaClient,
  ],
  exports: [PositioningService, ScoringService, BriefService],
})
export class StrategyModule {}
