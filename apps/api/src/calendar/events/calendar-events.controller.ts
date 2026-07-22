import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CalendarEventsService } from './calendar-events.service';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { PermissionsGuard } from '../../shared/guards/permissions.guard';
import { Permissions } from '../../shared/decorators/permissions.decorator';
import { PolicyGuard } from '../../shared/policy/guards/policy.guard';
import { CheckPolicy } from '../../shared/policy/decorators/check-policy.decorator';

@Controller('calendar/events')
@UseGuards(AuthGuard, PermissionsGuard, PolicyGuard)
export class CalendarEventsController {
  constructor(private readonly calendarEventsService: CalendarEventsService) {}

  @Post()
  @Permissions('calendar.events.create')
  @CheckPolicy('calendar.events.create', 'CalendarEvent')
  async create(@Body() dto: any) {
    const data = await this.calendarEventsService.create(dto);
    return { success: true, data };
  }

  @Get('check-conflicts')
  @Permissions('calendar.events.view')
  async checkConflicts(
    @Query('organizerId') organizerId: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    const data = await this.calendarEventsService.checkConflicts(organizerId, new Date(startTime), new Date(endTime));
    return { success: true, data };
  }

  @Get()
  @Permissions('calendar.events.view')
  @CheckPolicy('calendar.events.view', 'CalendarEvent')
  async findAll(
    @Query('organizerId') organizerId?: string,
    @Query('caseId') caseId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    const data = await this.calendarEventsService.findAll(organizerId, caseId, fromDate, toDate);
    return { success: true, data };
  }

  @Get(':id')
  @Permissions('calendar.events.view')
  @CheckPolicy('calendar.events.view', 'CalendarEvent')
  async findOne(@Param('id') id: string) {
    const data = await this.calendarEventsService.findOne(id);
    return { success: true, data };
  }

  @Delete(':id')
  @Permissions('calendar.events.delete')
  @CheckPolicy('calendar.events.delete', 'CalendarEvent')
  async remove(@Param('id') id: string) {
    await this.calendarEventsService.remove(id);
    return { success: true, message: 'Calendar event deleted successfully' };
  }
}
