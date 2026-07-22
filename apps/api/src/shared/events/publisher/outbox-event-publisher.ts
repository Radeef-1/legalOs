import { Inject, Injectable } from '@nestjs/common';
import { BaseEvent } from '../base/base-event';
import { IEventPublisher } from '../contracts/event-publisher.interface';
import type { IOutboxRepository } from '../contracts/outbox-repository.interface';
import type { IEventDispatcher } from '../contracts/event-dispatcher.interface';
import { OUTBOX_REPOSITORY_TOKEN, EVENT_DISPATCHER_TOKEN } from '../tokens';
import { OutboxStatus } from '@prisma/client';

@Injectable()
export class OutboxEventPublisher implements IEventPublisher {
  constructor(
    @Inject(OUTBOX_REPOSITORY_TOKEN)
    private readonly outboxRepository: IOutboxRepository,
    @Inject(EVENT_DISPATCHER_TOKEN)
    private readonly eventDispatcher: IEventDispatcher,
  ) {}

  async publish(event: BaseEvent, tx?: any): Promise<void> {
    await this.outboxRepository.save(event, tx);
    
    if (!tx) {
      try {
        await this.eventDispatcher.dispatch(event);
        await this.outboxRepository.updateStatus(event.id, OutboxStatus.PROCESSED);
      } catch (err: any) {
        await this.outboxRepository.updateStatus(event.id, OutboxStatus.FAILED, err.message || String(err));
      }
    }
  }

  async publishMany(events: BaseEvent[], tx?: any): Promise<void> {
    await this.outboxRepository.saveMany(events, tx);
    
    if (!tx) {
      for (const event of events) {
        try {
          await this.eventDispatcher.dispatch(event);
          await this.outboxRepository.updateStatus(event.id, OutboxStatus.PROCESSED);
        } catch (err: any) {
          await this.outboxRepository.updateStatus(event.id, OutboxStatus.FAILED, err.message || String(err));
        }
      }
    }
  }

  async publishAsync(event: BaseEvent, tx?: any): Promise<void> {
    await this.outboxRepository.save(event, tx);
    
    if (!tx) {
      setImmediate(async () => {
        try {
          await this.eventDispatcher.dispatch(event);
          await this.outboxRepository.updateStatus(event.id, OutboxStatus.PROCESSED);
        } catch (err: any) {
          await this.outboxRepository.updateStatus(event.id, OutboxStatus.FAILED, err.message || String(err));
        }
      });
    }
  }

  async schedule(event: BaseEvent, delayMs: number, tx?: any): Promise<void> {
    await this.outboxRepository.save(event, tx);
    
    setTimeout(async () => {
      try {
        await this.eventDispatcher.dispatch(event);
        await this.outboxRepository.updateStatus(event.id, OutboxStatus.PROCESSED);
      } catch (err: any) {
        await this.outboxRepository.updateStatus(event.id, OutboxStatus.FAILED, err.message || String(err));
      }
    }, delayMs);
  }
}
