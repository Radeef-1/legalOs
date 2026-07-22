import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { PermissionsGuard } from '../../shared/guards/permissions.guard';
import { Permissions } from '../../shared/decorators/permissions.decorator';

@Controller('workflow/approvals')
@UseGuards(AuthGuard, PermissionsGuard)
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Get('pending')
  @Permissions('workflow.approvals.view')
  async getPendingApprovals(@Query('approverId') approverId: string) {
    const data = await this.approvalsService.findPendingForApprover(approverId);
    return { success: true, data };
  }

  @Post(':id/decide')
  @Permissions('workflow.approvals.decide')
  async decide(
    @Param('id') id: string,
    @Body('status') status: 'APPROVED' | 'REJECTED',
    @Body('comments') comments?: string,
  ) {
    const data = await this.approvalsService.decide(id, status, comments);
    return { success: true, data };
  }
}
