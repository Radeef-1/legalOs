import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { QueueService } from './shared/jobs/queue/queue.service';
import { JobStatus, JobType } from './shared/jobs/contracts/job-data.interface';
import { DocumentPdfJobData } from './shared/jobs/processors/document-pdf.processor';
import { NajizSyncJobData } from './shared/jobs/processors/najiz-sync.processor';
import { HearingReminderJobData } from './shared/jobs/processors/hearing-reminder.processor';
import { BatchNotificationJobData } from './shared/jobs/processors/batch-notification.processor';
import { NotificationType } from '@prisma/client';

async function bootstrap() {
  console.log('--- STARTING BACKGROUND JOBS & DISTRIBUTED QUEUE SYSTEM VERIFICATION ---');
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });

  const queueService = app.get(QueueService);
  const tenantId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

  // -------------------------------------------------------------
  // SCENARIO 1: Immediate Execution (Document PDF Compilation)
  // -------------------------------------------------------------
  console.log('\n[Scenario 1] Enqueuing Immediate Document PDF Compilation Job...');
  const pdfJob = await queueService.addJob<DocumentPdfJobData>('pdf_compilation', JobType.DOCUMENT_PDF_COMPILATION, {
    organizationId: tenantId,
    documentId: 'doc-9901',
    documentTitle: 'لائحة دعوى تجارية جديدة',
    templateType: 'COURT_BRIEF_PDF',
  });

  console.log(`- Enqueued Job [ID: ${pdfJob.id}, Initial Status: ${pdfJob.status}]`);
  await new Promise((resolve) => setTimeout(resolve, 200));

  const completedPdfJob = queueService.getJob(pdfJob.id)!;
  console.log(`- Job Status: ${completedPdfJob.status}, Progress: ${completedPdfJob.progress}%, Result URL: ${completedPdfJob.result?.pdfUrl}`);
  if (completedPdfJob.status !== JobStatus.COMPLETED) {
    throw new Error('Expected PDF compilation job to reach COMPLETED status!');
  }
  console.log('✔ Immediate Async Job Execution Verified!');

  // -------------------------------------------------------------
  // SCENARIO 2: MoJ Najiz Sync Processor
  // -------------------------------------------------------------
  console.log('\n[Scenario 2] Enqueuing MoJ Najiz Background Sync Job...');
  const najizJob = await queueService.addJob<NajizSyncJobData>('najiz_sync', JobType.NAJIZ_SYNC, {
    organizationId: tenantId,
    caseNumber: '4092/1447',
    nationalId: '1092837465',
  });

  await new Promise((resolve) => setTimeout(resolve, 200));
  const completedNajizJob = queueService.getJob(najizJob.id)!;
  console.log(`- Najiz Sync Result: Status=${completedNajizJob.result?.status}, HearingsFound=${completedNajizJob.result?.hearingsFound}`);
  if (completedNajizJob.status !== JobStatus.COMPLETED) {
    throw new Error('Expected Najiz Sync job to reach COMPLETED status!');
  }
  console.log('✔ Najiz Background Sync Processor Verified!');

  // -------------------------------------------------------------
  // SCENARIO 3: Delayed Execution Timer (Hearing Reminder)
  // -------------------------------------------------------------
  console.log('\n[Scenario 3] Enqueuing Delayed Hearing Reminder Job (300ms delay)...');
  const delayedJob = await queueService.addJob<HearingReminderJobData>(
    'hearing_reminders',
    JobType.HEARING_REMINDER,
    {
      organizationId: tenantId,
      userId: '33333333-3333-3333-3333-333333333333',
      hearingId: 'hearing-11',
      caseNumber: '4092/1447',
      courtName: 'المحكمة التجارية',
      hearingDate: '10:00 AM',
      lawyerEmail: 'lawyer.a@firma.sa',
      lawyerPhone: '+966501234567',
    },
    { delayMs: 300 },
  );

  console.log(`- Enqueued Delayed Job [ID: ${delayedJob.id}, Initial Status: ${delayedJob.status}]`);
  if (delayedJob.status !== JobStatus.DELAYED) {
    throw new Error('Expected job to initially be in DELAYED status!');
  }

  console.log('- Waiting for timer expiration...');
  await new Promise((resolve) => setTimeout(resolve, 500));

  const executedDelayedJob = queueService.getJob(delayedJob.id)!;
  console.log(`- Post-timer Job Status: ${executedDelayedJob.status}, DispatchedChannels: [${executedDelayedJob.result?.dispatchedChannels?.join(', ')}]`);
  if (executedDelayedJob.status !== JobStatus.COMPLETED) {
    throw new Error('Expected delayed job to execute and reach COMPLETED status!');
  }
  console.log('✔ Delayed Execution Timer Engine Verified!');

  // -------------------------------------------------------------
  // SCENARIO 4: Exponential Retries & Dead Letter Queue (DLQ)
  // -------------------------------------------------------------
  console.log('\n[Scenario 4] Testing Exponential Retries & Dead Letter Queue (DLQ)...');
  const failingJob = await queueService.addJob<BatchNotificationJobData>(
    'batch_notifications',
    JobType.BATCH_NOTIFICATION,
    {
      organizationId: tenantId,
      recipients: [{ userId: '33333333-3333-3333-3333-333333333333' }],
      title: 'Test Bulk Alert',
      body: 'Test Body',
      notificationType: NotificationType.SYSTEM_ALERT,
      shouldSimulateFailure: true,
    },
    { maxAttempts: 3 },
  );

  console.log(`- Enqueued Failing Job [ID: ${failingJob.id}, MaxAttempts: ${failingJob.maxAttempts}]`);
  // Wait for attempts 1, 2, 3 with backoffs
  await new Promise((resolve) => setTimeout(resolve, 2500));

  const deadLetterJob = queueService.getJob(failingJob.id)!;
  console.log(`- Final Job Status: ${deadLetterJob.status}, Attempts: ${deadLetterJob.attempts}/${deadLetterJob.maxAttempts}, Error: "${deadLetterJob.error}"`);
  if (deadLetterJob.status !== JobStatus.DEAD_LETTER) {
    throw new Error('Expected failing job to land in DEAD_LETTER queue!');
  }
  console.log('✔ Exponential Retries & Dead Letter Queue (DLQ) Verified!');

  // -------------------------------------------------------------
  // SCENARIO 5: Queue Metrics & Health Monitoring
  // -------------------------------------------------------------
  console.log('\n[Scenario 5] Inspecting Queue Metrics & Health Dashboard...');
  const metrics = queueService.getQueueMetrics();
  console.log('- Global Queue Metrics:', JSON.stringify(metrics, null, 2));

  if (metrics.completed < 3 || metrics.deadLetter < 1) {
    throw new Error('Queue metrics verification failed!');
  }
  console.log('✔ Queue Metrics & Monitoring Engine Verified!');

  console.log('\n✅ ALL BACKGROUND JOBS & DISTRIBUTED QUEUE SYSTEM SCENARIOS VERIFIED SUCCESSFULLY!');
  await app.close();
}

bootstrap().catch((err) => {
  console.error('❌ BACKGROUND JOBS VERIFICATION FAILED:', err);
  process.exit(1);
});
