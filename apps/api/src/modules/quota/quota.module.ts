import { Module } from '@nestjs/common';
import { QuotaService } from './quota.service';
import { PrismaClient } from '@prisma/client';

@Module({
  providers: [QuotaService, PrismaClient],
  exports: [QuotaService],
})
export class QuotaModule {}
