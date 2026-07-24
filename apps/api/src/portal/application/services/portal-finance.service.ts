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
   * Processes online Mada / Credit Card invoice payment via Payment Gateway validation adapter.
   */
  async payInvoiceOnline(organizationId: string, clientId: string, dto: PayInvoiceOnlineDto) {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const invoice = await (this.prisma.db as any).invoice.findFirst({
        where: { id: dto.invoiceId, organizationId, clientId },
      });

      if (!invoice) {
        throw new NotFoundException(`الفاتورة رقم [${dto.invoiceId}] غير موجودة.`);
      }

      if (invoice.status === 'paid') {
        throw new BadRequestException(`الفاتورة رقم [${invoice.invoiceNumber}] مدفوعة بالكامل سلفاً.`);
      }

      if (!dto.cardToken || dto.cardToken.trim().length < 8) {
        throw new BadRequestException('رمز بطاقة الدفع (Card Token) غير صالحة أو مفقودة.');
      }

      // Simulate Payment Gateway Capture (Moyasar / HyperPay Adapter)
      const isCaptured = this.simulatePaymentGatewayCapture(dto.cardToken, invoice.totalAmount);
      if (!isCaptured) {
        throw new BadRequestException('فشلت عملية الدفع الإلكتروني عبر البوابة المالية. يرجى التأكد من بيانات البطاقة.');
      }

      const paymentReference = `PAY_PORTAL_${Date.now()}_${Math.random().toString(36).substring(7).toUpperCase()}`;

      // Create Payment Transaction Record
      const payment = await (this.prisma.db as any).payment.create({
        data: {
          organizationId,
          invoiceId: invoice.id,
          amountPaid: invoice.totalAmount,
          paymentMethod: dto.paymentMethod || 'CREDIT_CARD',
          referenceNumber: paymentReference,
          paidAt: new Date(),
        },
      });

      // Update Invoice Status only after successful payment gateway capture
      await (this.prisma.db as any).invoice.update({
        where: { id: invoice.id },
        data: { status: 'paid', paidAmount: invoice.totalAmount, balanceDue: 0.0 },
      });

      this.logger.log(
        `[Portal Finance] Invoice [${invoice.invoiceNumber}] captured successfully via ${dto.paymentMethod} (Ref: ${paymentReference})`,
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

  /**
   * Payment Gateway Adapter Verification
   */
  private simulatePaymentGatewayCapture(cardToken: string, amount: number): boolean {
    if (cardToken.includes('INVALID') || cardToken.includes('FAIL')) {
      return false;
    }
    return true;
  }
}
