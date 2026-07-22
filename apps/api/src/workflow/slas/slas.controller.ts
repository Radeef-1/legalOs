import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SlasService } from './slas.service';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { PermissionsGuard } from '../../shared/guards/permissions.guard';
import { Permissions } from '../../shared/decorators/permissions.decorator';

@Controller('workflow/slas')
@UseGuards(AuthGuard, PermissionsGuard)
export class SlasController {
  constructor(private readonly slasService: SlasService) {}

  @Post()
  @Permissions('workflow.slas.manage')
  async create(@Body() dto: any) {
    const data = await this.slasService.create(dto);
    return { success: true, data };
  }

  @Get('check-overdue')
  @Permissions('workflow.slas.view')
  async checkOverdue() {
    const data = await this.slasService.checkOverdueExecutions();
    return { success: true, data };
  }
}
