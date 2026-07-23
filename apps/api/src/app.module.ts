import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './shared/database/prisma.module';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuditInterceptor } from './shared/interceptors/audit.interceptor';
import { IamModule } from './iam/iam.module';
import { TenantMiddleware } from './shared/tenant/tenant.middleware';
import { CasesModule } from './cases/cases.module';
import { CrmModule } from './crm/crm.module';
import { StorageModule } from './shared/storage/storage.module';
import { DocumentsModule } from './documents/documents.module';
import { EmailModule } from './shared/email/email.module';
import { NotificationsModule } from './notifications/notifications.module';
import { WorkflowModule } from './workflow/workflow.module';
import { EventsModule } from './shared/events/events.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { PolicyModule } from './shared/policy/policy.module';
import { FinanceModule } from './finance/finance.module';
import { CalendarModule } from './calendar/calendar.module';
import { JobsModule } from './shared/jobs/jobs.module';
import { SearchModule } from './search/search.module';
import { BillingModule } from './billing/billing.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { PortalModule } from './portal/portal.module';
import { ReportsModule } from './reports/reports.module';
import { AiModule } from './ai/ai.module';
import { AdminControlModule } from './admin/admin-control.module';

@Module({
  imports: [
    // ── Security: Global Rate Limiting (60 req / 60 sec per IP) ──
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),
    PrismaModule,
    EventsModule,
    PolicyModule,
    IamModule,
    CasesModule,
    CrmModule,
    StorageModule,
    DocumentsModule,
    EmailModule,
    NotificationsModule,
    WorkflowModule,
    WorkspaceModule,
    FinanceModule,
    CalendarModule,
    JobsModule,
    SearchModule,
    BillingModule,
    IntegrationsModule,
    PortalModule,
    ReportsModule,
    AiModule,
    AdminControlModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
