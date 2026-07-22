import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { TenantContext } from '../../../shared/tenant/tenant.context';

export interface ExecutiveKpisResult {
  totalRevenueSar: number;
  totalTrustBalanceSar: number;
  activeCasesCount: number;
  totalInvoicesIssued: number;
  totalCollectionRatePercent: number;
  generatedAt: Date;
}

@Injectable()
export class ExecutiveAnalyticsService {
  private readonly logger = new Logger(ExecutiveAnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculates Executive Level BI Dashboard KPIs for the organization.
   */
  async getExecutiveKpis(organizationId: string): Promise<ExecutiveKpisResult> {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      // 1. Total Invoices Issued & Payments
      const invoices = await (this.prisma.db as any).invoice.findMany({
        where: { organizationId },
      });

      const activeCasesCount = await (this.prisma.db as any).case.count({
        where: { organizationId, deletedAt: null },
      });

      const trustAccounts = await (this.prisma.db as any).trustAccount.findMany({
        where: { organizationId },
      });

      let totalRevenueSar = 0;
      let totalInvoicesAmount = 0;

      for (const inv of invoices) {
        totalInvoicesAmount += Number(inv.totalAmount || 0);
        if (inv.status === 'paid') {
          totalRevenueSar += Number(inv.totalAmount || 0);
        }
      }

      let totalTrustBalanceSar = 0;
      for (const trust of trustAccounts) {
        totalTrustBalanceSar += Number(trust.balance || 0);
      }

      const totalCollectionRatePercent =
        totalInvoicesAmount > 0 ? Number(((totalRevenueSar / totalInvoicesAmount) * 100).toFixed(2)) : 100;

      this.logger.log(`[Executive BI] Calculated KPIs for Tenant [${organizationId}]: Revenue ${totalRevenueSar} SAR`);

      return {
        totalRevenueSar,
        totalTrustBalanceSar,
        activeCasesCount,
        totalInvoicesIssued: invoices.length,
        totalCollectionRatePercent,
        generatedAt: new Date(),
      };
    });
  }
}
