import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../shared/database/prisma.service';

export interface DepositTrustDto {
  organizationId: string;
  clientId: string;
  caseId?: string;
  amount: number;
  referenceNumber?: string;
  description: string;
}

export interface WithdrawTrustToInvoiceDto {
  organizationId: string;
  clientId: string;
  caseId?: string;
  invoiceId: string;
  amount: number;
  description: string;
}

@Injectable()
export class TrustAccountingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * إيداع مبلغ أمانة جديد في حساب الموكل
   */
  async depositTrustFund(dto: DepositTrustDto) {
    if (dto.amount <= 0) {
      throw new BadRequestException('مبلغ الإيداع يجب أن يكون أكبر من صفر');
    }

    // البحث عن حساب الأمانة أو إنشائه إن لم يكن موجوداً
    let trustAccount = await this.prisma.trustAccount.findFirst({
      where: {
        organizationId: dto.organizationId,
        clientId: dto.clientId,
        caseId: dto.caseId || null,
      },
    });

    if (!trustAccount) {
      trustAccount = await this.prisma.trustAccount.create({
        data: {
          organizationId: dto.organizationId,
          clientId: dto.clientId,
          caseId: dto.caseId || null,
          balance: 0,
        },
      });
    }

    // تسجيل العملية وتحديث الرصيد داخل معاملة واحدة (Transaction)
    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.trustTransaction.create({
        data: {
          trustAccountId: trustAccount.id,
          type: 'DEPOSIT',
          amount: dto.amount,
          referenceNumber: dto.referenceNumber,
          description: dto.description,
        },
      });

      const updatedAccount = await tx.trustAccount.update({
        where: { id: trustAccount.id },
        data: {
          balance: {
            increment: dto.amount,
          },
        },
      });

      return {
        success: true,
        account: updatedAccount,
        transaction,
      };
    });
  }

  /**
   * سحب مبلغ أمانة لسداد فاتورة قائمة للمكتب (Transfer Trust Retainer to Paid Invoice)
   */
  async withdrawTrustFundToInvoice(dto: WithdrawTrustToInvoiceDto) {
    if (dto.amount <= 0) {
      throw new BadRequestException('المبلغ المسحوب يجب أن يكون أكبر من صفر');
    }

    const trustAccount = await this.prisma.trustAccount.findFirst({
      where: {
        organizationId: dto.organizationId,
        clientId: dto.clientId,
        caseId: dto.caseId || null,
      },
    });

    if (!trustAccount) {
      throw new NotFoundException('حساب أمانات الموكل غير موجود');
    }

    if (Number(trustAccount.balance) < dto.amount) {
      throw new BadRequestException(
        `رصيد الأمانة الحالي (${trustAccount.balance} ر.س) لا يكفي لتغطية المبلغ المطلوب (${dto.amount} ر.س)`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. تسجيل معاملة السحب من الأمانة
      const trustTx = await tx.trustTransaction.create({
        data: {
          trustAccountId: trustAccount.id,
          type: 'WITHDRAWAL_TO_INVOICE',
          amount: dto.amount,
          invoiceId: dto.invoiceId,
          description: dto.description,
        },
      });

      // 2. تحديث رصيد الأمانة
      const updatedAccount = await tx.trustAccount.update({
        where: { id: trustAccount.id },
        data: {
          balance: {
            decrement: dto.amount,
          },
        },
      });

      // 3. خصم المبلغ من الفاتورة وتحديث حالة السداد
      const invoice = await tx.invoice.findUnique({
        where: { id: dto.invoiceId },
      });

      if (invoice) {
        const newPaid = Number(invoice.paidAmount) + dto.amount;
        const total = Number(invoice.totalAmount);
        const newBalance = Math.max(0, total - newPaid);
        const newStatus = newBalance === 0 ? 'paid' : newPaid > 0 ? 'partially_paid' : invoice.status;

        await tx.invoice.update({
          where: { id: dto.invoiceId },
          data: {
            paidAmount: newPaid,
            balanceDue: newBalance,
            status: newStatus,
          },
        });

        // 4. تسجيل سداد في سجل الدفعات
        await tx.payment.create({
          data: {
            organizationId: dto.organizationId,
            invoiceId: dto.invoiceId,
            amountPaid: dto.amount,
            paymentMethod: 'TRUST_DRAW',
            notes: `سداد من رصيد أمانات الموكل: ${dto.description}`,
          },
        });
      }

      return {
        success: true,
        account: updatedAccount,
        trustTransaction: trustTx,
      };
    });
  }

  /**
   * الاستعلام عن رصيد حسابات أمانات الموكل
   */
  async getClientTrustBalance(organizationId: string, clientId: string) {
    const accounts = await this.prisma.trustAccount.findMany({
      where: { organizationId, clientId },
      include: {
        case: {
          select: { caseNumberInternal: true, caseType: true, courtName: true },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    const totalBalance = accounts.reduce((acc, curr) => acc + Number(curr.balance), 0);

    return {
      totalBalance,
      accounts,
    };
  }
}
