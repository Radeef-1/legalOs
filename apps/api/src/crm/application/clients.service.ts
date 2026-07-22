import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { CreateClientDto } from '../presentation/dto/create-client.dto';
import { TenantContext } from '../../shared/tenant/tenant.context';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto) {
    const tenantId = TenantContext.getTenantId()!;

    const created = await this.prisma.db.client.create({
      data: {
        organizationId: tenantId,
        name: createClientDto.name,
        nationalIdOrCr: createClientDto.nationalIdOrCr,
        phone: createClientDto.phone || null,
        email: createClientDto.email || null,
        portalAccessEnabled: createClientDto.portalAccessEnabled ?? false,
      },
    });

    return created;
  }

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const tenantId = TenantContext.getTenantId()!;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      organizationId: tenantId,
    };

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nationalIdOrCr: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await this.prisma.db.$transaction([
      this.prisma.db.client.count({ where: whereClause }),
      this.prisma.db.client.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          name: 'asc',
        },
      }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const tenantId = TenantContext.getTenantId()!;

    const item = await this.prisma.db.client.findFirst({
      where: {
        id,
        organizationId: tenantId,
      },
    });

    if (!item) {
      throw new NotFoundException({
        code: 'CLIENT_NOT_FOUND',
        message: 'الموكل المطلوب غير موجود',
      });
    }

    return item;
  }
}
