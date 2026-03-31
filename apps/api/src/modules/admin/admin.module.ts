import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminAnalyticsService } from './admin-analytics.service';
import { AdminController } from './admin.controller';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [AdminController],
  providers: [AdminService, AdminAnalyticsService, PrismaClient],
  exports: [AdminService, AdminAnalyticsService],
})
export class AdminModule {}
