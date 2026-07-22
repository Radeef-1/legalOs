import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { TenantContext } from '../../../shared/tenant/tenant.context';

export interface ZatcaVatReturnSummary {
  organizationId: string;
  periodQuarter: string; // e.g. "Q3 2026"
  totalTaxableSalesSar: number;
  vatCollectedSar: number; // 15% VAT
  totalReimbursableExpensesSar: number;
  vatDeductibleOnExpensesSar: number;
  netVatPayableSar: number;
  generatedAt: Date;
}

@Injectable()
export class ZatcaTaxReportService {
  private readonly logger = new Logger(ZatcaTaxReportService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates official ZATCA 15% VAT Return report calculation for filing.
   */
  async generateZatcaVatReturn(organizationId: string, periodQuarter = 'Q3 2026'): Promise<ZatcaVatReturnSummary> {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const invoices = await (this.prisma.db as any).invoice.findMany({
        where: { organizationId, status: 'paid' },
      });

      const expenses = await (this.prisma.db as any).expense.findMany({
        where: { organizationId },
      });

      let totalTaxableSalesSar = 0;
      let vatCollectedSar = 0;

      for (const inv of invoices) {
        const subtotal = Number(inv.subtotal || 0);
        const vat = Number(inv.taxAmount || 0);
        totalTaxableSalesSar += subtotal;
        vatCollectedSar += vat;
      }

      let totalReimbursableExpensesSar = 0;
      let vatDeductibleOnExpensesSar = 0;

      for (const exp of expenses) {
        const amt = Number(exp.amount || 0);
        totalReimbursableExpensesSar += amt;
        vatDeductibleOnExpensesSar += amt * 0.15; // 15% input VAT deductible
      }

      const netVatPayableSar = Number((vatCollectedSar - vatDeductibleOnExpensesSar).toFixed(2));

      this.logger.log(
        `[ZATCA VAT BI] Tenant [${organizationId}] VAT Payable for ${periodQuarter}: ${netVatPayableSar} SAR`,
      );

      return {
        organizationId,
        periodQuarter,
        totalTaxableSalesSar: Number(totalTaxableSalesSar.toFixed(2)),
        vatCollectedSar: Number(vatCollectedSar.toFixed(2)),
        totalReimbursableExpensesSar: Number(totalReimbursableExpensesSar.toFixed(2)),
        vatDeductibleOnExpensesSar: Number(vatDeductibleOnExpensesSar.toFixed(2)),
        netVatPayableSar,
        generatedAt: new Date(),
      };
    });
  }
}
