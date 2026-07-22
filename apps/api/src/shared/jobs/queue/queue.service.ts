import { Injectable, Logger } from '@nestjs/common';
import { JobRecord, JobStatus, JobType, QueueMetrics } from '../contracts/job-data.interface';
import { IJobProcessor } from '../contracts/job-processor.interface';

export interface AddJobOptions {
  maxAttempts?: number;
  delayMs?: number;
}

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);
  private jobs: Map<string, JobRecord> = new Map();
  private processors: Map<JobType, IJobProcessor> = new Map();

  registerProcessor(processor: IJobProcessor) {
    this.processors.set(processor.jobType, processor);
    this.logger.log(`[QueueService] Registered processor for JobType: ${processor.jobType}`);
  }

  async addJob<T = any>(
    queueName: string,
    type: JobType,
    payload: T,
    options?: AddJobOptions,
  ): Promise<JobRecord<T>> {
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const maxAttempts = options?.maxAttempts ?? 3;
    const delayMs = options?.delayMs ?? 0;
    const isDelayed = delayMs > 0;

    const record: JobRecord<T> = {
      id: jobId,
      queueName,
      type,
      payload,
      status: isDelayed ? JobStatus.DELAYED : JobStatus.WAITING,
      progress: 0,
      attempts: 0,
      maxAttempts,
      delayMs,
      scheduledAt: isDelayed ? new Date(Date.now() + delayMs) : new Date(),
    };

    this.jobs.set(jobId, record);
    this.logger.log(`[QueueService] Added Job [ID: ${jobId}, Type: ${type}, Delayed: ${delayMs}ms] to Queue: "${queueName}"`);

    if (isDelayed) {
      setTimeout(() => this.executeJob(jobId), delayMs);
    } else {
      setImmediate(() => this.executeJob(jobId));
    }

    return record;
  }

  private async executeJob(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    const processor = this.processors.get(job.type);
    if (!processor) {
      this.logger.error(`[QueueService] No registered processor found for JobType: ${job.type}`);
      job.status = JobStatus.FAILED;
      job.error = `No processor registered for ${job.type}`;
      return;
    }

    job.status = JobStatus.ACTIVE;
    job.attempts += 1;
    job.processedAt = new Date();

    try {
      this.logger.log(`[QueueService] Processing Job [ID: ${jobId}, Attempt: ${job.attempts}/${job.maxAttempts}]`);
      
      const updateProgress = (progress: number) => {
        job.progress = Math.min(100, Math.max(0, progress));
      };

      const result = await processor.process(job, updateProgress);
      job.status = JobStatus.COMPLETED;
      job.progress = 100;
      job.completedAt = new Date();
      job.result = result;
      this.logger.log(`[QueueService] Job [ID: ${jobId}] COMPLETED successfully.`);
    } catch (err: any) {
      const errorMessage = err?.message || String(err);
      job.failedAt = new Date();
      job.error = errorMessage;

      if (job.attempts < job.maxAttempts) {
        job.status = JobStatus.DELAYED;
        const backoffDelay = Math.pow(2, job.attempts) * 200; // Exponential backoff e.g. 400ms, 800ms
        this.logger.warn(`[QueueService] Job [ID: ${jobId}] failed (Attempt ${job.attempts}/${job.maxAttempts}). Scheduling backoff retry in ${backoffDelay}ms. Error: ${errorMessage}`);
        setTimeout(() => this.executeJob(jobId), backoffDelay);
      } else {
        job.status = JobStatus.DEAD_LETTER;
        this.logger.error(`[QueueService] Job [ID: ${jobId}] MAX ATTEMPTS EXCEEDED. Moved to Dead Letter Queue (DLQ). Error: ${errorMessage}`);
      }
    }
  }

  getJob(jobId: string): JobRecord | undefined {
    return this.jobs.get(jobId);
  }

  getQueueMetrics(queueName?: string): QueueMetrics {
    let allJobs = Array.from(this.jobs.values());
    if (queueName) {
      allJobs = allJobs.filter((j) => j.queueName === queueName);
    }

    return {
      queueName: queueName || 'ALL_QUEUES',
      totalJobs: allJobs.length,
      active: allJobs.filter((j) => j.status === JobStatus.ACTIVE).length,
      completed: allJobs.filter((j) => j.status === JobStatus.COMPLETED).length,
      failed: allJobs.filter((j) => j.status === JobStatus.FAILED).length,
      delayed: allJobs.filter((j) => j.status === JobStatus.DELAYED).length,
      deadLetter: allJobs.filter((j) => j.status === JobStatus.DEAD_LETTER).length,
    };
  }
}
