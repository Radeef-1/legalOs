import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { TenantContext } from '../../shared/tenant/tenant.context';
import { HearingStatus } from '@prisma/client';

export interface CreateHearingDto {
  caseId: string;
  title: string;
  hearingDate: string | Date;
  endDate?: string | Date;
  courtName?: string;
  courtRoom?: string;
  judgeName?: string;
  assignedLawyerId?: string;
  meetingUrl?: string;
  notes?: string;
}

@Injectable()
export class HearingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateHearingDto) {
    const tenantId = TenantContext.getTenantId();
    const startDate = new Date(dto.hearingDate);
    const endDate = dto.endDate ? new Date(dto.endDate) : new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hr default

    return this.prisma.db.hearing.create({
      data: {
        organizationId: tenantId,
        caseId: dto.caseId,
        title: dto.title,
        hearingDate: startDate,
        endDate,
        courtName: dto.courtName ?? null,
        courtRoom: dto.courtRoom ?? null,
        judgeName: dto.judgeName ?? null,
        assignedLawyerId: dto.assignedLawyerId ?? null,
        meetingUrl: dto.meetingUrl ?? null,
        notes: dto.notes ?? null,
        status: HearingStatus.SCHEDULED,
      },
      include: {
        case: { select: { caseNumberInternal: true, courtName: true, client: { select: { name: true } } } },
        assignedLawyer: { include: { user: { select: { fullName: true } } } },
      },
    });
  }

  async findAll(caseId?: string, assignedLawyerId?: string, status?: HearingStatus) {
    const tenantId = TenantContext.getTenantId();
    return this.prisma.db.hearing.findMany({
      where: {
        organizationId: tenantId,
        ...(caseId ? { caseId } : {}),
        ...(assignedLawyerId ? { assignedLawyerId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        case: { select: { caseNumberInternal: true, courtName: true } },
        assignedLawyer: { include: { user: { select: { fullName: true } } } },
      },
      orderBy: { hearingDate: 'asc' },
    });
  }

  async findOne(id: string) {
    const tenantId = TenantContext.getTenantId();
    const hearing = await this.prisma.db.hearing.findFirst({
      where: { id, organizationId: tenantId },
      include: {
        case: { select: { caseNumberInternal: true, courtName: true, client: { select: { name: true } } } },
        assignedLawyer: { include: { user: { select: { fullName: true } } } },
      },
    });

    if (!hearing) {
      throw new NotFoundException(`Hearing with ID ${id} not found`);
    }

    return hearing;
  }

  async updateStatus(id: string, status: HearingStatus, notes?: string) {
    const hearing = await this.findOne(id);
    return this.prisma.db.hearing.update({
      where: { id: hearing.id },
      data: {
        status,
        ...(notes ? { notes: `${hearing.notes ?? ''}\n[تحديث الحالة]: ${notes}` } : {}),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.db.hearing.delete({ where: { id } });
  }
}
