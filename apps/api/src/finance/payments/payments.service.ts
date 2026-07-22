import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { TenantContext } from '../../shared/tenant/tenant.context';
import { PaymentMethod, InvoiceStatus } from '@prisma/client';

export interface RecordPaymentDto {
  invoiceId: string;
  amountPaid: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
}

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async recordPayment(dto: RecordPaymentDto) {
    const tenantId = TenantContext.getTenantId();
    const userId = TenantContext.getUserId();

    const invoice = await this.prisma.db.invoice.findFirst({
      where: { id: dto.invoiceId, organizationId: tenantId },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${dto.invoiceId} not found`);
    }

    const balanceDue = Number(invoice.balanceDue);
    if (dto.amountPaid <= 0) {
      throw new BadRequestException('مبلغ الدفعة يجب أن يكون أكبر من 0');
    }

    if (dto.amountPaid > balanceDue) {
      throw new BadRequestException(`مبلغ الدفعة (${dto.amountPaid} ر.س) يتجاوز الرصيد المتبقي (${balanceDue} ر.س)`);
    }

    const payment = await this.prisma.db.payment.create({
      data: {
        organizationId: tenantId,
        invoiceId: invoice.id,
        amountPaid: dto.amountPaid,
        paymentMethod: dto.paymentMethod,
        referenceNumber: dto.referenceNumber ?? null,
        notes: dto.notes ?? null,
        createdById: userId,
      },
    });

    const newPaidAmount = Number((Number(invoice.paidAmount) + dto.amountPaid).toFixed(2));
    const newBalanceDue = Number((Number(invoice.totalAmount) - newPaidAmount).toFixed(2));
    const newStatus = newBalanceDue <= 0.01 ? InvoiceStatus.paid : InvoiceStatus.partially_paid;

    await this.prisma.db.invoice.update({
      where: { id: invoice.id },
      data: {
        paidAmount: newPaidAmount,
        balanceDue: newBalanceDue < 0 ? 0 : newBalanceDue,
        status: newStatus,
      },
    });

    return payment;
  }

  async findAll(invoiceId?: string) {
    const tenantId = TenantContext.getTenantId();
    return this.prisma.db.payment.findMany({
      where: {
        organizationId: tenantId,
        ...(invoiceId ? { invoiceId } : {}),
      },
      include: {
        invoice: { select: { invoiceNumber: true, client: { select: { name: true } } } },
      },
      orderBy: { paidAt: 'desc' },
    });
  }
}
