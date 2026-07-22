import { Controller, Get, Patch, Post, Body, Param, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dtos/update-settings.dto';
import { CreateHolidayCalendarDto } from './dtos/create-holiday-calendar.dto';
import { CreateHolidayDto } from './dtos/create-holiday.dto';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { PermissionsGuard } from '../../shared/guards/permissions.guard';
import { Permissions } from '../../shared/decorators/permissions.decorator';

@Controller('workspace')
@UseGuards(AuthGuard, PermissionsGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('settings')
  @Permissions('workspace.manage')
  async getSettings() {
    const data = await this.settingsService.getSettings();
    return {
      success: true,
      data,
    };
  }

  @Patch('settings')
  @Permissions('workspace.manage')
  async updateSettings(@Body() dto: UpdateSettingsDto) {
    const data = await this.settingsService.updateSettings(dto);
    return {
      success: true,
      data,
    };
  }

  @Get('statistics')
  @Permissions('workspace.manage')
  async getStatistics() {
    const data = await this.settingsService.getStatistics();
    return {
      success: true,
      data,
    };
  }

  @Post('holiday-calendars')
  @Permissions('workspace.manage')
  async createHolidayCalendar(@Body() dto: CreateHolidayCalendarDto) {
    const data = await this.settingsService.createHolidayCalendar(dto);
    return {
      success: true,
      data,
    };
  }

  @Get('holiday-calendars')
  @Permissions('workspace.manage')
  async getHolidayCalendars() {
    const data = await this.settingsService.getHolidayCalendars();
    return {
      success: true,
      data,
    };
  }

  @Post('holidays')
  @Permissions('workspace.manage')
  async createHoliday(@Body() dto: CreateHolidayDto) {
    const data = await this.settingsService.createHoliday(dto);
    return {
      success: true,
      data,
    };
  }

  @Get('holiday-calendars/:calendarId/holidays')
  @Permissions('workspace.manage')
  async getHolidays(@Param('calendarId') calendarId: string) {
    const data = await this.settingsService.getHolidays(calendarId);
    return {
      success: true,
      data,
    };
  }
}
