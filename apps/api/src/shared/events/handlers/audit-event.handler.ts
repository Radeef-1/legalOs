import { Injectable } from '@nestjs/common';
import { EventHandler } from '../decorators/event-handler.decorator';
import { IEventHandler } from '../contracts/event-handler.interface';
import { BaseEvent } from '../base/base-event';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
@EventHandler('case.created')
export class AuditEventHandler implements IEventHandler<BaseEvent> {
  constructor(private readonly prisma: PrismaService) {}

  async handle(event: BaseEvent): Promise<void> {
    console.log(`[Audit Handler] Logging audit trail for event: ${event.eventName}`);
    
    // Extract metadata
    const tenantId = event.metadata.tenantId;
    const userId = event.metadata.userId !== 'system' ? event.metadata.userId : null;

    // Save to audit_logs table
    await this.prisma.db.auditLog.create({
      data: {
        organizationId: tenantId,
        userId: userId,
        action: 'CREATE',
        entityType: event.aggregateType,
        entityId: event.aggregateId,
        newValue: JSON.parse(JSON.stringify(event)) as any,
      },
    });
  }
}
