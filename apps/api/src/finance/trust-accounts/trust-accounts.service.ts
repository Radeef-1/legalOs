import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { TenantContext } from '../../shared/tenant/tenant.context';
import { TrustTransactionType, PaymentMethod, InvoiceStatus } from '@prisma/client';

export interface DepositTrustDto {
  clientId: string;
  caseId?: string;
  amount: number;
  referenceNumber?: string;
  description?: string;
}

export interface DrawTrustDto {
  trustAccountId: string;
  invoiceId: string;
  amount: number;
  description?: string;
}

@Injectable()
export class TrustAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateAccount(clientId: string, caseId?: string) {
    const tenantId = TenantContext.getTenantId();

    const existing = await this.prisma.db.trustAccount.findFirst({
      where: {
        organizationId: tenantId,
        clientId,
        caseId: caseId ?? null,
      },
      include: {
        client: { select: { name: true } },
        case: { select: { caseNumberInternal: true } },
        transactions: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (existing) return existing;

    return this.prisma.db.trustAccount.create({
      data: {
        organizationId: tenantId,
        clientId,
        caseId: caseId ?? null,
        balance: 0.0,
      },
      include: {
        client: { select: { name: true } },
        case: { select: { caseNumberInternal: true } },
        transactions: true,
      },
    });
  }

  async deposit(dto: DepositTrustDto) {
    const account = await this.getOrCreateAccount(dto.clientId, dto.caseId);

    const transaction = await this.prisma.db.trustTransaction.create({
      data: {
        trustAccountId: account.id,
        type: TrustTransactionType.DEPOSIT,
        amount: dto.amount,
        referenceNumber: dto.referenceNumber ?? null,
        description: dto.description ?? 'إيداع عربون / حساب أمانة عميل',
      },
    });

    const updatedAccount = await this.prisma.db.trustAccount.update({
      where: { id: account.id },
      data: {
        balance: Number(account.balance) + dto.amount,
      },
      include: {
        client: { select: { name: true } },
        transactions: { orderBy: { createdAt: 'desc' } },
      },
    });

    return { account: updatedAccount, transaction };
  }

  async drawToInvoice(dto: DrawTrustDto) {
    const tenantId = TenantContext.getTenantId();
    const userId = TenantContext.getUserId();

    const account = await this.prisma.db.trustAccount.findFirst({
      where: { id: dto.trustAccountId, organizationId: tenantId },
    });

    if (!account) {
      throw new NotFoundException(`Trust Account with ID ${dto.trustAccountId} not found`);
    }

    if (Number(account.balance) < dto.amount) {
      throw new BadRequestException(
        `رصيد حساب الأمانة المتاح (${account.balance} ر.س) لا يكفي لسداد المبلغ المطلوب (${dto.amount} ر.س)`,
      );
    }

    const invoice = await this.prisma.db.invoice.findFirst({
      where: { id: dto.invoiceId, organizationId: tenantId },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${dto.invoiceId} not found`);
    }

    const balanceDue = Number(invoice.balanceDue);
    if (balanceDue < dto.amount) {
      throw new BadRequestException(
        `المبلغ المطلوب سحبه (${dto.amount} ر.س) يتجاوز الرصيد المتبقي على الفاتورة (${balanceDue} ر.س)`,
      );
    }

    // Execute in transaction
    const transaction = await this.prisma.db.trustTransaction.create({
      data: {
        trustAccountId: account.id,
        type: TrustTransactionType.WITHDRAWAL_TO_INVOICE,
        amount: dto.amount,
        invoiceId: invoice.id,
        description: dto.description ?? `سداد فاتورة رقم ${invoice.invoiceNumber} من حساب الأمانة`,
      },
    });

    await this.prisma.db.trustAccount.update({
      where: { id: account.id },
      data: {
        balance: Number(account.balance) - dto.amount,
      },
    });

    const newPaidAmount = Number(invoice.paidAmount) + dto.amount;
    const newBalanceDue = Number(invoice.totalAmount) - newPaidAmount;
    const newStatus = newBalanceDue <= 0.01 ? InvoiceStatus.paid : InvoiceStatus.partially_paid;

    const updatedInvoice = await this.prisma.db.invoice.update({
      where: { id: invoice.id },
      data: {
        paidAmount: newPaidAmount,
        balanceDue: newBalanceDue < 0 ? 0 : newBalanceDue,
        status: newStatus,
      },
    });

    // Record Payment Entry
    await this.prisma.db.payment.create({
      data: {
        organizationId: tenantId,
        invoiceId: invoice.id,
        amountPaid: dto.amount,
        paymentMethod: PaymentMethod.TRUST_DRAW,
        referenceNumber: transaction.id,
        notes: `خصم سداد آلي من حساب الأمانة (${account.id})`,
        createdById: userId,
      },
    });

    return { transaction, invoice: updatedInvoice };
  }

  async getAccountLedger(trustAccountId: string) {
    const tenantId = TenantContext.getTenantId();
    const account = await this.prisma.db.trustAccount.findFirst({
      where: { id: trustAccountId, organizationId: tenantId },
      include: {
        client: { select: { name: true, nationalIdOrCr: true } },
        case: { select: { caseNumberInternal: true } },
        transactions: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!account) {
      throw new NotFoundException(`Trust Account with ID ${trustAccountId} not found`);
    }

    return account;
  }
}
