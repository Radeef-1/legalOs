import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { IJobProcessor } from '../contracts/job-processor.interface';
import { JobRecord, JobType } from '../contracts/job-data.interface';
import { QueueService } from '../queue/queue.service';
import { NotificationDispatcher } from '../../../notifications/dispatcher/notification.dispatcher';
import { NotificationType } from '@prisma/client';

export interface HearingReminderJobData {
  organizationId: string;
  userId: string;
  hearingId: string;
  caseNumber: string;
  courtName: string;
  hearingDate: string;
  lawyerEmail: string;
  lawyerPhone: string;
}

@Injectable()
export class HearingReminderProcessor implements IJobProcessor<HearingReminderJobData>, OnModuleInit {
  readonly jobType = JobType.HEARING_REMINDER;
  private readonly logger = new Logger(HearingReminderProcessor.name);

  constructor(
    private readonly queueService: QueueService,
    private readonly notificationDispatcher: NotificationDispatcher,
  ) {}

  onModuleInit() {
    this.queueService.registerProcessor(this);
  }

  async process(job: JobRecord<HearingReminderJobData>, updateProgress: (progress: number) => void): Promise<any> {
    this.logger.log(`[HearingReminderProcessor] Executing Delayed Hearing Alert for Case ${job.payload.caseNumber}...`);

    updateProgress(50);
    const dispatchResult = await this.notificationDispatcher.dispatch({
      organizationId: job.payload.organizationId,
      userId: job.payload.userId,
      title: 'تذكير بموعد الجلسة القضائية',
      body: `لديك جلسة مرافعة اليوم الساعة ${job.payload.hearingDate} في ${job.payload.courtName}`,
      notificationType: NotificationType.HEARING_REMINDER,
      email: job.payload.lawyerEmail,
      phone: job.payload.lawyerPhone,
      metadata: job.payload,
    });

    updateProgress(100);
    return {
      dispatchedChannels: dispatchResult.dispatchedChannels,
      executedAt: new Date().toISOString(),
    };
  }
}
