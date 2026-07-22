import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { PreferencesService } from './preferences.service';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { PermissionsGuard } from '../../shared/guards/permissions.guard';
import { Permissions } from '../../shared/decorators/permissions.decorator';
import { NotificationChannel, NotificationType } from '@prisma/client';

@Controller('notifications/preferences')
@UseGuards(AuthGuard, PermissionsGuard)
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Get(':userId')
  @Permissions('notifications.preferences.view')
  async getUserPreferences(@Param('userId') userId: string) {
    const data = await this.preferencesService.getUserPreferences(userId);
    return { success: true, data };
  }

  @Patch(':userId')
  @Permissions('notifications.preferences.update')
  async updatePreference(
    @Param('userId') userId: string,
    @Body('organizationId') organizationId: string,
    @Body('notificationType') notificationType: NotificationType,
    @Body('enabledChannels') enabledChannels: NotificationChannel[],
  ) {
    const data = await this.preferencesService.updatePreference(
      organizationId,
      userId,
      notificationType,
      enabledChannels,
    );
    return { success: true, data };
  }
}
