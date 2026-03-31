import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService, PrismaClient],
  exports: [ReportsService],
})
export class ReportsModule {}
