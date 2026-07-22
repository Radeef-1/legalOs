import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { TenantContext } from '../../shared/tenant/tenant.context';
import { TimeEntryStatus, ExpenseStatus } from '@prisma/client';

@Injectable()
export class FinancialReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getExecutiveDashboard() {
    const tenantId = TenantContext.getTenantId();

    // 1. Total Revenue Collected
    const paymentsAgg = await this.prisma.db.payment.aggregate({
      where: { organizationId: tenantId },
      _sum: { amountPaid: true },
    });
    const totalRevenue = Number(paymentsAgg._sum.amountPaid ?? 0);

    // 2. Unbilled Work In Progress (WIP)
    const timeEntriesAgg = await this.prisma.db.timeEntry.aggregate({
      where: { organizationId: tenantId, status: TimeEntryStatus.UNBILLED },
      _sum: { totalAmount: true },
    });
    const unbilledHoursAmount = Number(timeEntriesAgg._sum.totalAmount ?? 0);

    const expenses = await this.prisma.db.expense.findMany({
      where: { organizationId: tenantId, status: ExpenseStatus.UNBILLED },
    });
    const unbilledExpensesAmount = expenses.reduce((acc, exp) => acc + Number(exp.amount) + Number(exp.vatAmount), 0);

    const totalUnbilledWip = Number((unbilledHoursAmount + unbilledExpensesAmount).toFixed(2));

    // 3. Outstanding Invoices Balance Due
    const invoicesAgg = await this.prisma.db.invoice.aggregate({
      where: {
        organizationId: tenantId,
        status: { in: ['issued', 'partially_paid', 'overdue'] },
      },
      _sum: { balanceDue: true },
    });
    const totalOutstandingInvoices = Number(invoicesAgg._sum.balanceDue ?? 0);

    // 4. Total Trust Account Balances
    const trustAgg = await this.prisma.db.trustAccount.aggregate({
      where: { organizationId: tenantId },
      _sum: { balance: true },
    });
    const totalTrustBalances = Number(trustAgg._sum.balance ?? 0);

    return {
      totalRevenue,
      totalUnbilledWip,
      unbilledHoursAmount,
      unbilledExpensesAmount,
      totalOutstandingInvoices,
      totalTrustBalances,
      currency: 'SAR',
    };
  }
}
