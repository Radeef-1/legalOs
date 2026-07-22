import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { TenantContext } from '../../shared/tenant/tenant.context';
import { CreateInvitationDto } from './dtos/create-invitation.dto';
import { AcceptInvitationDto } from './dtos/accept-invitation.dto';
import { hashPassword } from '../../shared/utils/crypto';
import * as crypto from 'crypto';
import { InvitationStatus } from '@prisma/client';

@Injectable()
export class InvitationsService {
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

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async createInvitation(dto: CreateInvitationDto) {
    const tenantId = this.getTenantId();
    const activeUserId = this.getUserId();

    // Verify role belongs to same tenant or is system global
    const role = await this.prisma.db.role.findFirst({
      where: {
        id: dto.roleId,
        OR: [
          { organizationId: tenantId },
          { organizationId: null },
        ],
      },
    });
    if (!role) {
      throw new BadRequestException('الدور المحدد غير صالح');
    }

    // Verify branch if provided
    if (dto.branchId) {
      const branch = await this.prisma.db.branch.findUnique({
        where: { id: dto.branchId },
      });
      if (!branch || branch.organizationId !== tenantId) {
        throw new BadRequestException('الفرع المحدد غير موجود أو لا ينتمي لبيئة العمل هذه');
      }
    }

    // Verify department if provided
    if (dto.departmentId) {
      const dept = await this.prisma.db.department.findUnique({
        where: { id: dto.departmentId },
      });
      if (!dept || dept.organizationId !== tenantId) {
        throw new BadRequestException('القسم المحدد غير موجود أو لا ينتمي لبيئة العمل هذه');
      }
    }

    // Verify team if provided
    if (dto.teamId) {
      const team = await this.prisma.db.team.findUnique({
        where: { id: dto.teamId },
      });
      if (!team || team.organizationId !== tenantId) {
        throw new BadRequestException('الفريق المحدد غير موجود أو لا ينتمي لبيئة العمل هذه');
      }
    }

    // Generate secure random token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);

    // Save invitation
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // expires in 7 days

    await this.prisma.db.workspaceInvitation.create({
      data: {
        organizationId: tenantId,
        email: dto.email,
        roleId: dto.roleId,
        branchId: dto.branchId,
        departmentId: dto.departmentId,
        teamId: dto.teamId,
        invitedById: activeUserId!,
        tokenHash,
        expiresAt,
        status: InvitationStatus.PENDING,
        createdById: activeUserId,
      },
    });

    // In production, send email to client. For now, we mock/log the link.
    console.log(`[Email Mock] Onboarding link sent to ${dto.email}: http://localhost:3000/workspace/invitations/accept?token=${rawToken}`);

    return {
      rawToken,
      expiresAt,
    };
  }

  async acceptInvitation(dto: AcceptInvitationDto) {
    const tokenHash = this.hashToken(dto.token);

    // Search invitation without RLS context since user is not logged in yet
    const invitation = await this.prisma.workspaceInvitation.findUnique({
      where: { tokenHash },
      include: { organization: true },
    });

    if (!invitation || invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('دعوة الانضمام غير صالحة أو تم استخدامها بالفعل');
    }

    if (invitation.expiresAt < new Date()) {
      await this.prisma.workspaceInvitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.EXPIRED },
      });
      throw new BadRequestException('دعوة الانضمام منتهية الصلاحية');
    }

    // Run within the target tenant's context to satisfy RLS during memberships insertion
    return TenantContext.run({ tenantId: invitation.organizationId }, async () => {
      // Find or create global user
      let user = await this.prisma.user.findUnique({
        where: { email: invitation.email },
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            fullName: dto.fullName,
            email: invitation.email,
            passwordHash: hashPassword(dto.password),
            status: 'active',
          },
        });
      }

      // Check if already a member of this organization
      const existingMember = await this.prisma.db.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: invitation.organizationId,
            userId: user.id,
          },
        },
      });

      if (existingMember) {
        throw new BadRequestException('أنت بالفعل عضو في بيئة العمل هذه');
      }

      // Register organization member
      const member = await this.prisma.db.organizationMember.create({
        data: {
          organizationId: invitation.organizationId,
          userId: user.id,
          roleId: invitation.roleId,
          branchId: invitation.branchId,
          departmentId: invitation.departmentId,
          status: 'active',
        },
      });

      // Auto-join team if specified in invitation
      if (invitation.teamId) {
        await this.prisma.db.teamMember.create({
          data: {
            teamId: invitation.teamId,
            memberId: member.id,
            joinedById: member.id,
            allocationType: 'Primary',
            allocationPercent: 100,
          },
        });
      }

      // Mark invitation as accepted
      await this.prisma.db.workspaceInvitation.update({
        where: { id: invitation.id },
        data: {
          status: InvitationStatus.ACCEPTED,
          acceptedAt: new Date(),
          acceptedByUserId: user.id,
        },
      });

      return {
        userId: user.id,
        memberId: member.id,
        organizationId: invitation.organizationId,
      };
    });
  }

  async revokeInvitation(id: string) {
    const tenantId = this.getTenantId();
    const activeUserId = this.getUserId();

    const invitation = await this.prisma.db.workspaceInvitation.findUnique({
      where: { id },
    });

    if (!invitation || invitation.organizationId !== tenantId) {
      throw new NotFoundException('لم يتم العثور على دعوة الانضمام المحددة');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('لا يمكن إلغاء دعوة غير معلقة');
    }

    return this.prisma.db.workspaceInvitation.update({
      where: { id },
      data: {
        status: InvitationStatus.REVOKED,
        revokedAt: new Date(),
        revokedByUserId: activeUserId,
        deletedById: activeUserId,
        deletedAt: new Date(),
      },
    });
  }

  async findAll() {
    const tenantId = this.getTenantId();
    return this.prisma.db.workspaceInvitation.findMany({
      where: { organizationId: tenantId, deletedAt: null },
      include: {
        role: true,
        invitedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  }
}
