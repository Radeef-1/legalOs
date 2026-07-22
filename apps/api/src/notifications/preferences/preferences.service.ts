import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { NotificationChannel, NotificationType } from '@prisma/client';
import { TenantContext } from '../../shared/tenant/tenant.context';

@Injectable()
export class PreferencesService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserPreferences(userId: string) {
    return this.prisma.db.notificationPreference.findMany({
      where: { userId },
    });
  }

  async updatePreference(
    organizationId: string,
    userId: string,
    notificationType: NotificationType,
    enabledChannels: NotificationChannel[],
  ) {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      return this.prisma.db.notificationPreference.upsert({
        where: {
          organizationId_userId_notificationType: {
            organizationId,
            userId,
            notificationType,
          },
        },
        create: {
          organizationId,
          userId,
          notificationType,
          enabledChannels,
        },
        update: {
          enabledChannels,
        },
      });
    });
  }

  async getEnabledChannels(
    organizationId: string,
    userId: string,
    notificationType: NotificationType,
  ): Promise<NotificationChannel[]> {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const pref = await this.prisma.db.notificationPreference.findUnique({
        where: {
          organizationId_userId_notificationType: {
            organizationId,
            userId,
            notificationType,
          },
        },
      });

      if (pref && pref.enabledChannels && pref.enabledChannels.length > 0) {
        return pref.enabledChannels;
      }

      // Default channels if not customized
      return [NotificationChannel.IN_APP, NotificationChannel.EMAIL];
    });
  }
}
