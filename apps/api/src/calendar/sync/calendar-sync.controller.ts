import { Controller, Get, Post, Body, Param, Query, Res, HttpStatus, UseGuards } from '@nestjs/common';
import { CalendarSyncService } from './calendar-sync.service';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { PermissionsGuard } from '../../shared/guards/permissions.guard';
import { Permissions } from '../../shared/decorators/permissions.decorator';
import { CalendarSyncProvider } from '@prisma/client';
import * as express from 'express';

@Controller('calendar/sync')
export class CalendarSyncController {
  constructor(private readonly calendarSyncService: CalendarSyncService) {}

  @Get('ical/:memberId')
  async downloadICalFeed(@Param('memberId') memberId: string, @Res() res: express.Response) {
    const icalContent = await this.calendarSyncService.exportICalFeed(memberId);
    res.set({
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="legalos-calendar-${memberId}.ics"`,
    });
    return res.status(HttpStatus.OK).send(icalContent);
  }

  @Post('credentials')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('calendar.sync.manage')
  async registerCredential(@Body() dto: any) {
    const data = await this.calendarSyncService.registerCredential(dto);
    return { success: true, data };
  }

  @Get('status')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('calendar.sync.view')
  async getSyncStatus(@Query('memberId') memberId: string) {
    const data = await this.calendarSyncService.getSyncStatus(memberId);
    return { success: true, data };
  }

  @Post('trigger')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('calendar.sync.manage')
  async triggerSync(@Body('memberId') memberId: string, @Body('provider') provider: string) {
    const data = await this.calendarSyncService.triggerSync(memberId, provider as CalendarSyncProvider);
    return { success: true, data };
  }
}
