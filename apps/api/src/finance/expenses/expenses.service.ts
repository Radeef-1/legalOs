import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { TenantContext } from '../../shared/tenant/tenant.context';
import { ExpenseStatus } from '@prisma/client';

export interface CreateExpenseDto {
  caseId?: string;
  clientId?: string;
  memberId: string;
  category: string;
  description: string;
  amount: number;
  vatAmount?: number;
  isBillable?: boolean;
  receiptUrl?: string;
  date?: string | Date;
}

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateExpenseDto) {
    const tenantId = TenantContext.getTenantId();

    return this.prisma.db.expense.create({
      data: {
        organizationId: tenantId,
        caseId: dto.caseId ?? null,
        clientId: dto.clientId ?? null,
        memberId: dto.memberId,
        category: dto.category,
        description: dto.description,
        amount: dto.amount,
        vatAmount: dto.vatAmount ?? 0,
        isBillable: dto.isBillable ?? true,
        status: ExpenseStatus.UNBILLED,
        receiptUrl: dto.receiptUrl ?? null,
        date: dto.date ? new Date(dto.date) : new Date(),
      },
      include: {
        member: { include: { user: { select: { fullName: true } } } },
        case: { select: { caseNumberInternal: true } },
        client: { select: { name: true } },
      },
    });
  }

  async findAll(caseId?: string, clientId?: string, status?: ExpenseStatus) {
    const tenantId = TenantContext.getTenantId();
    return this.prisma.db.expense.findMany({
      where: {
        organizationId: tenantId,
        ...(caseId ? { caseId } : {}),
        ...(clientId ? { clientId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        member: { include: { user: { select: { fullName: true } } } },
        case: { select: { caseNumberInternal: true } },
        client: { select: { name: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    const tenantId = TenantContext.getTenantId();
    const expense = await this.prisma.db.expense.findFirst({
      where: { id, organizationId: tenantId },
      include: {
        member: { include: { user: { select: { fullName: true } } } },
        case: { select: { caseNumberInternal: true } },
        client: { select: { name: true } },
      },
    });

    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }

    return expense;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.db.expense.delete({ where: { id } });
  }
}
