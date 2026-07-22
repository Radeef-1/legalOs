import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { InboxService } from './inbox.service';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { PermissionsGuard } from '../../shared/guards/permissions.guard';
import { Permissions } from '../../shared/decorators/permissions.decorator';

@Controller('notifications/inbox')
@UseGuards(AuthGuard, PermissionsGuard)
export class InboxController {
  constructor(private readonly inboxService: InboxService) {}

  @Get(':userId')
  @Permissions('notifications.view')
  async getUserInbox(@Param('userId') userId: string, @Query('limit') limit?: string) {
    const data = await this.inboxService.getUserInbox(userId, limit ? parseInt(limit, 10) : 20);
    return { success: true, data };
  }

  @Get(':userId/unread-count')
  @Permissions('notifications.view')
  async getUnreadCount(@Param('userId') userId: string) {
    const unreadCount = await this.inboxService.getUnreadCount(userId);
    return { success: true, unreadCount };
  }

  @Patch(':id/read')
  @Permissions('notifications.update')
  async markAsRead(@Param('id') id: string) {
    const data = await this.inboxService.markAsRead(id);
    return { success: true, data };
  }

  @Patch(':userId/read-all')
  @Permissions('notifications.update')
  async markAllAsRead(@Param('userId') userId: string) {
    const data = await this.inboxService.markAllAsRead(userId);
    return { success: true, data };
  }
}
