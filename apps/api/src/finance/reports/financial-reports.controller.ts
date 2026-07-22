import { Controller, Get, UseGuards } from '@nestjs/common';
import { FinancialReportsService } from './financial-reports.service';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { PermissionsGuard } from '../../shared/guards/permissions.guard';
import { Permissions } from '../../shared/decorators/permissions.decorator';

@Controller('finance/reports')
@UseGuards(AuthGuard, PermissionsGuard)
export class FinancialReportsController {
  constructor(private readonly financialReportsService: FinancialReportsService) {}

  @Get('dashboard')
  @Permissions('finance.reports.view')
  async getDashboard() {
    const data = await this.financialReportsService.getExecutiveDashboard();
    return { success: true, data };
  }
}
