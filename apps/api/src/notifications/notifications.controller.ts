import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '../shared/guards/auth.guard';

@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll() {
    const data = await this.notificationsService.findAll();
    return {
      success: true,
      data,
    };
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    const data = await this.notificationsService.markAsRead(id);
    return {
      success: true,
      data,
    };
  }
}
