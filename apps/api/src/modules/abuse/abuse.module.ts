import { Module } from '@nestjs/common';
import { AbuseService } from './abuse.service';
import { PrismaClient } from '@prisma/client';

@Module({
  providers: [AbuseService, PrismaClient],
  exports: [AbuseService],
})
export class AbuseModule {}
