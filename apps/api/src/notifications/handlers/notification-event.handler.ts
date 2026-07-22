import { Injectable } from '@nestjs/common';
import { EventHandler } from '../../shared/events/decorators/event-handler.decorator';
import { IEventHandler } from '../../shared/events/contracts/event-handler.interface';
import { BaseEvent } from '../../shared/events/base/base-event';
import { PrismaService } from '../../shared/database/prisma.service';

@Injectable()
@EventHandler('case.created')
export class NotificationEventHandler implements IEventHandler<BaseEvent> {
  constructor(private readonly prisma: PrismaService) {}

  async handle(event: BaseEvent): Promise<void> {
    console.log(`[Notification Handler] Creating system notification for user: ${event.metadata.userId}`);

    if (event.metadata.userId && event.metadata.userId !== 'system') {
      await this.prisma.db.notification.create({
        data: {
          userId: event.metadata.userId,
          type: 'CASE_CREATED',
          payload: {
            caseId: event.aggregateId,
            message: `تم إنشاء القضية بنجاح برقم داخلي: ${(event as any).caseNumberInternal || 'غير محدد'}`,
          },
        },
      });
    }
  }
}
