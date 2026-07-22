import { Inject, Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import type { IOutboxRepository } from '../contracts/outbox-repository.interface';
import type { IEventDispatcher } from '../contracts/event-dispatcher.interface';
import { OUTBOX_REPOSITORY_TOKEN, EVENT_DISPATCHER_TOKEN } from '../tokens';
import { BaseEvent, EventMetadata } from '../base/base-event';
import { OutboxStatus } from '@prisma/client';

@Injectable()
export class OutboxWorker implements OnModuleInit, OnModuleDestroy {
  private intervalId?: NodeJS.Timeout;
  private isProcessing = false;

  constructor(
    @Inject(OUTBOX_REPOSITORY_TOKEN)
    private readonly outboxRepository: IOutboxRepository,
    @Inject(EVENT_DISPATCHER_TOKEN)
    private readonly eventDispatcher: IEventDispatcher,
  ) {}

  onModuleInit() {
    this.intervalId = setInterval(() => this.processOutbox(), 3000);
  }

  onModuleDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  async processOutbox() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const pendingEvents = await this.outboxRepository.fetchPending(20);

      for (const record of pendingEvents) {
        await this.outboxRepository.updateStatus(record.id, OutboxStatus.PROCESSING);

        try {
          const payload = record.payload as any;
          
          const event: BaseEvent = {
            id: record.id,
            eventName: record.eventType,
            aggregateType: record.aggregateType,
            aggregateId: record.aggregateId,
            occurredAt: new Date(record.createdAt),
            metadata: payload.metadata as EventMetadata,
            correlationId: record.correlationId || undefined,
            causationId: record.causationId || undefined,
            version: record.version,
          };

          await this.eventDispatcher.dispatch(event);
          await this.outboxRepository.updateStatus(record.id, OutboxStatus.PROCESSED);
        } catch (error: any) {
          console.error(`[Outbox Worker] Error processing event ${record.id}:`, error);

          if (record.retryCount < 5) {
            const nextRetry = new Date();
            const delaySeconds = Math.pow(2, record.retryCount) * 5;
            nextRetry.setSeconds(nextRetry.getSeconds() + delaySeconds);

            await this.outboxRepository.incrementRetry(record.id, nextRetry, error.message || String(error));
          } else {
            await this.outboxRepository.updateStatus(record.id, OutboxStatus.DEAD, error.message || String(error));
          }
        }
      }
    } catch (err) {
      console.error('[Outbox Worker] Error fetching pending events:', err);
    } finally {
      this.isProcessing = false;
    }
  }
}
