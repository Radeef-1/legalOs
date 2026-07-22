import { Module } from '@nestjs/common';
import { PrismaModule } from '../shared/database/prisma.module';
import { PortalAuthService } from './application/services/portal-auth.service';
import { PortalCasesService } from './application/services/portal-cases.service';
import { PortalDocumentsService } from './application/services/portal-documents.service';
import { PortalFinanceService } from './application/services/portal-finance.service';
import { PortalDashboardService } from './application/services/portal-dashboard.service';
import { PortalTimelineService } from './application/services/portal-timeline.service';
import { PortalMessagingService } from './application/services/portal-messaging.service';
import { PortalActionsService } from './application/services/portal-actions.service';
import { PortalAppointmentsService } from './application/services/portal-appointments.service';
import { PortalBrandingService } from './application/services/portal-branding.service';
import { PortalPermissionsService } from './application/services/portal-permissions.service';
import { PortalAuditService } from './application/services/portal-audit.service';
import { ClientPortalController } from './controllers/client-portal.controller';
import { PortalAdminController } from './controllers/portal-admin.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ClientPortalController, PortalAdminController],
  providers: [
    PortalAuthService,
    PortalCasesService,
    PortalDocumentsService,
    PortalFinanceService,
    PortalDashboardService,
    PortalTimelineService,
    PortalMessagingService,
    PortalActionsService,
    PortalAppointmentsService,
    PortalBrandingService,
    PortalPermissionsService,
    PortalAuditService,
  ],
  exports: [
    PortalAuthService,
    PortalCasesService,
    PortalDocumentsService,
    PortalFinanceService,
    PortalDashboardService,
    PortalTimelineService,
    PortalMessagingService,
    PortalActionsService,
    PortalAppointmentsService,
    PortalBrandingService,
    PortalPermissionsService,
    PortalAuditService,
  ],
})
export class PortalModule {}
