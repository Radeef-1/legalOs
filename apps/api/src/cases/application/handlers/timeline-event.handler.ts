import { Injectable } from '@nestjs/common';
import { EventHandler } from '../../../shared/events/decorators/event-handler.decorator';
import { IEventHandler } from '../../../shared/events/contracts/event-handler.interface';
import { BaseEvent } from '../../../shared/events/base/base-event';
import { PrismaService } from '../../../shared/database/prisma.service';

@Injectable()
@EventHandler('case.created')
export class TimelineEventHandler implements IEventHandler<BaseEvent> {
  constructor(private readonly prisma: PrismaService) {}

  async handle(event: BaseEvent): Promise<void> {
    console.log(`[Timeline/Workflow Handler] Auto-creating welcome task for Case: ${event.aggregateId}`);
    
    await this.prisma.db.task.create({
      data: {
        organizationId: event.metadata.tenantId,
        caseId: event.aggregateId,
        assignedToId: event.metadata.userId !== 'system' ? event.metadata.userId : null,
        title: 'مراجعة ملف القضية وتعبئة المستندات الأولية',
        description: 'تم إنشاء هذه المهمة تلقائياً عند فتح القضية لتأكيد مراجعة الملف وتعبئة البيانات.',
        status: 'todo',
      },
    });
  }
}
