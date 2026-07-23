import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../shared/database/prisma.service';
import { InvitationSecurityService } from './services/invitation-security.service';
import { InvitationDeliveryService } from './services/invitation-delivery.service';
import { InvitationAnalyticsService } from './services/invitation-analytics.service';
import { TenantContext } from '../shared/tenant/tenant.context';

@Controller('v1/invitations')
export class InvitationsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly securityService: InvitationSecurityService,
    private readonly deliveryService: InvitationDeliveryService,
    private readonly analyticsService: InvitationAnalyticsService,
  ) {}

  /**
   * List all invitations for current organization
   */
  @Get()
  async listInvitations(@Query('status') status?: string) {
    const orgId = TenantContext.getTenantId() || 'org-salman-2026';
    const where: any = { organizationId: orgId };
    if (status) {
      where.status = status;
    }

    const invitations = await this.prisma.db.enterpriseInvitation.findMany({
      where,
      include: { events: true },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, invitations };
  }

  /**
   * Create single invitation
   */
  @Post()
  async createInvitation(
    @Body()
    dto: {
      type: string;
      fullName: string;
      email?: string;
      phone?: string;
      roleName: string;
      channel: string;
      expiryDays?: number;
      departmentId?: string;
      workspaceId?: string;
    },
  ) {
    const orgId = TenantContext.getTenantId() || 'org-salman-2026';
    const createdBy = 'user-admin-01';
    const expiryDays = dto.expiryDays || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    const { token, tokenHash } = this.securityService.generateSecureToken();

    const invitation = await this.prisma.db.enterpriseInvitation.create({
      data: {
        organizationId: orgId,
        type: dto.type || 'LAWYER',
        email: dto.email,
        phone: dto.phone,
        fullName: dto.fullName,
        roleName: dto.roleName || 'LAWYER',
        workspaceId: dto.workspaceId,
        departmentId: dto.departmentId,
        status: 'PENDING',
        expiresAt,
        tokenHash,
        channel: dto.channel || 'LINK',
        createdBy,
      },
    });

    // Record Event
    await this.prisma.db.invitationEvent.create({
      data: {
        invitationId: invitation.id,
        event: 'CREATED',
      },
    });

    const publicUrl = this.securityService.formatProductionInviteUrl(dto.type || 'lawyer', token, 'otaibi-law');
    const whatsappUrl = dto.phone
      ? this.deliveryService.generateWhatsAppLink(dto.phone, publicUrl, 'مكتب العتيبي للمحاماة')
      : null;

    if (dto.phone && dto.channel === 'SMS') {
      await this.deliveryService.sendSmsInvitation(dto.phone, publicUrl, 'مكتب العتيبي للمحاماة');
    }

    return {
      success: true,
      invitation,
      token,
      publicUrl,
      whatsappUrl,
    };
  }

  /**
   * Bulk Invitation Import (Excel / CSV Payload)
   */
  @Post('bulk')
  async bulkInvite(
    @Body()
    dto: {
      invites: Array<{
        type: string;
        fullName: string;
        email?: string;
        phone?: string;
        roleName: string;
      }>;
    },
  ) {
    const orgId = TenantContext.getTenantId() || 'org-salman-2026';
    const results: any[] = [];

    for (const inv of dto.invites) {
      const created = await this.createInvitation({
        type: inv.type,
        fullName: inv.fullName,
        email: inv.email,
        phone: inv.phone,
        roleName: inv.roleName,
        channel: 'LINK',
      });
      results.push(created.invitation as any);
    }

    return { success: true, count: results.length, invitations: results };
  }

  /**
   * Resend invitation
   */
  @Post(':id/resend')
  async resendInvitation(@Param('id') id: string) {
    const invite = await this.prisma.db.enterpriseInvitation.findUnique({
      where: { id },
    });

    if (!invite) {
      throw new NotFoundException('الدعوة غير موجودة');
    }

    await this.prisma.db.enterpriseInvitation.update({
      where: { id },
      data: {
        status: 'SENT',
        lastSentAt: new Date(),
      },
    });

    await this.prisma.db.invitationEvent.create({
      data: {
        invitationId: id,
        event: 'RESENT',
      },
    });

    return { success: true, message: 'تمت إعادة إرسال الدعوة بنجاح' };
  }

  /**
   * Cancel or Revoke invitation
   */
  @Post(':id/cancel')
  async cancelInvitation(@Param('id') id: string) {
    await this.prisma.db.enterpriseInvitation.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    await this.prisma.db.invitationEvent.create({
      data: {
        invitationId: id,
        event: 'CANCELLED',
      },
    });

    return { success: true, message: 'تم إلغاء الدعوة' };
  }

  /**
   * Invitation Analytics & Conversion Rate
   */
  @Get('analytics')
  async getAnalytics() {
    const orgId = TenantContext.getTenantId() || 'org-salman-2026';
    return this.analyticsService.getAnalytics(orgId);
  }
}
