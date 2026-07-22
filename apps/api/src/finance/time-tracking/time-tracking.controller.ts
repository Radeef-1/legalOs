import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { TimeTrackingService, CreateTimeEntryDto } from './time-tracking.service';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { PermissionsGuard } from '../../shared/guards/permissions.guard';
import { Permissions } from '../../shared/decorators/permissions.decorator';
import { PolicyGuard } from '../../shared/policy/guards/policy.guard';
import { CheckPolicy } from '../../shared/policy/decorators/check-policy.decorator';
import { TimeEntryStatus } from '@prisma/client';

@Controller('finance/time-entries')
@UseGuards(AuthGuard, PermissionsGuard, PolicyGuard)
export class TimeTrackingController {
  constructor(private readonly timeTrackingService: TimeTrackingService) {}

  @Post()
  @Permissions('finance.time.create')
  @CheckPolicy('finance.time.create', 'TimeEntry')
  async create(@Body() dto: any) {
    const data = await this.timeTrackingService.create(dto);
    return { success: true, data };
  }

  @Get()
  @Permissions('finance.time.view')
  @CheckPolicy('finance.time.view', 'TimeEntry')
  async findAll(
    @Query('caseId') caseId?: string,
    @Query('memberId') memberId?: string,
    @Query('status') status?: string,
  ) {
    const data = await this.timeTrackingService.findAll(caseId, memberId, status as TimeEntryStatus);
    return { success: true, data };
  }

  @Get(':id')
  @Permissions('finance.time.view')
  @CheckPolicy('finance.time.view', 'TimeEntry')
  async findOne(@Param('id') id: string) {
    const data = await this.timeTrackingService.findOne(id);
    return { success: true, data };
  }

  @Delete(':id')
  @Permissions('finance.time.delete')
  @CheckPolicy('finance.time.delete', 'TimeEntry')
  async remove(@Param('id') id: string) {
    await this.timeTrackingService.remove(id);
    return { success: true, message: 'Time entry deleted successfully' };
  }
}
