import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { TenantContext } from '../../shared/tenant/tenant.context';
import { CreateBranchDto } from './dtos/create-branch.dto';
import { UpdateBranchDto } from './dtos/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  private getTenantId(): string {
    const tenantId = TenantContext.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('لم يتم العثور على معرف بيئة العمل (Tenant ID)');
    }
    return tenantId;
  }

  async create(dto: CreateBranchDto) {
    const tenantId = this.getTenantId();

    // Check if another branch is head office, if this is set as head office
    if (dto.isHeadOffice) {
      await this.prisma.db.branch.updateMany({
        where: { organizationId: tenantId, isHeadOffice: true },
        data: { isHeadOffice: false },
      });
    }

    return this.prisma.db.branch.create({
      data: {
        organizationId: tenantId,
        name: dto.name,
        city: dto.city,
        country: dto.country ?? 'SA',
        timezone: dto.timezone ?? 'Asia/Riyadh',
        address: dto.address,
        phone: dto.phone,
        email: dto.email,
        managerMemberId: dto.managerMemberId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        isHeadOffice: dto.isHeadOffice ?? false,
      },
    });
  }

  async findAll() {
    const tenantId = this.getTenantId();
    return this.prisma.db.branch.findMany({
      where: { organizationId: tenantId },
      include: {
        manager: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const branch = await this.prisma.db.branch.findUnique({
      where: { id },
      include: {
        manager: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!branch) {
      throw new NotFoundException(`الفرع المعرف بـ ${id} غير موجود`);
    }

    return branch;
  }

  async update(id: string, dto: UpdateBranchDto) {
    const tenantId = this.getTenantId();

    // Check if the branch exists
    await this.findOne(id);

    if (dto.isHeadOffice) {
      await this.prisma.db.branch.updateMany({
        where: { organizationId: tenantId, isHeadOffice: true },
        data: { isHeadOffice: false },
      });
    }

    return this.prisma.db.branch.update({
      where: { id },
      data: {
        name: dto.name,
        city: dto.city,
        country: dto.country,
        timezone: dto.timezone,
        address: dto.address,
        phone: dto.phone,
        email: dto.email,
        managerMemberId: dto.managerMemberId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        isHeadOffice: dto.isHeadOffice,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.db.branch.delete({
      where: { id },
    });
  }
}
