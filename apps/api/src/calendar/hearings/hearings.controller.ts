import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { HearingsService } from './hearings.service';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { PermissionsGuard } from '../../shared/guards/permissions.guard';
import { Permissions } from '../../shared/decorators/permissions.decorator';
import { PolicyGuard } from '../../shared/policy/guards/policy.guard';
import { CheckPolicy } from '../../shared/policy/decorators/check-policy.decorator';
import { HearingStatus } from '@prisma/client';

@Controller('calendar/hearings')
@UseGuards(AuthGuard, PermissionsGuard, PolicyGuard)
export class HearingsController {
  constructor(private readonly hearingsService: HearingsService) {}

  @Post()
  @Permissions('calendar.hearings.create')
  @CheckPolicy('calendar.hearings.create', 'Hearing')
  async create(@Body() dto: any) {
    const data = await this.hearingsService.create(dto);
    return { success: true, data };
  }

  @Get()
  @Permissions('calendar.hearings.view')
  @CheckPolicy('calendar.hearings.view', 'Hearing')
  async findAll(
    @Query('caseId') caseId?: string,
    @Query('assignedLawyerId') assignedLawyerId?: string,
    @Query('status') status?: string,
  ) {
    const data = await this.hearingsService.findAll(caseId, assignedLawyerId, status as HearingStatus);
    return { success: true, data };
  }

  @Get(':id')
  @Permissions('calendar.hearings.view')
  @CheckPolicy('calendar.hearings.view', 'Hearing')
  async findOne(@Param('id') id: string) {
    const data = await this.hearingsService.findOne(id);
    return { success: true, data };
  }

  @Patch(':id/status')
  @Permissions('calendar.hearings.update')
  @CheckPolicy('calendar.hearings.update', 'Hearing')
  async updateStatus(@Param('id') id: string, @Body('status') status: string, @Body('notes') notes?: string) {
    const data = await this.hearingsService.updateStatus(id, status as HearingStatus, notes);
    return { success: true, data };
  }

  @Delete(':id')
  @Permissions('calendar.hearings.delete')
  @CheckPolicy('calendar.hearings.delete', 'Hearing')
  async remove(@Param('id') id: string) {
    await this.hearingsService.remove(id);
    return { success: true, message: 'Hearing deleted successfully' };
  }
}
