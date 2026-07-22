import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../shared/database/prisma.service';
import { TenantContext } from '../shared/tenant/tenant.context';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const userId = TenantContext.getUserId()!;

    const items = await this.prisma.db.notification.findMany({
      where: { userId },
      orderBy: { id: 'desc' }, // Order by creation / id
    });

    return items;
  }

  async markAsRead(id: string) {
    const userId = TenantContext.getUserId()!;

    const notification = await this.prisma.db.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException({
        code: 'NOTIFICATION_NOT_FOUND',
        message: 'التنبيه غير موجود',
      });
    }

    const updated = await this.prisma.db.notification.update({
      where: { id },
      data: {
        readAt: new Date(),
      },
    });

    return updated;
  }
}
