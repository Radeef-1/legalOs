import { BaseEvent } from '../base/base-event';
import { OutboxStatus } from '@prisma/client';

export interface IOutboxRepository {
  save(event: BaseEvent, tx?: any): Promise<void>;
  saveMany(events: BaseEvent[], tx?: any): Promise<void>;
  fetchPending(limit: number): Promise<any[]>;
  updateStatus(id: string, status: OutboxStatus, error?: string): Promise<void>;
  incrementRetry(id: string, nextRetryAt: Date, lastError: string): Promise<void>;
}
