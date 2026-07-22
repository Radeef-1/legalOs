import { Module } from '@nestjs/common';
import { QueueService } from './queue/queue.service';
import { NajizSyncProcessor } from './processors/najiz-sync.processor';
import { DocumentPdfProcessor } from './processors/document-pdf.processor';
import { HearingReminderProcessor } from './processors/hearing-reminder.processor';
import { BatchNotificationProcessor } from './processors/batch-notification.processor';
import { JobMetricsController } from './controllers/job-metrics.controller';
import { NotificationsModule } from '../../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [JobMetricsController],
  providers: [
    QueueService,
    NajizSyncProcessor,
    DocumentPdfProcessor,
    HearingReminderProcessor,
    BatchNotificationProcessor,
  ],
  exports: [
    QueueService,
    NajizSyncProcessor,
    DocumentPdfProcessor,
    HearingReminderProcessor,
    BatchNotificationProcessor,
  ],
})
export class JobsModule {}
