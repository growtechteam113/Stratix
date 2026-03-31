import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { IngestionProcessor } from '../../processors/ingestion.processor';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    BullModule.registerQueue({
      name: 'ingestion',
    }),
  ],
  providers: [IngestionProcessor],
  exports: [BullModule],
})
export class QueueModule {}
