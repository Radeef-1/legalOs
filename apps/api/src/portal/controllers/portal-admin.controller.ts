import { Controller, Post, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { PortalActionsService, CreateClientActionDto } from '../application/services/portal-actions.service';
import { PortalAppointmentsService } from '../application/services/portal-appointments.service';
import { PortalBrandingService, UpdateBrandingDto } from '../application/services/portal-branding.service';
import { PortalPermissionsService, UpdatePermissionsDto } from '../application/services/portal-permissions.service';
import { PortalMessagingService, SendMessageDto } from '../application/services/portal-messaging.service';
import { PortalTimelineService, CreateTimelineEntryDto } from '../application/services/portal-timeline.service';
import { PortalAuditService } from '../application/services/portal-audit.service';
import { TenantContext } from '../../shared/tenant/tenant.context';

@Controller('portal-admin')
@UseGuards(AuthGuard)
export class PortalAdminController {
  constructor(
    private readonly actionsService: PortalActionsService,
    private readonly appointmentsService: PortalAppointmentsService,
    private readonly brandingService: PortalBrandingService,
    private readonly permissionsService: PortalPermissionsService,
    private readonly messagingService: PortalMessagingService,
    private readonly timelineService: PortalTimelineService,
    private readonly auditService: PortalAuditService,
  ) {}

  // ─── BRANDING ───────────────────────────────────────────────────
  @Get('branding')
  async getBranding() {
    const orgId = TenantContext.getTenantId()!;
    const data = await this.brandingService.getBranding(orgId);
    return { success: true, data };
  }

  @Patch('branding')
  async updateBranding(@Body() dto: UpdateBrandingDto) {
    const orgId = TenantContext.getTenantId()!;
    const data = await this.brandingService.updateBranding(orgId, dto);
    return { success: true, data };
  }

  // ─── CLIENT PERMISSIONS ─────────────────────────────────────────
  @Get('clients/:clientId/permissions')
  async getClientPermissions(@Param('clientId') clientId: string) {
    const orgId = TenantContext.getTenantId()!;
    const data = await this.permissionsService.getClientPermissions(orgId, clientId);
    return { success: true, data };
  }

  @Patch('clients/:clientId/permissions')
  async updateClientPermissions(
    @Param('clientId') clientId: string,
    @Body() dto: UpdatePermissionsDto,
  ) {
    const orgId = TenantContext.getTenantId()!;
    const data = await this.permissionsService.updateClientPermissions(orgId, clientId, dto);
    return { success: true, data };
  }

  // ─── CLIENT ACTIONS ─────────────────────────────────────────────
  @Post('clients/:clientId/actions')
  async createClientAction(
    @Param('clientId') clientId: string,
    @Body() dto: Omit<CreateClientActionDto, 'clientId'>,
  ) {
    const orgId = TenantContext.getTenantId()!;
    const data = await this.actionsService.createAction(orgId, { ...dto, clientId } as CreateClientActionDto);
    return { success: true, data };
  }

  @Get('clients/:clientId/actions')
  async getClientActions(@Param('clientId') clientId: string) {
    const orgId = TenantContext.getTenantId()!;
    const data = await this.actionsService.getAllActions(orgId, clientId);
    return { success: true, data };
  }

  @Get('clients/:clientId/actions/summary')
  async getClientActionsSummary(@Param('clientId') clientId: string) {
    const orgId = TenantContext.getTenantId()!;
    const data = await this.actionsService.getActionsSummary(orgId, clientId);
    return { success: true, data };
  }

  // ─── MESSAGING (Lawyer → Client) ───────────────────────────────
  @Post('clients/:clientId/messages')
  async sendMessageToClient(
    @Param('clientId') clientId: string,
    @Body() dto: SendMessageDto,
  ) {
    const orgId = TenantContext.getTenantId()!;
    const data = await this.messagingService.sendLawyerMessage(orgId, clientId, dto);
    return { success: true, data };
  }

  @Get('clients/:clientId/messages')
  async getClientMessages(
    @Param('clientId') clientId: string,
    @Query('caseId') caseId?: string,
  ) {
    const orgId = TenantContext.getTenantId()!;
    const data = await this.messagingService.getMessages(orgId, clientId, caseId);
    return { success: true, data };
  }

  // ─── APPOINTMENTS ───────────────────────────────────────────────
  @Patch('appointments/:id/confirm')
  async confirmAppointment(
    @Param('id') appointmentId: string,
    @Body('meetingUrl') meetingUrl?: string,
  ) {
    const orgId = TenantContext.getTenantId()!;
    const data = await this.appointmentsService.confirmAppointment(orgId, appointmentId, meetingUrl);
    return { success: true, data };
  }

  // ─── CASE TIMELINE ──────────────────────────────────────────────
  @Post('cases/:caseId/timeline')
  async addTimelineEntry(
    @Param('caseId') caseId: string,
    @Body() dto: CreateTimelineEntryDto,
  ) {
    const orgId = TenantContext.getTenantId()!;
    const data = await this.timelineService.createTimelineEntry(orgId, caseId, dto);
    return { success: true, data };
  }

  // ─── ANALYTICS ──────────────────────────────────────────────────
  @Get('analytics')
  async getPortalAnalytics() {
    const orgId = TenantContext.getTenantId()!;
    const data = await this.auditService.getPortalAnalytics(orgId);
    return { success: true, data };
  }

  @Get('activity-log')
  async getOrganizationActivityLog(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const orgId = TenantContext.getTenantId()!;
    const data = await this.auditService.getOrganizationActivityLog(
      orgId,
      parseInt(page || '1', 10),
      parseInt(limit || '50', 10),
    );
    return { success: true, data };
  }
}
