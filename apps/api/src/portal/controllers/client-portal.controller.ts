import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Headers,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { PortalAuthService } from '../application/services/portal-auth.service';
import { PortalCasesService, SubmitClientRequestDto } from '../application/services/portal-cases.service';
import { PortalDocumentsService } from '../application/services/portal-documents.service';
import { PortalFinanceService, PayInvoiceOnlineDto } from '../application/services/portal-finance.service';
import { PortalDashboardService } from '../application/services/portal-dashboard.service';
import { PortalTimelineService } from '../application/services/portal-timeline.service';
import { PortalMessagingService, SendMessageDto } from '../application/services/portal-messaging.service';
import { PortalActionsService } from '../application/services/portal-actions.service';
import { PortalAppointmentsService, RequestAppointmentDto } from '../application/services/portal-appointments.service';
import { PortalBrandingService } from '../application/services/portal-branding.service';
import { PortalPermissionsService } from '../application/services/portal-permissions.service';
import { PortalAuditService } from '../application/services/portal-audit.service';
import { PortalAuthGuard } from '../guards/portal-auth.guard';
import { PortalClient, PortalOrg } from '../decorators/portal-user.decorator';

@Controller('portal')
export class ClientPortalController {
  constructor(
    private readonly authService: PortalAuthService,
    private readonly casesService: PortalCasesService,
    private readonly documentsService: PortalDocumentsService,
    private readonly financeService: PortalFinanceService,
    private readonly dashboardService: PortalDashboardService,
    private readonly timelineService: PortalTimelineService,
    private readonly messagingService: PortalMessagingService,
    private readonly actionsService: PortalActionsService,
    private readonly appointmentsService: PortalAppointmentsService,
    private readonly brandingService: PortalBrandingService,
    private readonly permissionsService: PortalPermissionsService,
    private readonly auditService: PortalAuditService,
  ) {}

  // ─── AUTH (PUBLIC) ──────────────────────────────────────────────
  @Post('auth/request-otp')
  async requestOtp(
    @Headers('x-tenant-id') organizationIdHeader: string,
    @Body('organizationId') organizationIdBody: string,
    @Body('nationalIdOrCr') nationalIdOrCr: string,
  ) {
    const orgId = organizationIdBody || organizationIdHeader || 'org-salman-2026';
    return this.authService.requestOtp(orgId, nationalIdOrCr);
  }

  @Post('auth/verify-otp')
  async verifyOtp(
    @Headers('x-tenant-id') organizationIdHeader: string,
    @Body('organizationId') organizationIdBody: string,
    @Body('nationalIdOrCr') nationalIdOrCr: string,
    @Body('otpCode') otpCode: string,
  ) {
    const orgId = organizationIdBody || organizationIdHeader || 'org-salman-2026';
    return this.authService.verifyOtp(orgId, nationalIdOrCr, otpCode);
  }

  // ─── BRANDING (PUBLIC) ──────────────────────────────────────────
  @Get('branding/:slug')
  async getBrandingBySlug(@Param('slug') slug: string) {
    return this.brandingService.resolveBySlug(slug);
  }

  @Get('branding')
  async getBranding(@Headers('x-tenant-id') organizationIdHeader: string) {
    const orgId = organizationIdHeader || 'org-salman-2026';
    return this.brandingService.getBranding(orgId);
  }

  // ─── PROTECTED ENDPOINTS (MUST PASS PORTAL AUTH GUARD) ──────────

  @Get('dashboard')
  @UseGuards(PortalAuthGuard)
  async getDashboard(
    @PortalOrg() organizationId: string,
    @PortalClient() clientId: string,
  ) {
    const data = await this.dashboardService.getDashboardSummary(organizationId, clientId);
    return { success: true, data };
  }

  // ─── CASES ──────────────────────────────────────────────────────
  @Get('cases')
  @UseGuards(PortalAuthGuard)
  async getCases(
    @PortalOrg() organizationId: string,
    @PortalClient() clientId: string,
  ) {
    const perms = await this.permissionsService.getClientPermissions(organizationId, clientId);
    if (!perms.canViewCases) {
      throw new ForbiddenException('الموكل لا يملك صلاحية عرض قائمة القضايا.');
    }
    const data = await this.casesService.getClientCases(organizationId, clientId);
    return { success: true, data };
  }

  @Get('cases/:id')
  @UseGuards(PortalAuthGuard)
  async getCaseById(
    @PortalOrg() organizationId: string,
    @PortalClient() clientId: string,
    @Param('id') caseId: string,
  ) {
    const perms = await this.permissionsService.getClientPermissions(organizationId, clientId);
    if (!perms.canViewCases) {
      throw new ForbiddenException('الموكل لا يملك صلاحية تفاصيل هذه القضية.');
    }
    const data = await this.casesService.getClientCaseById(organizationId, clientId, caseId);
    return { success: true, data };
  }

