import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { IJobProcessor } from '../contracts/job-processor.interface';
import { JobRecord, JobType } from '../contracts/job-data.interface';
import { QueueService } from '../queue/queue.service';

export interface NajizSyncJobData {
  organizationId: string;
  caseNumber: string;
  nationalId: string;
}

@Injectable()
export class NajizSyncProcessor implements IJobProcessor<NajizSyncJobData>, OnModuleInit {
  readonly jobType = JobType.NAJIZ_SYNC;
  private readonly logger = new Logger(NajizSyncProcessor.name);

  constructor(private readonly queueService: QueueService) {}

  onModuleInit() {
    this.queueService.registerProcessor(this);
  }

  async process(job: JobRecord<NajizSyncJobData>, updateProgress: (progress: number) => void): Promise<any> {
    this.logger.log(`[NajizSyncProcessor] Executing MoJ Najiz Sync for Case: ${job.payload.caseNumber}...`);

    updateProgress(25);
    // Simulate API handshake with Ministry of Justice Najiz Portal
    await new Promise((resolve) => setTimeout(resolve, 50));

    updateProgress(60);
    // Fetch latest hearing dates & case status
    await new Promise((resolve) => setTimeout(resolve, 50));

    updateProgress(100);
    return {
      syncedAt: new Date().toISOString(),
      caseNumber: job.payload.caseNumber,
      hearingsFound: 2,
      status: 'SYNCHRONIZED',
    };
  }
}
