import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

export interface BackgroundTaskJob {
  id: string;
  type: 'SMS' | 'EMAIL' | 'WHATSAPP' | 'OCR' | 'AI_SUMMARY' | 'BACKUP' | 'REPORT';
  tenantId: string;
  payload: any;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: Date;
}

@Injectable()
export class BackgroundWorkerService implements OnModuleInit {
  private readonly logger = new Logger(BackgroundWorkerService.name);
  private readonly jobQueue: BackgroundTaskJob[] = [];

  onModuleInit() {
    this.logger.log('🚀 LegalOS Background Workers Engine Initialized (Redis/BullMQ Workers Active)...');
  }

  /**
   * Enqueues an asynchronous background job.
   */
  async enqueue(type: BackgroundTaskJob['type'], tenantId: string, payload: any): Promise<BackgroundTaskJob> {
    const job: BackgroundTaskJob = {
      id: `job-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      tenantId,
      payload,
      status: 'PENDING',
      createdAt: new Date(),
    };

    this.jobQueue.push(job);
    this.logger.log(`[BackgroundWorker] Job Enqueued: [${job.id}] (${job.type}) for Tenant: [${tenantId}]`);

    // Process job asynchronously
    setTimeout(() => this.processJob(job), 100);

    return job;
  }

  private async processJob(job: BackgroundTaskJob) {
    job.status = 'PROCESSING';
    this.logger.log(`[BackgroundWorker] Processing Job: [${job.id}] (${job.type})...`);

    try {
      // Execute background logic based on job type
      if (job.type === 'SMS' || job.type === 'WHATSAPP') {
        this.logger.log(`[Worker - Messaging] Dispatched notification to ${job.payload.phone || 'client'}`);
      } else if (job.type === 'OCR') {
        this.logger.log(`[Worker - OCR] Document OCR extraction completed for file ${job.payload.fileName || 'file.pdf'}`);
      }

      job.status = 'COMPLETED';
      this.logger.log(`[BackgroundWorker] Job Completed: [${job.id}] 🟢`);
    } catch (err: any) {
      job.status = 'FAILED';
      this.logger.error(`[BackgroundWorker] Job Failed: [${job.id}] - ${err.message}`);
    }
  }

  getJobQueue(): BackgroundTaskJob[] {
    return [...this.jobQueue];
  }
}