  @Get('cases/:id/timeline')
  @UseGuards(PortalAuthGuard)
  async getCaseTimeline(
    @PortalOrg() organizationId: string,
    @PortalClient() clientId: string,
    @Param('id') caseId: string,
  ) {
    const perms = await this.permissionsService.getClientPermissions(organizationId, clientId);
    if (!perms.canViewCases) {
      throw new ForbiddenException('الموكل لا يملك صلاحية عرض الجدول الزمني للمستندات والجلسات.');
    }
    const data = await this.timelineService.getCaseTimeline(organizationId, clientId, caseId);
    return { success: true, data };
  }

  @Post('requests')
  @UseGuards(PortalAuthGuard)
  async submitRequest(
    @PortalOrg() organizationId: string,
    @PortalClient() clientId: string,
    @Body() dto: SubmitClientRequestDto,
  ) {
    const data = await this.casesService.submitClientRequest(organizationId, clientId, dto);
    return { success: true, data };
  }

  // ─── DOCUMENTS ──────────────────────────────────────────────────
  @Get('documents')
  @UseGuards(PortalAuthGuard)
  async getDocuments(
    @PortalOrg() organizationId: string,
    @PortalClient() clientId: string,
  ) {
    const perms = await this.permissionsService.getClientPermissions(organizationId, clientId);
    if (!perms.canViewDocuments) {
      throw new ForbiddenException('الموكل لا يملك صلاحية التصفح أو الاطلاع على خزانة الوثائق.');
    }
    const data = await this.documentsService.getClientDocuments(organizationId, clientId);
    return { success: true, data };
  }

  @Post('documents')
  @UseGuards(PortalAuthGuard)
  async uploadDocument(
    @PortalOrg() organizationId: string,
    @PortalClient() clientId: string,
    @Body('caseId') caseId: string,
    @Body('title') title: string,
    @Body('fileUrl') fileUrl: string,
  ) {
    const perms = await this.permissionsService.getClientPermissions(organizationId, clientId);
    if (!perms.canUpload) {
      throw new ForbiddenException('الموكل لا يملك صلاحية رفع المستندات جديدة.');
    }
    const data = await this.documentsService.uploadClientDocument(organizationId, clientId, caseId, title, fileUrl);
    return { success: true, data };
  }

  // ─── INVOICES & PAYMENTS ────────────────────────────────────────
  @Get('invoices')
  @UseGuards(PortalAuthGuard)
  async getInvoices(
    @PortalOrg() organizationId: string,
    @PortalClient() clientId: string,
  ) {
    const perms = await this.permissionsService.getClientPermissions(organizationId, clientId);
    if (!perms.canViewInvoices) {
      throw new ForbiddenException('الموكل لا يملك صلاحية الاطلاع على قسم الفواتير والحسابات.');
    }
    const data = await this.financeService.getClientInvoices(organizationId, clientId);
    return { success: true, data };
  }

  @Post('invoices/pay')
  @UseGuards(PortalAuthGuard)
  async payInvoice(
    @PortalOrg() organizationId: string,
    @PortalClient() clientId: string,
    @Body() dto: PayInvoiceOnlineDto,
  ) {
    const perms = await this.permissionsService.getClientPermissions(organizationId, clientId);
    if (!perms.canViewInvoices) {
      throw new ForbiddenException('الموكل لا يملك صلاحية الدفع الإلكتروني المباشر.');
    }
    const data = await this.financeService.payInvoiceOnline(organizationId, clientId, dto);
    return { success: true, data };
  }

  // ─── MESSAGING ──────────────────────────────────────────────────
  @Get('messages')
  @UseGuards(PortalAuthGuard)
  async getMessages(
    @PortalOrg() organizationId: string,
    @PortalClient() clientId: string,
    @Query('caseId') caseId?: string,
  ) {
    const perms = await this.permissionsService.getClientPermissions(organizationId, clientId);
    if (!perms.canMessage) {
      throw new ForbiddenException('صلاحية المراسلة والتواصل المباشر مغلقة من قِبل إدارة المكتب.');
    }
    const data = await this.messagingService.getMessages(organizationId, clientId, caseId);
    return { success: true, data };
  }

  @Post('messages')
  @UseGuards(PortalAuthGuard)
  async sendMessage(
    @PortalOrg() organizationId: string,
    @PortalClient() clientId: string,
    @Body() dto: SendMessageDto,
  ) {
    const perms = await this.permissionsService.getClientPermissions(organizationId, clientId);
    if (!perms.canMessage) {
      throw new ForbiddenException('صلاحية المراسلة والتواصل المباشر مغلقة من قِبل إدارة المكتب.');
    }
    const data = await this.messagingService.sendMessage(organizationId, clientId, dto);
    return { success: true, data };
  }

