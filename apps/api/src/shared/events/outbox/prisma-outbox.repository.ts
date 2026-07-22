import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BaseEvent } from '../base/base-event';
import { IOutboxRepository } from '../contracts/outbox-repository.interface';
import { OutboxStatus } from '@prisma/client';

@Injectable()
export class PrismaOutboxRepository implements IOutboxRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(event: BaseEvent, tx?: any): Promise<void> {
    const client = tx || this.prisma.db;
    await client.outboxEvent.create({
      data: {
        id: event.id,
        eventType: event.eventName,
        aggregateType: event.aggregateType,
        aggregateId: event.aggregateId,
        tenantId: event.metadata.tenantId,
        userId: event.metadata.userId,
        payload: JSON.parse(JSON.stringify(event)) as any,
        correlationId: event.correlationId || null,
        causationId: event.causationId || null,
        requestId: event.metadata.requestId || null,
        traceId: event.metadata.traceId || null,
        version: event.version,
        status: OutboxStatus.PENDING,
      },
    });
  }

  async saveMany(events: BaseEvent[], tx?: any): Promise<void> {
    const client = tx || this.prisma.db;
    await client.outboxEvent.createMany({
      data: events.map((event) => ({
        id: event.id,
        eventType: event.eventName,
        aggregateType: event.aggregateType,
        aggregateId: event.aggregateId,
        tenantId: event.metadata.tenantId,
        userId: event.metadata.userId,
        payload: JSON.parse(JSON.stringify(event)) as any,
        correlationId: event.correlationId || null,
        causationId: event.causationId || null,
        requestId: event.metadata.requestId || null,
        traceId: event.metadata.traceId || null,
        version: event.version,
        status: OutboxStatus.PENDING,
      })),
    });
  }

  async fetchPending(limit: number): Promise<any[]> {
    if (!this.prisma?.db?.outboxEvent) {
      return [];
    }
    return this.prisma.db.outboxEvent.findMany({
      where: {
        OR: [
          { status: OutboxStatus.PENDING },
          {
            status: OutboxStatus.FAILED,
            nextRetryAt: { lte: new Date() },
          },
        ],
      },
      take: limit,
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateStatus(id: string, status: OutboxStatus, error?: string): Promise<void> {
    await this.prisma.db.outboxEvent.update({
      where: { id },
      data: {
        status,
        error: error || null,
        processedAt: status === OutboxStatus.PROCESSED ? new Date() : null,
      },
    });
  }

  async incrementRetry(id: string, nextRetryAt: Date, lastError: string): Promise<void> {
    await this.prisma.db.outboxEvent.update({
      where: { id },
      data: {
        status: OutboxStatus.FAILED,
        retryCount: { increment: 1 },
        nextRetryAt,
        error: lastError,
      },
    });
  }
}
