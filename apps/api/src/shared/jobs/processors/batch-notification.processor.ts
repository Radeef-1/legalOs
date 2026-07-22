import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { IJobProcessor } from '../contracts/job-processor.interface';
import { JobRecord, JobType } from '../contracts/job-data.interface';
import { QueueService } from '../queue/queue.service';
import { NotificationDispatcher } from '../../../notifications/dispatcher/notification.dispatcher';
import { NotificationType } from '@prisma/client';

export interface BatchNotificationJobData {
  organizationId: string;
  recipients: Array<{ userId: string; email?: string; phone?: string }>;
  title: string;
  body: string;
  notificationType: NotificationType;
  shouldSimulateFailure?: boolean;
}

@Injectable()
export class BatchNotificationProcessor implements IJobProcessor<BatchNotificationJobData>, OnModuleInit {
  readonly jobType = JobType.BATCH_NOTIFICATION;
  private readonly logger = new Logger(BatchNotificationProcessor.name);

  constructor(
    private readonly queueService: QueueService,
    private readonly notificationDispatcher: NotificationDispatcher,
  ) {}

  onModuleInit() {
    this.queueService.registerProcessor(this);
  }

  async process(job: JobRecord<BatchNotificationJobData>, updateProgress: (progress: number) => void): Promise<any> {
    this.logger.log(`[BatchNotificationProcessor] Processing batch notification for ${job.payload.recipients.length} recipient(s)...`);

    if (job.payload.shouldSimulateFailure) {
      throw new Error('Simulated Batch Delivery Failure to test Retry & DLQ mechanism.');
    }

    let processedCount = 0;
    for (const recipient of job.payload.recipients) {
      await this.notificationDispatcher.dispatch({
        organizationId: job.payload.organizationId,
        userId: recipient.userId,
        title: job.payload.title,
        body: job.payload.body,
        notificationType: job.payload.notificationType,
        email: recipient.email,
        phone: recipient.phone,
      });

      processedCount++;
      updateProgress(Math.floor((processedCount / job.payload.recipients.length) * 100));
    }

    return {
      totalRecipients: job.payload.recipients.length,
      processedCount,
      completedAt: new Date().toISOString(),
    };
  }
}
