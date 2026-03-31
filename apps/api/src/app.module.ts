import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { EventsModule } from './modules/events/events.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { SourcesModule } from './modules/sources/sources.module';
import { ContextModule } from './modules/context/context.module';
import { CompetitorsModule } from './modules/competitors/competitors.module';
import { MarketModule } from './modules/market/market.module';
import { StrategyModule } from './modules/strategy/strategy.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ExportsModule } from './modules/exports/exports.module';
import { QuotaModule } from './modules/quota/quota.module';
import { AbuseModule } from './modules/abuse/abuse.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    AuthModule,
    AdminModule,
    EventsModule,
    ProjectsModule,
    SourcesModule,
    ContextModule,
    CompetitorsModule,
    MarketModule,
    StrategyModule,
    ReportsModule,
    ExportsModule,
    QuotaModule,
    AbuseModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
