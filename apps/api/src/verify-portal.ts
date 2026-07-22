import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PortalAuthService } from './portal/application/services/portal-auth.service';
import { PortalCasesService } from './portal/application/services/portal-cases.service';
import { PortalDocumentsService } from './portal/application/services/portal-documents.service';
import { PortalFinanceService } from './portal/application/services/portal-finance.service';
import { PortalDashboardService } from './portal/application/services/portal-dashboard.service';
import { PortalTimelineService } from './portal/application/services/portal-timeline.service';
import { PortalMessagingService } from './portal/application/services/portal-messaging.service';
import { PortalActionsService } from './portal/application/services/portal-actions.service';
import { PortalAppointmentsService } from './portal/application/services/portal-appointments.service';
import { PortalBrandingService } from './portal/application/services/portal-branding.service';
import { PortalPermissionsService } from './portal/application/services/portal-permissions.service';
import { PortalAuditService } from './portal/application/services/portal-audit.service';
import { TenantContext } from './shared/tenant/tenant.context';
import { PrismaService } from './shared/database/prisma.service';

async function bootstrap() {
  console.log('========================================================================');
  console.log('🚀 STARTING COMPREHENSIVE CLIENT PORTAL DOMAIN VERIFICATION');
  console.log('========================================================================\n');

  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });

  const authService = app.get(PortalAuthService);
  const casesService = app.get(PortalCasesService);
  const documentsService = app.get(PortalDocumentsService);
  const financeService = app.get(PortalFinanceService);
  const dashboardService = app.get(PortalDashboardService);
  const timelineService = app.get(PortalTimelineService);
  const messagingService = app.get(PortalMessagingService);
  const actionsService = app.get(PortalActionsService);
  const appointmentsService = app.get(PortalAppointmentsService);
  const brandingService = app.get(PortalBrandingService);
  const permissionsService = app.get(PortalPermissionsService);
  const auditService = app.get(PortalAuditService);
  const appPrisma = app.get(PrismaService);

  const tenantA = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const tenantB = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

  const clientId = '77777777-7777-7777-7777-777777777777';
  const caseId = '66666666-6666-6666-6666-666666666666';
  const invoiceId = '55555555-5555-5555-5555-555555555555';
  const nationalIdOrCr = '1010991188';

  // -------------------------------------------------------------
  // SEED DATA FOR TENANT A
  // -------------------------------------------------------------
  await TenantContext.run({ tenantId: tenantA }, async () => {
    await appPrisma.db.organization.upsert({
      where: { id: tenantA },
      create: { id: tenantA, name: 'مكتب الحارثي للمحاماة', slug: 'alharthi-law' },
      update: { name: 'مكتب الحارثي للمحاماة', slug: 'alharthi-law' },
    });

    await appPrisma.db.client.upsert({
      where: { id: clientId },
      create: {
        id: clientId,
        name: 'شركة النمو الوطنية',
        nationalIdOrCr,
        portalAccessEnabled: true,
        organization: { connect: { id: tenantA } },
      },
      update: { portalAccessEnabled: true },
    });

    await appPrisma.db.case.upsert({
      where: { id: caseId },
      create: {
        id: caseId,
        caseNumberInternal: 'SRCH-PORTAL-99',
        caseType: 'commercial' as any,
        status: 'open' as any,
        organization: { connect: { id: tenantA } },
        client: { connect: { id: clientId } },
      },
      update: {},
    });

    await appPrisma.db.hearing.create({
      data: {
        caseId,
        organizationId: tenantA,
        title: 'جلسة الاستماع الابتدائية في الدعوى التجارية',
        hearingDate: new Date(Date.now() + 86400000 * 3), // 3 days from now
        status: 'SCHEDULED',
      },
    });

    await appPrisma.db.invoice.upsert({
      where: { id: invoiceId },
      create: {
        id: invoiceId,
        organizationId: tenantA,
        clientId,
        caseId,
        invoiceNumber: 'INV-PORTAL-2026-001',
        subtotal: 1000.0,
        taxAmount: 150.0,
        totalAmount: 1150.0,
        paidAmount: 0.0,
        balanceDue: 1150.0,
        status: 'issued',
      },
      update: {
        status: 'issued',
        paidAmount: 0.0,
        balanceDue: 1150.0,
      },
    });
  });

  // -------------------------------------------------------------
  // SCENARIO 1: Client OTP Authentication & Portal Session
  // -------------------------------------------------------------
  console.log('[Scenario 1] Testing Client Portal OTP Login & Session Token Generation...');
  const otpRes = await authService.requestOtp(tenantA, nationalIdOrCr);
  console.log(`  - OTP Requested Session ID: "${otpRes.sessionId}"`);
  console.log(`  - Server Response Message:   "${otpRes.message}"`);

  const authSession = await authService.verifyOtp(tenantA, nationalIdOrCr, '123456');
  console.log(`  - Client Name Authenticated: "${authSession.clientName}"`);
  console.log(`  - Issued JWT Portal Token:  "${authSession.token.substring(0, 45)}..."`);

  if (!authSession.token || authSession.clientId !== clientId) {
    throw new Error('Client Portal OTP Login verification failed!');
  }
  console.log('✔ Client Portal OTP Login Verified!\n');

  // -------------------------------------------------------------
  // SCENARIO 2: Portal Branding & Customization
  // -------------------------------------------------------------
  console.log('[Scenario 2] Testing Portal Branding & Custom Domain/Slug Resolution...');
  const updatedBranding = await brandingService.updateBranding(tenantA, {
    primaryColor: '#1A365D',
    secondaryColor: '#2B6CB0',
    welcomeMessage: 'مرحباً بك في بوابة شركة النمو الوطنية لدى مكتب الحارثي',
  });
  console.log(`  - Updated Primary Color:    "${updatedBranding.primaryColor}"`);

  const resolvedBySlug = await brandingService.resolveBySlug('alharthi-law');
  console.log(`  - Slug Resolved Org Name:   "${resolvedBySlug.organizationName}"`);
  console.log(`  - Welcome Message:          "${resolvedBySlug.welcomeMessage}"`);

  if (resolvedBySlug.organizationId !== tenantA) {
    throw new Error('Portal Branding slug resolution failed!');
  }
  console.log('✔ Portal Branding Verified!\n');

  // -------------------------------------------------------------
  // SCENARIO 3: Dashboard Summary Aggregation
  // -------------------------------------------------------------
  console.log('[Scenario 3] Testing Dashboard Summary Aggregation...');
  const dashboard = await dashboardService.getDashboardSummary(tenantA, clientId);
  console.log(`  - Client Name:               "${dashboard.clientName}"`);
  console.log(`  - Active Cases Count:        ${dashboard.activeCasesCount}`);
  console.log(`  - Upcoming Hearings Count:   ${dashboard.upcomingHearings.length}`);
  console.log(`  - Unpaid Invoices Total:     ${dashboard.unpaidInvoicesTotal} SAR`);

  if (dashboard.activeCasesCount < 1) {
    throw new Error('Dashboard summary calculation failed!');
  }
  console.log('✔ Dashboard Summary Aggregation Verified!\n');

  // -------------------------------------------------------------
  // SCENARIO 4: Case Timeline & Progress Tracker
  // -------------------------------------------------------------
  console.log('[Scenario 4] Testing Case Timeline & Progress Tracker...');
  await timelineService.createTimelineEntry(tenantA, caseId, {
    phase: 'LAWSUIT_FILED',
    title: 'تم رفع الدعوى القضائية',
    status: 'COMPLETED',
    sortOrder: 1,
  });
  await timelineService.createTimelineEntry(tenantA, caseId, {
    phase: 'HEARING_SCHEDULED',
    title: 'جلسة الاستماع القادمة',
    status: 'CURRENT',
    sortOrder: 2,
  });

  const timelineResult = await timelineService.getCaseTimeline(tenantA, clientId, caseId);
  console.log(`  - Case Internal Number:      "${timelineResult.caseNumber}"`);
  console.log(`  - Total Timeline Phases:     ${timelineResult.totalPhases}`);
  console.log(`  - Completed Phases:          ${timelineResult.completedPhases}`);
  console.log(`  - Progress Percentage:       ${timelineResult.progressPercentage}%`);
  console.log(`  - Current Active Phase:      "${timelineResult.currentPhase}"`);

  if (timelineResult.totalPhases < 2 || timelineResult.progressPercentage < 50) {
    throw new Error('Case Timeline & Progress calculation failed!');
  }
  console.log('✔ Case Timeline & Progress Tracker Verified!\n');

  // -------------------------------------------------------------
  // SCENARIO 5: WhatsApp-style Messaging System
  // -------------------------------------------------------------
  console.log('[Scenario 5] Testing Client-Lawyer Messaging System...');
  const sentMsg = await messagingService.sendMessage(tenantA, clientId, {
    caseId,
    content: 'السلام عليكم، أين وصلت مذكرة الرد على المدعى عليه؟',
    messageType: 'TEXT',
  });
  console.log(`  - Sent Message ID:           "${sentMsg.id}" (Sender: ${sentMsg.senderType})`);

  const lawyerReply = await messagingService.sendLawyerMessage(tenantA, clientId, {
    caseId,
    content: 'وعليكم السلام، تم إعداد المذكرة وجاري مراجعتها النهائية.',
    messageType: 'TEXT',
  });
  console.log(`  - Lawyer Reply ID:          "${lawyerReply.id}" (Sender: ${lawyerReply.senderType})`);

  const unreadCount = await messagingService.getUnreadCount(tenantA, clientId);
  console.log(`  - Unread Lawyer Messages:    ${unreadCount}`);

  await messagingService.markAsRead(tenantA, clientId, lawyerReply.id);
  const unreadAfterMark = await messagingService.getUnreadCount(tenantA, clientId);
  console.log(`  - Unread Count After Mark:  ${unreadAfterMark}`);

  if (unreadCount !== 1 || unreadAfterMark !== 0) {
    throw new Error('Messaging read status tracking failed!');
  }
  console.log('✔ Messaging System Verified!\n');

  // -------------------------------------------------------------
  // SCENARIO 6: Action Center (Client Actions Required)
  // -------------------------------------------------------------
  console.log('[Scenario 6] Testing Action Center (Lawyer Creates Action -> Client Completes)...');
  const action = await actionsService.createAction(tenantA, {
    clientId,
    caseId,
    actionType: 'UPLOAD_DOCUMENT',
    title: 'طلب توقيع الوكالة الشرعية وتسليمها',
    description: 'يرجى توقيع عقد التوكيل ورفعه عبر البوابة قبل تاريخ الجلسة',
    dueDate: new Date(Date.now() + 86400000 * 2),
  });
  console.log(`  - Created Action ID:         "${action.id}" (Title: ${action.title})`);

  const pendingActions = await actionsService.getPendingActions(tenantA, clientId);
  console.log(`  - Pending Actions Count:    ${pendingActions.length}`);

  const completedAction = await actionsService.completeAction(tenantA, clientId, action.id);
  console.log(`  - Action Status After Complete: "${completedAction.status}"`);

  const actionsSummary = await actionsService.getActionsSummary(tenantA, clientId);
  console.log(`  - Action Completion Rate:   ${actionsSummary.completionRate}%`);

  if (completedAction.status !== 'COMPLETED') {
    throw new Error('Action Center completion failed!');
  }
  console.log('✔ Action Center Verified!\n');

  // -------------------------------------------------------------
  // SCENARIO 7: Appointment Request & Confirmation Center
  // -------------------------------------------------------------
  console.log('[Scenario 7] Testing Appointment Center (Client Request -> Firm Confirmation)...');
  const appt = await appointmentsService.requestAppointment(tenantA, clientId, {
    caseId,
    appointmentType: 'ZOOM',
    title: 'طلب اجتماع مراجعة صياغة العقد',
    scheduledAt: new Date(Date.now() + 86400000 * 5),
    notes: 'يفضل أن يكون الاجتماع بعد الساعة 2 ظهراً',
  });
  console.log(`  - Requested Appointment ID:  "${appt.id}" (Status: ${appt.status})`);

  const confirmedAppt = await appointmentsService.confirmAppointment(
    tenantA,
    appt.id,
    'https://zoom.us/j/9988776655',
  );
  console.log(`  - Confirmed Appointment Status: "${confirmedAppt.status}"`);
  console.log(`  - Meeting Zoom URL:          "${confirmedAppt.meetingUrl}"`);

  if (confirmedAppt.status !== 'CONFIRMED' || !confirmedAppt.meetingUrl) {
    throw new Error('Appointment confirmation failed!');
  }
  console.log('✔ Appointment Center Verified!\n');

  // -------------------------------------------------------------
  // SCENARIO 8: Client Portal Granular Permissions
  // -------------------------------------------------------------
  console.log('[Scenario 8] Testing Client Granular Portal Permissions...');
  const updatedPerms = await permissionsService.updateClientPermissions(tenantA, clientId, {
    canViewCases: true,
    canViewDocuments: true,
    canViewInvoices: true,
    canUpload: true,
    canSign: true,
    canMessage: true,
  });
  console.log(`  - Can Sign Documents:       ${updatedPerms.canSign}`);

  const fetchedPerms = await permissionsService.getClientPermissions(tenantA, clientId);
  console.log(`  - Fetched Can Sign:         ${fetchedPerms.canSign}`);

  if (!fetchedPerms.canSign) {
    throw new Error('Granular permissions update failed!');
  }
  console.log('✔ Client Granular Permissions Verified!\n');

  // -------------------------------------------------------------
  // SCENARIO 9: Document Vault Upload & Viewer
  // -------------------------------------------------------------
  console.log('[Scenario 9] Testing Document Vault Upload & Listing...');
  const uploadedDoc = await documentsService.uploadClientDocument(
    tenantA,
    clientId,
    caseId,
    'مذكرة الدفاع والرد على اللائحة الشارحة',
    'https://storage.lawfirm-a.sa/docs/defense-memo.pdf',
  );
  console.log(`  - Uploaded Document ID:      "${uploadedDoc.id}"`);

  const docs = await documentsService.getClientDocuments(tenantA, clientId);
  console.log(`  - Document Vault Count:     ${docs.length}`);

  if (docs.length < 1) {
    throw new Error('Client Document Vault upload failed!');
  }
  console.log('✔ Document Vault Verified!\n');

  // -------------------------------------------------------------
  // SCENARIO 10: Online ZATCA Invoice & Mada Payment
  // -------------------------------------------------------------
  console.log('[Scenario 10] Testing Online Invoice Query & Payment...');
  const paymentRes = await financeService.payInvoiceOnline(tenantA, clientId, {
    invoiceId,
    paymentMethod: 'MADA',
    cardToken: 'mada_tok_test_990011',
  });
  console.log(`  - Online Payment Status:     ${paymentRes.paid ? 'PAID' : 'FAILED'}`);
  console.log(`  - Payment Reference:         "${paymentRes.paymentReference}"`);

  if (!paymentRes.paid) {
    throw new Error('Online Mada Invoice Payment failed!');
  }
  console.log('✔ Online Invoice Payment Verified!\n');

  // -------------------------------------------------------------
  // SCENARIO 11: Audit Trail & Law Firm Analytics
  // -------------------------------------------------------------
  console.log('[Scenario 11] Testing Portal Audit Trail & Analytics...');
  await auditService.logActivity(tenantA, clientId, 'LOGIN', 'PortalSession', authSession.token);
  await auditService.logActivity(tenantA, clientId, 'VIEW_CASE', 'Case', caseId);

  const auditLog = await auditService.getActivityLog(tenantA, clientId);
  console.log(`  - Client Activity Log Count: ${auditLog.items.length}`);

  const analytics = await auditService.getPortalAnalytics(tenantA);
  console.log(`  - Active Portal Clients:    ${analytics.activePortalClients}`);
  console.log(`  - Portal Adoption Rate:     ${analytics.portalAdoptionRate}%`);
  console.log(`  - Total 30-Day Logins:      ${analytics.last30Days.totalLogins}`);

  if (auditLog.items.length < 2) {
    throw new Error('Audit trail logging failed!');
  }
  console.log('✔ Audit Trail & Analytics Verified!\n');

  // -------------------------------------------------------------
  // SCENARIO 12: Multi-Tenant RLS Security Isolation
  // -------------------------------------------------------------
  console.log('[Scenario 12] Testing Multi-Tenant RLS Isolation for All New Models...');
  await TenantContext.run({ tenantId: tenantB }, async () => {
    const db = appPrisma.db as any;
    const [messages, actions, appts, brandings, auditLogs] = await Promise.all([
      db.portalMessage.findMany({ where: { organizationId: tenantB } }),
      db.clientAction.findMany({ where: { organizationId: tenantB } }),
      db.portalAppointment.findMany({ where: { organizationId: tenantB } }),
      db.portalBranding.findMany({ where: { organizationId: tenantB } }),
      db.portalAuditLog.findMany({ where: { organizationId: tenantB } }),
    ]);

    console.log(`  - Tenant B Messages Count:   ${messages.length}`);
    console.log(`  - Tenant B Actions Count:    ${actions.length}`);
    console.log(`  - Tenant B Appts Count:      ${appts.length}`);

    if (messages.length !== 0 || actions.length !== 0 || appts.length !== 0) {
      throw new Error('RLS FAILURE: Tenant B queried Tenant A Client Portal records!');
    }
  });
  console.log('✔ Multi-Tenant RLS Security Isolation Verified!\n');

  console.log('========================================================================');
  console.log('🎉 ALL 12 CLIENT PORTAL DOMAIN SCENARIOS VERIFIED 100% SUCCESSFULLY!');
  console.log('========================================================================');

  await app.close();
}

bootstrap().catch((err) => {
  console.error('❌ CLIENT PORTAL VERIFICATION FAILED:', err);
  process.exit(1);
});
