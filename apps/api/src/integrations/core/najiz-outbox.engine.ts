import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';

export interface NajizOutboxEventPayload {
  eventId: string;
  eventType: 'NAJIZ_CASE_STATUS_CHANGED' | 'NAJIZ_HEARING_SCHEDULED' | 'NAJIZ_ENFORCEMENT_DECISION_ISSUED' | 'NAJIZ_NOTARIZATION_VERIFIED';
  tenantId: string;
  najizCaseNumber: string;
  payload: Record<string, any>;
  maxAttempts?: number;
}

export interface OutboxTaskRecord {
  id: string;
  eventType: string;
  tenantId: string;
  najizCaseNumber: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED_RETRYING' | 'DEAD_LETTER';
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  payload: Record<string, any>;
  nextAttemptAt: Date;
  createdAt: Date;
}

@Injectable()
export class NajizOutboxEngine {
  private readonly logger = new Logger(NajizOutboxEngine.name);
  private readonly outboxQueue: OutboxTaskRecord[] = [];

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Enqueues an async Najiz event into the Transactional Outbox.
   */
  async enqueueEvent(event: NajizOutboxEventPayload): Promise<OutboxTaskRecord> {
    const record: OutboxTaskRecord = {
      id: event.eventId || `outbox-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      eventType: event.eventType,
      tenantId: event.tenantId,
      najizCaseNumber: event.najizCaseNumber,
      status: 'PENDING',
      attempts: 0,
      maxAttempts: event.maxAttempts || 5,
      payload: event.payload,
      nextAttemptAt: new Date(),
      createdAt: new Date(),
    };

    this.outboxQueue.push(record);
    this.logger.log(
      `[NajizOutboxEngine] Enqueued event "${record.eventType}" for Case #${record.najizCaseNumber} (Tenant: ${record.tenantId})`,
    );

    // Process immediately or queue
    await this.processNextBatch();
    return record;
  }

  /**
   * Processes all pending events in the Outbox with exponential backoff.
   */
  async processNextBatch(): Promise<{ processed: number; succeeded: number; failed: number }> {
    let processed = 0;
    let succeeded = 0;
    let failed = 0;

    const pending = this.outboxQueue.filter(
      (task) => (task.status === 'PENDING' || task.status === 'FAILED_RETRYING') && task.nextAttemptAt <= new Date(),
    );

    for (const task of pending) {
      processed++;
      task.status = 'PROCESSING';
      task.attempts++;

      try {
        this.logger.log(
          `[NajizOutboxEngine] Processing task ${task.id} (Attempt ${task.attempts}/${task.maxAttempts}) for Event: ${task.eventType}`,
        );

        // Simulate MoJ Apigee Gateway dispatch / DB persistence
        await this.dispatchToMoJGateway(task);

        task.status = 'COMPLETED';
        succeeded++;
        this.logger.log(`[NajizOutboxEngine] Successfully processed task ${task.id}`);
      } catch (err: any) {
        failed++;
        task.lastError = err?.message || String(err);
        if (task.attempts >= task.maxAttempts) {
          task.status = 'DEAD_LETTER';
          this.logger.error(
            `[NajizOutboxEngine] Task ${task.id} exceeded max attempts (${task.maxAttempts}). Moved to DEAD_LETTER. Error: ${task.lastError}`,
          );
        } else {
          task.status = 'FAILED_RETRYING';
          // Exponential backoff: 2^attempts * 1000 ms
          const delayMs = Math.pow(2, task.attempts) * 1000;
          task.nextAttemptAt = new Date(Date.now() + delayMs);
          this.logger.warn(
            `[NajizOutboxEngine] Task ${task.id} failed. Retrying in ${delayMs}ms (Attempt ${task.attempts}). Error: ${task.lastError}`,
          );
        }
      }
    }

    return { processed, succeeded, failed };
  }

  private async dispatchToMoJGateway(task: OutboxTaskRecord): Promise<void> {
    // Simulated high-reliability Gateway connection logic
    if (task.payload?.simulateFailure && task.attempts < 2) {
      throw new Error('MoJ Gateway temporary timeout (503 Service Unavailable)');
    }

    // Execution succeeds cleanly
  }

  getQueueMetrics() {
    return {
      totalInQueue: this.outboxQueue.length,
      pending: this.outboxQueue.filter((t) => t.status === 'PENDING').length,
      completed: this.outboxQueue.filter((t) => t.status === 'COMPLETED').length,
      failedRetrying: this.outboxQueue.filter((t) => t.status === 'FAILED_RETRYING').length,
      deadLetter: this.outboxQueue.filter((t) => t.status === 'DEAD_LETTER').length,
    };
  }
}
