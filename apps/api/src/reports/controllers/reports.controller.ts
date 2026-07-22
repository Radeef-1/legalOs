import { Controller, Get, Post, Body, Query, Headers } from '@nestjs/common';
import { ExecutiveAnalyticsService } from '../application/services/executive-analytics.service';
import { LawyerPerformanceService } from '../application/services/lawyer-performance.service';
import { ZatcaTaxReportService } from '../application/services/zatca-tax-report.service';
import { ReportExportService, ReportExportRequest } from '../application/services/report-export.service';

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly executiveService: ExecutiveAnalyticsService,
    private readonly lawyerService: LawyerPerformanceService,
    private readonly zatcaService: ZatcaTaxReportService,
    private readonly exportService: ReportExportService,
  ) {}

  @Get('executive')
  async getExecutiveKpis(@Headers('x-organization-id') organizationId: string) {
    return this.executiveService.getExecutiveKpis(organizationId);
  }

  @Get('lawyer-performance')
  async getLawyerPerformance(@Headers('x-organization-id') organizationId: string) {
    return this.lawyerService.getLawyerPerformance(organizationId);
  }

  @Get('zatca-vat')
  async getZatcaVatReturn(
    @Headers('x-organization-id') organizationId: string,
    @Query('periodQuarter') periodQuarter?: string,
  ) {
    return this.zatcaService.generateZatcaVatReturn(organizationId, periodQuarter);
  }

  @Post('export')
  async exportReport(@Body() dto: ReportExportRequest) {
    return this.exportService.exportReport(dto);
  }
}
