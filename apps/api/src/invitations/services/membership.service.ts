import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';

@Injectable()
export class MembershipService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Complete invitation acceptance & create user & membership record
   */
  async provisionMembership(dto: {
    invitationId: string;
    organizationId: string;
    fullName: string;
    email?: string;
    phone?: string;
    roleName: string;
    departmentId?: string;
    workspaceId?: string;
    invitedBy: string;
  }) {
    const invite = await this.prisma.db.enterpriseInvitation.findUnique({
      where: { id: dto.invitationId },
    });

    if (!invite) {
      throw new NotFoundException('الدعوة غير موجودة بالنظام');
    }

    // 1. Create or find User
    const existingUser = dto.email
      ? await this.prisma.db.user.findFirst({ where: { email: dto.email } })
      : null;

    let userId = existingUser?.id;

    if (!existingUser) {
      const newUser = await this.prisma.db.user.create({
        data: {
          email: dto.email || `${Date.now()}@legalos.sa`,
          fullName: dto.fullName,
          phone: dto.phone,
          organizationId: dto.organizationId,
          userType: dto.roleName === 'CLIENT' ? 'CLIENT' : 'LAWYER',
          isActive: true,
        },
      });
      userId = newUser.id;
    }

    // 2. Create MembershipRecord
    const membership = await this.prisma.db.membershipRecord.create({
      data: {
        userId: userId!,
        organizationId: dto.organizationId,
        roleName: dto.roleName,
        departmentId: dto.departmentId,
        workspaceId: dto.workspaceId,
        status: 'ACTIVE',
        invitedBy: dto.invitedBy,
      },
    });

    // 3. Mark Invitation as ACCEPTED
    await this.prisma.db.enterpriseInvitation.update({
      where: { id: dto.invitationId },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
    });

    // 4. Record Acceptance Event
    await this.prisma.db.invitationEvent.create({
      data: {
        invitationId: dto.invitationId,
        event: 'ACCEPTED',
      },
    });

    return { membership, userId };
  }
}