  @Patch('messages/:id/read')
  @UseGuards(PortalAuthGuard)
  async markMessageAsRead(
    @PortalOrg() organizationId: string,
    @PortalClient() clientId: string,
    @Param('id') messageId: string,
  ) {
    await this.messagingService.markAsRead(organizationId, clientId, messageId);
    return { success: true, message: 'تم تحديد الرسالة كمقروءة' };
  }

  @Patch('messages/read-all')
  @UseGuards(PortalAuthGuard)
  async markAllMessagesAsRead(
    @PortalOrg() organizationId: string,
    @PortalClient() clientId: string,
    @Query('caseId') caseId?: string,
  ) {
    await this.messagingService.markAllAsRead(organizationId, clientId, caseId);
    return { success: true, message: 'تم تحديد جميع الرسائل كمقروءة' };
  }

  @Get('messages/unread-count')
  @UseGuards(PortalAuthGuard)
  async getUnreadCount(
    @PortalOrg() organizationId: string,
    @PortalClient() clientId: string,
  ) {
    const count = await this.messagingService.getUnreadCount(organizationId, clientId);
    return { success: true, data: { unreadCount: count } };
  }

  // ─── ACTION CENTER ──────────────────────────────────────────────
  @Get('actions')
  @UseGuards(PortalAuthGuard)
  async getPendingActions(
    @PortalOrg() organizationId: string,
    @PortalClient() clientId: string,
  ) {
    const data = await this.actionsService.getPendingActions(organizationId, clientId);
    return { success: true, data };
  }

  @Get('actions/all')
  @UseGuards(PortalAuthGuard)
  async getAllActions(
    @PortalOrg() organizationId: string,
    @PortalClient() clientId: string,
  ) {
    const data = await this.actionsService.getAllActions(organizationId, clientId);
    return { success: true, data };
  }

  @Get('actions/summary')
  @UseGuards(PortalAuthGuard)
  async getActionsSummary(
    @PortalOrg() organizationId: string,
    @PortalClient() clientId: string,
  ) {
    const data = await this.actionsService.getActionsSummary(organizationId, clientId);
    return { success: true, data };
  }

  @Patch('actions/:id/complete')
  @UseGuards(PortalAuthGuard)
  async completeAction(
    @PortalOrg() organizationId: string,
    @PortalClient() clientId: string,
    @Param('id') actionId: string,
  ) {
    const data = await this.actionsService.completeAction(organizationId, clientId, actionId);
    return { success: true, data };
  }

  // ─── APPOINTMENTS ───────────────────────────────────────────────
  @Get('appointments')
  @UseGuards(PortalAuthGuard)
  async getAppointments(
    @PortalOrg() organizationId: string,
    @PortalClient() clientId: string,
  ) {
    const data = await this.appointmentsService.getAppointments(organizationId, clientId);
    return { success: true, data };
  }

  @Get('appointments/upcoming')
  @UseGuards(PortalAuthGuard)
  async getUpcomingAppointments(
    @PortalOrg() organizationId: string,
    @PortalClient() clientId: string,
  ) {
    const data = await this.appointmentsService.getUpcomingAppointments(organizationId, clientId);
    return { success: true, data };
  }

  @Post('appointments')
  @UseGuards(PortalAuthGuard)
  async requestAppointment(
    @PortalOrg() organizationId: string,
    @PortalClient() clientId: string,
    @Body() dto: RequestAppointmentDto,
  ) {
    const perms = await this.permissionsService.getClientPermissions(organizationId, clientId);
    if (!perms.canRequestAppointment) {
      throw new ForbiddenException('صلاحية طلب مواعيد جديدة مغلقة من قِبل إدارة المكتب.');
    }
    const data = await this.appointmentsService.requestAppointment(organizationId, clientId, dto);
    return { success: true, data };
  }

  @Delete('appointments/:id')
  @UseGuards(PortalAuthGuard)
  async cancelAppointment(
    @PortalOrg() organizationId: string,
    @PortalClient() clientId: string,
    @Param('id') appointmentId: string,
  ) {
    await this.appointmentsService.cancelAppointment(organizationId, clientId, appointmentId);
    return { success: true, message: 'تم إلغاء الموعد بنجاح' };
  }

  // ─── PERMISSIONS ────────────────────────────────────────────────
  @Get('permissions')
  @UseGuards(PortalAuthGuard)
  async getPermissions(
    @PortalOrg() organizationId: string,
    @PortalClient() clientId: string,
  ) {
    const data = await this.permissionsService.getClientPermissions(organizationId, clientId);
    return { success: true, data };
  }

  // ─── ACTIVITY LOG ───────────────────────────────────────────────
  @Get('activity-log')
  @UseGuards(PortalAuthGuard)
  async getActivityLog(
    @PortalOrg() organizationId: string,
    @PortalClient() clientId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const data = await this.auditService.getActivityLog(
      organizationId,
      clientId,
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
    );
    return { success: true, data };
  }
}
