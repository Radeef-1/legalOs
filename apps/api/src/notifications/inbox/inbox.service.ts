import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { NotificationChannel, NotificationType } from '@prisma/client';
import { TenantContext } from '../../shared/tenant/tenant.context';

export interface CreateNotificationDto {
  organizationId: string;
  userId: string;
  title: string;
  body: string;
  channel?: NotificationChannel;
  type?: NotificationType;
  metadataJson?: any;
}

@Injectable()
export class InboxService {
  constructor(private readonly prisma: PrismaService) {}

  async createInAppNotification(dto: CreateNotificationDto) {
    return TenantContext.run({ tenantId: dto.organizationId }, async () => {
      return this.prisma.db.notification.create({
        data: {
          organizationId: dto.organizationId,
          userId: dto.userId,
          title: dto.title,
          body: dto.body,
          channel: dto.channel || NotificationChannel.IN_APP,
          type: dto.type || NotificationType.SYSTEM_ALERT,
          metadataJson: dto.metadataJson || null,
        },
      });
    });
  }

  async getUserInbox(userId: string, limit = 20) {
    return (this.prisma as any).notification.findMany({
      where: { userId },
      orderBy: { sentAt: 'desc' },
      take: limit,
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return (this.prisma as any).notification.count({
      where: {
        userId,
        readAt: null,
      },
    });
  }

  async markAsRead(notificationId: string) {
    return this.prisma.db.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.db.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }
}
