import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { TenantContext } from '../../shared/tenant/tenant.context';
import { CreateTeamDto } from './dtos/create-team.dto';
import { UpdateTeamDto } from './dtos/update-team.dto';
import { AssignTeamMemberDto } from './dtos/assign-team-member.dto';

@Injectable()
export class TeamsService {
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

  private async getMemberId(userId: string, tenantId: string): Promise<string> {
    const member = await this.prisma.db.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: tenantId,
          userId: userId,
        },
      },
    });
    if (!member) {
      throw new BadRequestException('المستخدم غير مسجل كعضو في بيئة العمل هذه');
    }
    return member.id;
  }

  async create(dto: CreateTeamDto) {
    const tenantId = this.getTenantId();
    const userId = this.getUserId();

    // Verify department if provided
    if (dto.departmentId) {
      const dept = await this.prisma.db.department.findUnique({
        where: { id: dto.departmentId },
      });
      if (!dept || dept.organizationId !== tenantId) {
        throw new BadRequestException('القسم المحدد غير موجود أو لا ينتمي لبيئة العمل هذه');
      }
    }

    // Verify parent team if provided
    if (dto.parentTeamId) {
      const parent = await this.prisma.db.team.findUnique({
        where: { id: dto.parentTeamId },
      });
      if (!parent || parent.organizationId !== tenantId) {
        throw new BadRequestException('الفريق الأب المحدد غير موجود أو لا ينتمي لبيئة العمل هذه');
      }
    }

    return this.prisma.db.team.create({
      data: {
        organizationId: tenantId,
        name: dto.name,
        description: dto.description,
        departmentId: dto.departmentId,
        parentTeamId: dto.parentTeamId,
        createdById: userId,
      },
    });
  }

  async findAll() {
    const tenantId = this.getTenantId();
    return this.prisma.db.team.findMany({
      where: { organizationId: tenantId, deletedAt: null },
      include: {
        department: true,
        parentTeam: true,
        subTeams: true,
        members: {
          where: { leftAt: null },
          include: {
            member: {
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
        },
      },
    });
  }

  async findOne(id: string) {
    const team = await this.prisma.db.team.findUnique({
      where: { id },
      include: {
        department: true,
        parentTeam: true,
        subTeams: true,
        members: {
          where: { leftAt: null },
          include: {
            member: {
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
        },
      },
    });

    if (!team || team.deletedAt !== null) {
      throw new NotFoundException(`الفريق المعرف بـ ${id} غير موجود`);
    }

    return team;
  }

  async update(id: string, dto: UpdateTeamDto) {
    const tenantId = this.getTenantId();
    const userId = this.getUserId();

    // Check if team exists
    await this.findOne(id);

    if (dto.parentTeamId) {
      if (dto.parentTeamId === id) {
        throw new BadRequestException('لا يمكن للفريق أن يكون أباً لنفسه');
      }
      const parent = await this.prisma.db.team.findUnique({
        where: { id: dto.parentTeamId },
      });
      if (!parent || parent.organizationId !== tenantId) {
        throw new BadRequestException('الفريق الأب المحدد غير موجود أو لا ينتمي لبيئة العمل هذه');
      }
    }

    if (dto.departmentId) {
      const dept = await this.prisma.db.department.findUnique({
        where: { id: dto.departmentId },
      });
      if (!dept || dept.organizationId !== tenantId) {
        throw new BadRequestException('القسم المحدد غير موجود أو لا ينتمي لبيئة العمل هذه');
      }
    }

    return this.prisma.db.team.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        departmentId: dto.departmentId,
        parentTeamId: dto.parentTeamId,
        updatedById: userId,
        updatedAt: new Date(),
      },
    });
  }

  async remove(id: string) {
    const userId = this.getUserId();
    await this.findOne(id);

    return this.prisma.db.team.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: userId,
      },
    });
  }

  async assignMember(teamId: string, dto: AssignTeamMemberDto) {
    const tenantId = this.getTenantId();
    const activeUserId = this.getUserId();

    // Verify team
    await this.findOne(teamId);

    // Verify member belongs to same tenant
    const member = await this.prisma.db.organizationMember.findUnique({
      where: { id: dto.memberId },
    });
    if (!member || member.organizationId !== tenantId) {
      throw new BadRequestException('العضو المحدد غير موجود أو لا ينتمي لبيئة العمل هذه');
    }

    const activeMemberId = activeUserId ? await this.getMemberId(activeUserId, tenantId) : null;

    // Check if membership already exists (active or historical)
    const existing = await this.prisma.db.teamMember.findUnique({
      where: {
        memberId_teamId: {
          memberId: dto.memberId,
          teamId,
        },
      },
    });

    if (existing) {
      // Re-activate or update existing membership
      return this.prisma.db.teamMember.update({
        where: { id: existing.id },
        data: {
          joinedAt: new Date(),
          leftAt: null,
          isLeader: dto.isLeader ?? existing.isLeader,
          title: dto.title ?? existing.title,
          allocationType: dto.allocationType ?? existing.allocationType,
          allocationPercent: dto.allocationPercent ?? existing.allocationPercent,
          joinedById: activeMemberId,
        },
      });
    }

    return this.prisma.db.teamMember.create({
      data: {
        teamId,
        memberId: dto.memberId,
        isLeader: dto.isLeader ?? false,
        title: dto.title,
        allocationType: dto.allocationType ?? 'Primary',
        allocationPercent: dto.allocationPercent ?? 100,
        joinedById: activeMemberId,
      },
    });
  }

  async removeMember(teamId: string, memberId: string) {
    const tenantId = this.getTenantId();
    const activeUserId = this.getUserId();
    const activeMemberId = activeUserId ? await this.getMemberId(activeUserId, tenantId) : null;

    const membership = await this.prisma.db.teamMember.findUnique({
      where: {
        memberId_teamId: {
          memberId,
          teamId,
        },
      },
    });

    if (!membership || membership.leftAt !== null) {
      throw new NotFoundException('لا توجد عضوية نشطة للعضو المحدد في هذا الفريق');
    }

    return this.prisma.db.teamMember.update({
      where: { id: membership.id },
      data: {
        leftAt: new Date(),
        removedById: activeMemberId,
      },
    });
  }
}
