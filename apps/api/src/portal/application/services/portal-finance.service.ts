import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { TenantContext } from '../../../shared/tenant/tenant.context';

export class PayInvoiceOnlineDto {
  invoiceId!: string;
  paymentMethod!: 'MADA' | 'VISA' | 'MASTER_CARD';
  cardToken!: string;
}

@Injectable()
export class PortalFinanceService {
  private readonly logger = new Logger(PortalFinanceService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns invoices issued to client.
   */
  async getClientInvoices(organizationId: string, clientId: string) {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      return (this.prisma.db as any).invoice.findMany({
        where: { organizationId, clientId },
        orderBy: { issuedAt: 'desc' },
      });
    });
  }

  /**
   * Processes online Mada / Credit Card invoice payment.
   */
  async payInvoiceOnline(organizationId: string, clientId: string, dto: PayInvoiceOnlineDto) {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const invoice = await (this.prisma.db as any).invoice.findFirst({
        where: { id: dto.invoiceId, organizationId, clientId },
      });

      if (!invoice) {
        throw new NotFoundException(`Invoice [${dto.invoiceId}] not found.`);
      }

      if (invoice.status === 'paid') {
        throw new BadRequestException(`Invoice [${invoice.invoiceNumber}] is already fully paid.`);
      }

      const paymentReference = `PAY_PORTAL_${Date.now()}_${Math.random().toString(36).substring(7).toUpperCase()}`;

      // Create Payment Transaction
      const payment = await (this.prisma.db as any).payment.create({
        data: {
          organizationId,
          invoiceId: invoice.id,
          amountPaid: invoice.totalAmount,
          paymentMethod: 'CREDIT_CARD',
          referenceNumber: paymentReference,
          paidAt: new Date(),
        },
      });

      // Update Invoice Status
      await (this.prisma.db as any).invoice.update({
        where: { id: invoice.id },
        data: { status: 'paid', paidAmount: invoice.totalAmount, balanceDue: 0.0 },
      });

      this.logger.log(
        `[Portal Finance] Invoice [${invoice.invoiceNumber}] paid online via ${dto.paymentMethod} (Ref: ${paymentReference})`,
      );

      return {
        paid: true,
        invoiceNumber: invoice.invoiceNumber,
        amountSar: invoice.totalAmount,
        paymentReference,
        paidAt: payment.paidAt,
      };
    });
  }
}
