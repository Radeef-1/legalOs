import { Module } from '@nestjs/common';
import { PrismaModule } from '../shared/database/prisma.module';
import { ExecutiveAnalyticsService } from './application/services/executive-analytics.service';
import { LawyerPerformanceService } from './application/services/lawyer-performance.service';
import { ZatcaTaxReportService } from './application/services/zatca-tax-report.service';
import { ReportExportService } from './application/services/report-export.service';
import { ReportsController } from './controllers/reports.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ReportsController],
  providers: [
    ExecutiveAnalyticsService,
    LawyerPerformanceService,
    ZatcaTaxReportService,
    ReportExportService,
  ],
  exports: [
    ExecutiveAnalyticsService,
    LawyerPerformanceService,
    ZatcaTaxReportService,
    ReportExportService,
  ],
})
export class ReportsModule {}
