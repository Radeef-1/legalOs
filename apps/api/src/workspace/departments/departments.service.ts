import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { TenantContext } from '../../shared/tenant/tenant.context';
import { CreateDepartmentDto } from './dtos/create-department.dto';
import { UpdateDepartmentDto } from './dtos/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  private getTenantId(): string {
    const tenantId = TenantContext.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('لم يتم العثور على معرف بيئة العمل (Tenant ID)');
    }
    return tenantId;
  }

  private getUserId(): string | null {
    return TenantContext.getUserId() ?? null;
  }

  async create(dto: CreateDepartmentDto) {
    const tenantId = this.getTenantId();
    const userId = this.getUserId();

    // Verify parent department if provided
    if (dto.parentDepartmentId) {
      const parent = await this.prisma.db.department.findUnique({
        where: { id: dto.parentDepartmentId },
      });
      if (!parent || parent.organizationId !== tenantId) {
        throw new BadRequestException('القسم الأب المحدد غير موجود أو لا ينتمي لبيئة العمل هذه');
      }
    }

    // Verify manager if provided
    if (dto.managerMemberId) {
      const manager = await this.prisma.db.organizationMember.findUnique({
        where: { id: dto.managerMemberId },
      });
      if (!manager || manager.organizationId !== tenantId) {
        throw new BadRequestException('المدير المحدد غير عضو في بيئة العمل هذه');
      }
    }

    return this.prisma.db.department.create({
      data: {
        organizationId: tenantId,
        name: dto.name,
        description: dto.description,
        parentDepartmentId: dto.parentDepartmentId,
        managerMemberId: dto.managerMemberId,
        createdById: userId,
      },
    });
  }

  async findAll() {
    const tenantId = this.getTenantId();
    return this.prisma.db.department.findMany({
      where: { organizationId: tenantId, deletedAt: null },
      include: {
        parentDepartment: true,
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
        subDepartments: true,
        members: {
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
    const dept = await this.prisma.db.department.findUnique({
      where: { id },
      include: {
        parentDepartment: true,
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
        subDepartments: true,
        members: {
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

    if (!dept || dept.deletedAt !== null) {
      throw new NotFoundException(`القسم المعرف بـ ${id} غير موجود`);
    }

    return dept;
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    const tenantId = this.getTenantId();
    const userId = this.getUserId();

    // Check if department exists
    const existing = await this.findOne(id);

    if (dto.parentDepartmentId) {
      if (dto.parentDepartmentId === id) {
        throw new BadRequestException('لا يمكن للقسم أن يكون أباً لنفسه');
      }
      const parent = await this.prisma.db.department.findUnique({
        where: { id: dto.parentDepartmentId },
      });
      if (!parent || parent.organizationId !== tenantId) {
        throw new BadRequestException('القسم الأب المحدد غير موجود أو لا ينتمي لبيئة العمل هذه');
      }
    }

    if (dto.managerMemberId) {
      const manager = await this.prisma.db.organizationMember.findUnique({
        where: { id: dto.managerMemberId },
      });
      if (!manager || manager.organizationId !== tenantId) {
        throw new BadRequestException('المدير المحدد غير عضو في بيئة العمل هذه');
      }
    }

    return this.prisma.db.department.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        parentDepartmentId: dto.parentDepartmentId,
        managerMemberId: dto.managerMemberId,
        updatedById: userId,
        updatedAt: new Date(),
      },
    });
  }

  async remove(id: string) {
    const userId = this.getUserId();
    await this.findOne(id);

    // Soft delete to maintain audit log integrity
    return this.prisma.db.department.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: userId,
      },
    });
  }
}
