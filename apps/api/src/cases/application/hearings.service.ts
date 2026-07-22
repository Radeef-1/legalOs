import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { CreateHearingDto } from '../presentation/dto/create-hearing.dto';
import { TenantContext } from '../../shared/tenant/tenant.context';

@Injectable()
export class HearingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createHearingDto: CreateHearingDto) {
    const tenantId = TenantContext.getTenantId()!;

    const caseItem = await this.prisma.db.case.findFirst({
      where: {
        id: createHearingDto.caseId,
        organizationId: tenantId,
        deletedAt: null,
      },
    });

    if (!caseItem) {
      throw new NotFoundException({
        code: 'CASE_NOT_FOUND',
        message: 'القضية المحددة غير موجودة أو لا تنتمي لهذا المكتب',
      });
    }

    const created = await this.prisma.db.hearing.create({
      data: {
        caseId: createHearingDto.caseId,
        hearingDate: new Date(createHearingDto.hearingDate),
        notes: createHearingDto.notes || null,
        source: 'manual',
      },
    });

    return created;
  }

  async findAll() {
    const tenantId = TenantContext.getTenantId()!;

    return this.prisma.db.hearing.findMany({
      where: {
        case: {
          organizationId: tenantId,
          deletedAt: null,
        },
      },
      include: {
        case: {
          select: {
            id: true,
            caseNumberInternal: true,
            courtName: true,
          },
        },
      },
      orderBy: {
        hearingDate: 'asc',
      },
    });
  }
}
