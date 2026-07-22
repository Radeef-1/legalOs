import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { TenantContext } from '../../shared/tenant/tenant.context';
import { InvoiceStatus, TimeEntryStatus, ExpenseStatus } from '@prisma/client';

export interface CustomInvoiceItemDto {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateInvoiceDto {
  clientId: string;
  caseId?: string;
  dueDate?: string | Date;
  notes?: string;
  timeEntryIds?: string[];
  expenseIds?: string[];
  customItems?: CustomInvoiceItemDto[];
}

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInvoiceDto) {
    const tenantId = TenantContext.getTenantId();
    const userId = TenantContext.getUserId();

    // 1. Calculate auto-incremented invoice number
    const count = await this.prisma.db.invoice.count({
      where: { organizationId: tenantId },
    });
    const currentYear = new Date().getFullYear();
    const invoiceNumber = `INV-${currentYear}-${String(count + 1).padStart(4, '0')}`;

    // 2. Load selected time entries & expenses
    const timeEntries = dto.timeEntryIds?.length
      ? await this.prisma.db.timeEntry.findMany({
          where: { id: { in: dto.timeEntryIds }, organizationId: tenantId, status: TimeEntryStatus.UNBILLED },
        })
      : [];

    const expenses = dto.expenseIds?.length
      ? await this.prisma.db.expense.findMany({
          where: { id: { in: dto.expenseIds }, organizationId: tenantId, status: ExpenseStatus.UNBILLED },
        })
      : [];

    // 3. Construct line items
    const lineItems: Array<{ description: string; quantity: number; unitPrice: number; amount: number }> = [];

    for (const te of timeEntries) {
      const amt = Number(te.totalAmount);
      lineItems.push({
        description: `أتعاب قانونية: ${te.description} (${te.hours} ساعة @ ${te.hourlyRate} ر.س/ساعة)`,
        quantity: Number(te.hours),
        unitPrice: Number(te.hourlyRate),
        amount: amt,
      });
    }

    for (const exp of expenses) {
      const amt = Number(exp.amount) + Number(exp.vatAmount);
      lineItems.push({
        description: `مصروفات قضايا [${exp.category}]: ${exp.description}`,
        quantity: 1,
        unitPrice: amt,
        amount: amt,
      });
    }

    if (dto.customItems) {
      for (const item of dto.customItems) {
        const amt = Number((item.quantity * item.unitPrice).toFixed(2));
        lineItems.push({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: amt,
        });
      }
    }

    if (lineItems.length === 0) {
      throw new BadRequestException('يجب إضافة بنود فاتورة (ساعات عمل، مصاريف، أو بنود مخصصة)');
    }

    const subtotal = Number(lineItems.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2));
    const taxRate = 15.0; // 15% ZATCA VAT
    const taxAmount = Number((subtotal * (taxRate / 100)).toFixed(2));
    const totalAmount = Number((subtotal + taxAmount).toFixed(2));
    const balanceDue = totalAmount;

    // 4. Create Invoice in single transaction
    const invoice = await this.prisma.db.invoice.create({
      data: {
        organizationId: tenantId,
        invoiceNumber,
        clientId: dto.clientId,
        caseId: dto.caseId ?? null,
        subtotal,
        taxRate,
        taxAmount,
        totalAmount,
        paidAmount: 0.0,
        balanceDue,
        status: InvoiceStatus.issued,
        issuedAt: new Date(),
        dueDate: dto.dueDate ? new Date(dto.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
        notes: dto.notes ?? null,
        createdById: userId,
        items: {
          create: lineItems.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
          })),
        },
      },
      include: {
        items: true,
        client: { select: { name: true, nationalIdOrCr: true } },
        case: { select: { caseNumberInternal: true } },
      },
    });

    // 5. Update status of linked time entries & expenses to BILLED
    if (timeEntries.length > 0) {
      await this.prisma.db.timeEntry.updateMany({
        where: { id: { in: timeEntries.map((te) => te.id) } },
        data: { status: TimeEntryStatus.BILLED, invoiceId: invoice.id },
      });
    }

    if (expenses.length > 0) {
      await this.prisma.db.expense.updateMany({
        where: { id: { in: expenses.map((e) => e.id) } },
        data: { status: ExpenseStatus.BILLED, invoiceId: invoice.id },
      });
    }

    return invoice;
  }

  async findAll(clientId?: string, caseId?: string, status?: InvoiceStatus) {
    const tenantId = TenantContext.getTenantId();
    return this.prisma.db.invoice.findMany({
      where: {
        organizationId: tenantId,
        ...(clientId ? { clientId } : {}),
        ...(caseId ? { caseId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        client: { select: { name: true } },
        case: { select: { caseNumberInternal: true } },
        items: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const tenantId = TenantContext.getTenantId();
    const invoice = await this.prisma.db.invoice.findFirst({
      where: { id, organizationId: tenantId },
      include: {
        client: { select: { name: true, nationalIdOrCr: true, email: true, phone: true } },
        case: { select: { caseNumberInternal: true, courtName: true } },
        items: true,
        payments: true,
        trustDraws: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }

  async updateStatus(id: string, status: InvoiceStatus) {
    const invoice = await this.findOne(id);
    return this.prisma.db.invoice.update({
      where: { id: invoice.id },
      data: { status },
    });
  }

  async cancel(id: string) {
    const invoice = await this.findOne(id);
    return this.prisma.db.invoice.update({
      where: { id: invoice.id },
      data: { status: InvoiceStatus.cancelled },
    });
  }
}
