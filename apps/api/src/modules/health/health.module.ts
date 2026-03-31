import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [HealthController],
  providers: [PrismaClient],
})
export class HealthModule {}
