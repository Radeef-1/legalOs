import { Controller, Post, Get, Patch, Delete, Body, Param, Headers, Query } from '@nestjs/common';
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

  // ─── AUTH ────────────────────────────────────────────────────────
  @Post('auth/request-otp')
  async requestOtp(@Headers('x-tenant-id') organizationId: string, @Body('nationalIdOrCr') nationalIdOrCr: string) {
    return this.authService.requestOtp(organizationId, nationalIdOrCr);
  }

  @Post('auth/verify-otp')
  async verifyOtp(
    @Headers('x-tenant-id') organizationId: string,
    @Body('nationalIdOrCr') nationalIdOrCr: string,
    @Body('otpCode') otpCode: string,
  ) {
    return this.authService.verifyOtp(organizationId, nationalIdOrCr, otpCode);
  }

  // ─── BRANDING (Public — no auth needed for login page) ──────────
  @Get('branding/:slug')
  async getBrandingBySlug(@Param('slug') slug: string) {
    return this.brandingService.resolveBySlug(slug);
  }

  @Get('branding')
  async getBranding(@Headers('x-tenant-id') organizationId: string) {
    return this.brandingService.getBranding(organizationId);
  }

  // ─── DASHBOARD ──────────────────────────────────────────────────
  @Get('dashboard')
  async getDashboard(
    @Headers('x-tenant-id') organizationId: string,
    @Headers('x-client-id') clientId: string,
  ) {
    const data = await this.dashboardService.getDashboardSummary(organizationId, clientId);
    return { success: true, data };
  }

  // ─── CASES ──────────────────────────────────────────────────────
  @Get('cases')
  async getCases(@Headers('x-tenant-id') organizationId: string, @Headers('x-client-id') clientId: string) {
    const data = await this.casesService.getClientCases(organizationId, clientId);
    return { success: true, data };
  }

  @Get('cases/:id')
  async getCaseById(
    @Headers('x-tenant-id') organizationId: string,
    @Headers('x-client-id') clientId: string,
    @Param('id') caseId: string,
  ) {
    const data = await this.casesService.getClientCaseById(organizationId, clientId, caseId);
    return { success: true, data };
  }

  // ─── CASE TIMELINE & PROGRESS ───────────────────────────────────
  @Get('cases/:id/timeline')
  async getCaseTimeline(
    @Headers('x-tenant-id') organizationId: string,
    @Headers('x-client-id') clientId: string,
    @Param('id') caseId: string,
  ) {
    const data = await this.timelineService.getCaseTimeline(organizationId, clientId, caseId);
    return { success: true, data };
  }

  // ─── CLIENT REQUESTS ────────────────────────────────────────────
  @Post('requests')
  async submitRequest(
    @Headers('x-tenant-id') organizationId: string,
    @Headers('x-client-id') clientId: string,
    @Body() dto: SubmitClientRequestDto,
  ) {
    const data = await this.casesService.submitClientRequest(organizationId, clientId, dto);
    return { success: true, data };
  }

  // ─── DOCUMENTS ──────────────────────────────────────────────────
  @Get('documents')
  async getDocuments(@Headers('x-tenant-id') organizationId: string, @Headers('x-client-id') clientId: string) {
    const data = await this.documentsService.getClientDocuments(organizationId, clientId);
    return { success: true, data };
  }

  @Post('documents')
  async uploadDocument(
    @Headers('x-tenant-id') organizationId: string,
    @Headers('x-client-id') clientId: string,
    @Body('caseId') caseId: string,
    @Body('title') title: string,
    @Body('fileUrl') fileUrl: string,
  ) {
    const data = await this.documentsService.uploadClientDocument(organizationId, clientId, caseId, title, fileUrl);
    return { success: true, data };
  }

  // ─── INVOICES & PAYMENTS ────────────────────────────────────────
  @Get('invoices')
  async getInvoices(@Headers('x-tenant-id') organizationId: string, @Headers('x-client-id') clientId: string) {
    const data = await this.financeService.getClientInvoices(organizationId, clientId);
    return { success: true, data };
  }

  @Post('invoices/pay')
  async payInvoice(
    @Headers('x-tenant-id') organizationId: string,
    @Headers('x-client-id') clientId: string,
    @Body() dto: PayInvoiceOnlineDto,
  ) {
    const data = await this.financeService.payInvoiceOnline(organizationId, clientId, dto);
    return { success: true, data };
  }

  // ─── MESSAGING ──────────────────────────────────────────────────
  @Get('messages')
  async getMessages(
    @Headers('x-tenant-id') organizationId: string,
    @Headers('x-client-id') clientId: string,
    @Query('caseId') caseId?: string,
  ) {
    const data = await this.messagingService.getMessages(organizationId, clientId, caseId);
    return { success: true, data };
  }

  @Post('messages')
  async sendMessage(
    @Headers('x-tenant-id') organizationId: string,
    @Headers('x-client-id') clientId: string,
    @Body() dto: SendMessageDto,
  ) {
    const data = await this.messagingService.sendMessage(organizationId, clientId, dto);
    return { success: true, data };
  }

  @Patch('messages/:id/read')
  async markMessageAsRead(
    @Headers('x-tenant-id') organizationId: string,
    @Headers('x-client-id') clientId: string,
    @Param('id') messageId: string,
  ) {
    await this.messagingService.markAsRead(organizationId, clientId, messageId);
    return { success: true, message: 'تم تحديد الرسالة كمقروءة' };
  }

  @Patch('messages/read-all')
  async markAllMessagesAsRead(
    @Headers('x-tenant-id') organizationId: string,
    @Headers('x-client-id') clientId: string,
    @Query('caseId') caseId?: string,
  ) {
    await this.messagingService.markAllAsRead(organizationId, clientId, caseId);
    return { success: true, message: 'تم تحديد جميع الرسائل كمقروءة' };
  }

  @Get('messages/unread-count')
  async getUnreadCount(
    @Headers('x-tenant-id') organizationId: string,
    @Headers('x-client-id') clientId: string,
  ) {
    const count = await this.messagingService.getUnreadCount(organizationId, clientId);
    return { success: true, data: { unreadCount: count } };
  }

  // ─── ACTION CENTER ──────────────────────────────────────────────
  @Get('actions')
  async getPendingActions(
    @Headers('x-tenant-id') organizationId: string,
    @Headers('x-client-id') clientId: string,
  ) {
    const data = await this.actionsService.getPendingActions(organizationId, clientId);
    return { success: true, data };
  }

  @Get('actions/all')
  async getAllActions(
    @Headers('x-tenant-id') organizationId: string,
    @Headers('x-client-id') clientId: string,
  ) {
    const data = await this.actionsService.getAllActions(organizationId, clientId);
    return { success: true, data };
  }

  @Get('actions/summary')
  async getActionsSummary(
    @Headers('x-tenant-id') organizationId: string,
    @Headers('x-client-id') clientId: string,
  ) {
    const data = await this.actionsService.getActionsSummary(organizationId, clientId);
    return { success: true, data };
  }

  @Patch('actions/:id/complete')
  async completeAction(
    @Headers('x-tenant-id') organizationId: string,
    @Headers('x-client-id') clientId: string,
    @Param('id') actionId: string,
  ) {
    const data = await this.actionsService.completeAction(organizationId, clientId, actionId);
    return { success: true, data };
  }

  // ─── APPOINTMENTS ───────────────────────────────────────────────
  @Get('appointments')
  async getAppointments(
    @Headers('x-tenant-id') organizationId: string,
    @Headers('x-client-id') clientId: string,
  ) {
    const data = await this.appointmentsService.getAppointments(organizationId, clientId);
    return { success: true, data };
  }

  @Get('appointments/upcoming')
  async getUpcomingAppointments(
    @Headers('x-tenant-id') organizationId: string,
    @Headers('x-client-id') clientId: string,
  ) {
    const data = await this.appointmentsService.getUpcomingAppointments(organizationId, clientId);
    return { success: true, data };
  }

  @Post('appointments')
  async requestAppointment(
    @Headers('x-tenant-id') organizationId: string,
    @Headers('x-client-id') clientId: string,
    @Body() dto: RequestAppointmentDto,
  ) {
    const data = await this.appointmentsService.requestAppointment(organizationId, clientId, dto);
    return { success: true, data };
  }

  @Delete('appointments/:id')
  async cancelAppointment(
    @Headers('x-tenant-id') organizationId: string,
    @Headers('x-client-id') clientId: string,
    @Param('id') appointmentId: string,
  ) {
    await this.appointmentsService.cancelAppointment(organizationId, clientId, appointmentId);
    return { success: true, message: 'تم إلغاء الموعد بنجاح' };
  }

  // ─── PERMISSIONS ────────────────────────────────────────────────
  @Get('permissions')
  async getPermissions(
    @Headers('x-tenant-id') organizationId: string,
    @Headers('x-client-id') clientId: string,
  ) {
    const data = await this.permissionsService.getClientPermissions(organizationId, clientId);
    return { success: true, data };
  }

  // ─── ACTIVITY LOG ───────────────────────────────────────────────
  @Get('activity-log')
  async getActivityLog(
    @Headers('x-tenant-id') organizationId: string,
    @Headers('x-client-id') clientId: string,
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
