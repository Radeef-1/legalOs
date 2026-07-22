import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { TenantContext } from '../../shared/tenant/tenant.context';
import { hashPassword } from '../../shared/utils/crypto';
import { UpdateMemberDto } from './dtos/update-member.dto';
import { UpdatePreferencesDto } from './dtos/update-preferences.dto';

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

  private getTenantId(): string {
    const tenantId = TenantContext.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('لم يتم العثور على معرف بيئة العمل (Tenant ID)');
    }
    return tenantId;
  }

  async createMember(dto: { fullName: string; email: string; password?: string; jobTitle?: string; roleName?: string }) {
    const tenantId = this.getTenantId();

    return this.prisma.db.$transaction(async (tx: any) => {
      // Find or create User
      let user = await tx.user.findUnique({ where: { email: dto.email } });
      if (!user) {
        user = await tx.user.create({
          data: {
            fullName: dto.fullName,
            email: dto.email,
            passwordHash: hashPassword(dto.password || 'password123'),
            status: 'active',
          },
        });
      }

      // Find role in tenant
      let role = await tx.role.findFirst({
        where: { organizationId: tenantId, name: dto.roleName || 'Associate' },
      });

      if (!role) {
        role = await tx.role.findFirst({ where: { organizationId: tenantId } });
      }

      // Create organization member link
      const member = await tx.organizationMember.create({
        data: {
          organizationId: tenantId,
          userId: user.id,
          roleId: role?.id || null,
          jobTitle: dto.jobTitle || 'محامي مشارك',
          status: 'active',
          isPrimaryWorkspace: false,
        },
        include: {
          user: true,
          role: true,
        },
      });

      return member;
    });
  }

  async findAll() {
    const tenantId = this.getTenantId();
    return this.prisma.db.organizationMember.findMany({
      where: { organizationId: tenantId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            nationalId: true,
          },
        },
        role: true,
        branch: true,
        department: true,
      },
    });
  }

  async findOne(id: string) {
    const member = await this.prisma.db.organizationMember.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            nationalId: true,
          },
        },
        role: true,
        branch: true,
        department: true,
        personalPreference: true,
      },
    });

    if (!member) {
      throw new NotFoundException(`عضو بيئة العمل المعرف بـ ${id} غير موجود`);
    }

    return member;
  }

  async updateMember(id: string, dto: UpdateMemberDto) {
    const tenantId = this.getTenantId();
    const existing = await this.findOne(id);

    // Verify branch if updated
    if (dto.branchId) {
      const branch = await this.prisma.db.branch.findUnique({
        where: { id: dto.branchId },
      });
      if (!branch || branch.organizationId !== tenantId) {
        throw new BadRequestException('الفرع المحدد غير موجود أو لا ينتمي لبيئة العمل هذه');
      }
    }

    // Verify department if updated
    if (dto.departmentId) {
      const dept = await this.prisma.db.department.findUnique({
        where: { id: dto.departmentId },
      });
      if (!dept || dept.organizationId !== tenantId) {
        throw new BadRequestException('القسم المحدد غير موجود أو لا ينتمي لبيئة العمل هذه');
      }
    }

    return this.prisma.db.organizationMember.update({
      where: { id },
      data: {
        jobTitle: dto.jobTitle,
        employeeNumber: dto.employeeNumber,
        employmentType: dto.employmentType,
        licenseNumber: dto.licenseNumber,
        bio: dto.bio,
        status: dto.status,
        branchId: dto.branchId,
        departmentId: dto.departmentId,
      },
    });
  }

  async getPreferences(memberId: string) {
    // Verify member exists
    await this.findOne(memberId);

    const preference = await this.prisma.db.organizationMemberPreference.findUnique({
      where: { memberId },
    });

    if (!preference) {
      // Create defaults
      return this.prisma.db.organizationMemberPreference.create({
        data: {
          memberId,
          language: 'ar',
          timezone: 'Asia/Riyadh',
          theme: 'light',
          notifications: {},
          calendarView: 'month',
        },
      });
    }

    return preference;
  }

  async updatePreferences(memberId: string, dto: UpdatePreferencesDto) {
    // Verify member exists
    await this.findOne(memberId);

    return this.prisma.db.organizationMemberPreference.upsert({
      where: { memberId },
      update: {
        language: dto.language,
        timezone: dto.timezone,
        theme: dto.theme,
        notifications: dto.notifications,
        calendarView: dto.calendarView,
      },
      create: {
        memberId,
        language: dto.language ?? 'ar',
        timezone: dto.timezone ?? 'Asia/Riyadh',
        theme: dto.theme ?? 'light',
        notifications: dto.notifications ?? {},
        calendarView: dto.calendarView ?? 'month',
      },
    });
  }
}
