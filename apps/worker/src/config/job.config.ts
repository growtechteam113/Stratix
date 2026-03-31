import { BullModule } from '@nestjs/bull';

export const INGESTION_QUEUE_NAME = 'ingestion';
export const ANALYSIS_QUEUE_NAME = 'analysis';

export const jobDefaults = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 5000, // Start with 5 seconds
  },
  removeOnComplete: {
    age: 3600, // Keep completed jobs for 1 hour
  },
  removeOnFail: {
    age: 86400, // Keep failed jobs for 24 hours
  },
};

export const IngestionQueueConfig = BullModule.registerQueue({
  name: INGESTION_QUEUE_NAME,
  defaultJobOptions: jobDefaults,
});

export const AnalysisQueueConfig = BullModule.registerQueue({
  name: ANALYSIS_QUEUE_NAME,
  defaultJobOptions: jobDefaults,
});
