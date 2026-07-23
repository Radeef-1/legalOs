import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../shared/database/prisma.service';
import { InvitationSecurityService } from './services/invitation-security.service';
import { MembershipService } from './services/membership.service';
import * as crypto from 'crypto';

@Controller('v1/public/invitations')
export class PublicInvitationsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly securityService: InvitationSecurityService,
    private readonly membershipService: MembershipService,
  ) {}

  /**
   * Public Endpoint: Verify invitation token validity
   */
  @Get('verify/:token')
  async verifyToken(@Param('token') token: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const invite = await this.prisma.db.enterpriseInvitation.findUnique({
      where: { tokenHash },
    });

    if (!invite) {
      throw new NotFoundException('رابط الدعوة غير صحيح أو قد تم إلغاؤه');
    }

    if (invite.status === 'EXPIRED' || invite.expiresAt < new Date()) {
      throw new BadRequestException('عذراً، انتهت صلاحية رابط الدعوة');
    }

    if (invite.status === 'ACCEPTED') {
      throw new BadRequestException('تم استخدام وقبول هذه الدعوة مسبقاً');
    }

    // Log OPENED event
    await this.prisma.db.invitationEvent.create({
      data: {
        invitationId: invite.id,
        event: 'OPENED',
      },
    });

    return {
      success: true,
      invite: {
        id: invite.id,
        fullName: invite.fullName,
        email: invite.email,
        phone: invite.phone,
        roleName: invite.roleName,
        type: invite.type,
        expiresAt: invite.expiresAt,
        firmName: 'مكتب العتيبي للمحاماة والاستشارات القانونية والشرعية',
      },
    };
  }

  /**
   * Public Endpoint: Accept invitation & complete user setup
   */
  @Post('accept')
  async acceptInvite(
    @Body()
    dto: {
      token: string;
      fullName: string;
      password?: string;
    },
  ) {
    const tokenHash = crypto.createHash('sha256').update(dto.token).digest('hex');
    const invite = await this.prisma.db.enterpriseInvitation.findUnique({
      where: { tokenHash },
    });

    if (!invite) {
      throw new NotFoundException('الدعوة غير موجودة');
    }

    if (invite.status === 'ACCEPTED') {
      throw new BadRequestException('هذه الدعوة مقبولة مسبقاً');
    }

    const { membership, userId } = await this.membershipService.provisionMembership({
      invitationId: invite.id,
      organizationId: invite.organizationId,
      fullName: dto.fullName || invite.fullName,
      email: invite.email || undefined,
      phone: invite.phone || undefined,
      roleName: invite.roleName,
      departmentId: invite.departmentId || undefined,
      workspaceId: invite.workspaceId || undefined,
      invitedBy: invite.createdBy,
    });

    return {
      success: true,
      message: 'تم قبول الدعوة وإنشاء العضوية وتأطير الصلاحيات بنجاح 🟢',
      userId,
      membership,
    };
  }
}
