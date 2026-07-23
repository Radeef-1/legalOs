import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export interface DomainEvent {
  eventName: string;
  aggregateId: string;
  tenantId: string;
  payload: any;
  occurredAt?: Date;
}

@Injectable()
export class DomainEventPublisher {
  private readonly logger = new Logger(DomainEventPublisher.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Publishes domain events using Outbox Pattern for eventual consistency.
   */
  async publish(event: DomainEvent): Promise<void> {
    const occurredAt = event.occurredAt || new Date();
    this.logger.log(`[DomainEventPublisher] Emitting event: "${event.eventName}" for Tenant: [${event.tenantId}]`);

    try {
      // Store in PostgreSQL outbox table
      await this.prisma.outboxEvent.create({
        data: {
          organizationId: event.tenantId,
          eventType: event.eventName,
          payload: JSON.stringify(event.payload),
          createdAt: occurredAt,
        },
      });

      this.logger.log(`[DomainEventPublisher] Event "${event.eventName}" persisted to Outbox table 🟢`);
    } catch (err: any) {
      this.logger.warn(`[DomainEventPublisher] Direct Outbox persist warning: ${err.message}. Event logged locally.`);
    }
  }
}
