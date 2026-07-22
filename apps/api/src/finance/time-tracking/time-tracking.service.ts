import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { TenantContext } from '../../shared/tenant/tenant.context';
import { TimeEntryStatus } from '@prisma/client';

export interface CreateTimeEntryDto {
  caseId?: string;
  memberId: string;
  description: string;
  hours: number;
  hourlyRate: number;
  isBillable?: boolean;
  date?: string | Date;
}

@Injectable()
export class TimeTrackingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTimeEntryDto) {
    const tenantId = TenantContext.getTenantId();
    const userId = TenantContext.getUserId();
    const totalAmount = Number((dto.hours * dto.hourlyRate).toFixed(2));

    return this.prisma.db.timeEntry.create({
      data: {
        organizationId: tenantId,
        caseId: dto.caseId ?? null,
        memberId: dto.memberId,
        description: dto.description,
        hours: dto.hours,
        hourlyRate: dto.hourlyRate,
        totalAmount,
        isBillable: dto.isBillable ?? true,
        status: TimeEntryStatus.UNBILLED,
        date: dto.date ? new Date(dto.date) : new Date(),
        createdById: userId,
      },
      include: {
        member: { include: { user: { select: { fullName: true, email: true } } } },
        case: { select: { caseNumberInternal: true } },
      },
    });
  }

  async findAll(caseId?: string, memberId?: string, status?: TimeEntryStatus) {
    const tenantId = TenantContext.getTenantId();
    return this.prisma.db.timeEntry.findMany({
      where: {
        organizationId: tenantId,
        ...(caseId ? { caseId } : {}),
        ...(memberId ? { memberId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        member: { include: { user: { select: { fullName: true } } } },
        case: { select: { caseNumberInternal: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    const tenantId = TenantContext.getTenantId();
    const entry = await this.prisma.db.timeEntry.findFirst({
      where: { id, organizationId: tenantId },
      include: {
        member: { include: { user: { select: { fullName: true } } } },
        case: { select: { caseNumberInternal: true } },
      },
    });

    if (!entry) {
      throw new NotFoundException(`TimeEntry with ID ${id} not found`);
    }

    return entry;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.db.timeEntry.delete({ where: { id } });
  }
}
