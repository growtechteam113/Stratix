import { Module } from '@nestjs/common';
import { ExportsService } from './exports.service';
import { ExportsController } from './exports.controller';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [ExportsController],
  providers: [ExportsService, PrismaClient],
  exports: [ExportsService],
})
export class ExportsModule {}
