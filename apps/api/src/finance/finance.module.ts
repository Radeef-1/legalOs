import { Module } from '@nestjs/common';
import { PrismaModule } from '../shared/database/prisma.module';
import { TimeTrackingService } from './time-tracking/time-tracking.service';
import { TimeTrackingController } from './time-tracking/time-tracking.controller';
import { ExpensesService } from './expenses/expenses.service';
import { ExpensesController } from './expenses/expenses.controller';
import { InvoicesService } from './invoices/invoices.service';
import { InvoicesController } from './invoices/invoices.controller';
import { TrustAccountsService } from './trust-accounts/trust-accounts.service';
import { TrustAccountsController } from './trust-accounts/trust-accounts.controller';
import { PaymentsService } from './payments/payments.service';
import { PaymentsController } from './payments/payments.controller';
import { FinancialReportsService } from './reports/financial-reports.service';
import { FinancialReportsController } from './reports/financial-reports.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    TimeTrackingController,
    ExpensesController,
    InvoicesController,
    TrustAccountsController,
    PaymentsController,
    FinancialReportsController,
  ],
  providers: [
    TimeTrackingService,
    ExpensesService,
    InvoicesService,
    TrustAccountsService,
    PaymentsService,
    FinancialReportsService,
  ],
  exports: [
    TimeTrackingService,
    ExpensesService,
    InvoicesService,
    TrustAccountsService,
    PaymentsService,
    FinancialReportsService,
  ],
})
export class FinanceModule {}
