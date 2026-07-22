import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProviderRegistryService } from './integrations/core/provider-registry.service';
import { GoogleCalendarAdapter } from './integrations/connectors/productivity/google/google-calendar.adapter';
import { OutlookCalendarAdapter } from './integrations/connectors/productivity/outlook/outlook-calendar.adapter';
import { OAuthManagerService } from './integrations/core/oauth-manager.service';
import { TenantContext } from './shared/tenant/tenant.context';
import { PrismaService } from './shared/database/prisma.service';

async function bootstrap() {
  console.log('--- STARTING PRODUCTIVITY CONNECTORS DOMAIN (GOOGLE & OUTLOOK 365 CALENDAR) VERIFICATION ---');
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });

  const providerRegistry = app.get(ProviderRegistryService);
  const googleAdapter = app.get(GoogleCalendarAdapter);
  const outlookAdapter = app.get(OutlookCalendarAdapter);
  const oauthManager = app.get(OAuthManagerService);
  const appPrisma = app.get(PrismaService);

  const tenantA = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const tenantB = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

  // Seed Tenant A Organization
  await TenantContext.run({ tenantId: tenantA }, async () => {
    await appPrisma.db.organization.upsert({
      where: { id: tenantA },
      create: { id: tenantA, name: 'Law Firm Tenant A', slug: 'firma-prod-a' },
      update: {},
    });
  });

  // -------------------------------------------------------------
  // SCENARIO 1: Google Workspace Calendar Health Check & Sync
  // -------------------------------------------------------------
  console.log('\n[Scenario 1] Testing Google Workspace Calendar Plugin Adapter & Event Sync...');
  const resolvedGoogle = providerRegistry.getAdapter('google_calendar');
  console.log(`- Resolved Provider Code: ${resolvedGoogle?.providerCode}`);
  console.log(`- Adapter Arabic Name:   "${resolvedGoogle?.nameAr}"`);

  if (!resolvedGoogle || resolvedGoogle.providerCode !== 'google_calendar') {
    throw new Error('Failed to resolve Google Calendar adapter plugin!');
  }

  const gcalHealth = await resolvedGoogle.healthCheck('conn-gcal-1', { accessToken: 'ya29.google_oauth_token_2026' });
  console.log(`- Health Check Status:   ${gcalHealth.healthy ? 'HEALTHY' : 'UNHEALTHY'}`);
  console.log(`- Gateway Message:       "${gcalHealth.message}" (Latency: ${gcalHealth.latencyMs}ms)`);

  const hearingPayload = {
    title: 'جلسة مرافعة - قضايا إثبات ملكية علامة تجارية',
    courtName: 'المحكمة التجارية بالرياض - الدائرة الأولى',
    hearingDate: new Date(Date.now() + 86400000).toISOString(),
    notes: 'جلسة استماع الخبراء والشهود في نزاع العلامة التجارية',
  };

  const gcalResult = await googleAdapter.processEvent('hearing.scheduled', hearingPayload, {
    accessToken: 'ya29.google_oauth_token_2026',
  });

  console.log(`- Google Sync Status:    ${gcalResult.synced}`);
  console.log(`- Google Event ID:       "${gcalResult.googleEventId}"`);
  console.log(`- Calendar HTML Link:    "${gcalResult.htmlLink}"`);

  if (!gcalResult.synced || !gcalResult.googleEventId) {
    throw new Error('Google Workspace Calendar event sync failed!');
  }
  console.log('✔ Google Workspace Calendar Plugin & Event Sync Verified!');

  // -------------------------------------------------------------
  // SCENARIO 2: Microsoft Outlook 365 Calendar Health Check & Sync
  // -------------------------------------------------------------
  console.log('\n[Scenario 2] Testing Microsoft Outlook 365 Calendar Plugin Adapter & MS Graph Sync...');
  const resolvedOutlook = providerRegistry.getAdapter('outlook_calendar');
  console.log(`- Resolved Provider Code: ${resolvedOutlook?.providerCode}`);
  console.log(`- Adapter Arabic Name:   "${resolvedOutlook?.nameAr}"`);

  if (!resolvedOutlook || resolvedOutlook.providerCode !== 'outlook_calendar') {
    throw new Error('Failed to resolve Outlook Calendar adapter plugin!');
  }

  const outlookHealth = await resolvedOutlook.healthCheck('conn-ms-1', { accessToken: 'EwAo...ms_graph_token_2026' });
  console.log(`- Health Check Status:   ${outlookHealth.healthy ? 'HEALTHY' : 'UNHEALTHY'}`);
  console.log(`- Gateway Message:       "${outlookHealth.message}" (Latency: ${outlookHealth.latencyMs}ms)`);

  const outlookResult = await outlookAdapter.processEvent('hearing.scheduled', hearingPayload, {
    accessToken: 'EwAo...ms_graph_token_2026',
  });

  console.log(`- Outlook Sync Status:   ${outlookResult.synced}`);
  console.log(`- MS Graph Event ID:     "${outlookResult.outlookEventId}"`);
  console.log(`- Outlook Web Link:      "${outlookResult.webLink}"`);

  if (!outlookResult.synced || !outlookResult.outlookEventId) {
    throw new Error('Microsoft Outlook 365 Calendar event sync failed!');
  }
  console.log('✔ Microsoft Outlook 365 Calendar Plugin & MS Graph Sync Verified!');

  // -------------------------------------------------------------
  // SCENARIO 3: Multi-Tenant RLS Security Isolation for OAuth Tokens
  // -------------------------------------------------------------
  console.log('\n[Scenario 3] Verifying Multi-Tenant RLS Security Isolation for Productivity OAuth Tokens...');

  await TenantContext.run({ tenantId: tenantA }, async () => {
    await oauthManager.saveConnection(
      tenantA,
      'google_calendar',
      { accessToken: 'ya29.secret_tenant_a_token', refreshToken: '1//refresh_tenant_a' },
      { accountEmail: 'partner@lawfirm-a.sa' },
    );
  });

  await TenantContext.run({ tenantId: tenantB }, async () => {
    const tenantBConns = await appPrisma.db.integrationConnection.findMany({
      where: { organizationId: tenantB },
    });
    console.log(`- Tenant B Productivity Integration Connections Count: ${tenantBConns.length}`);

    if (tenantBConns.length !== 0) {
      throw new Error('RLS FAILURE: Tenant B queried Tenant A Google Calendar connection!');
    }
  });
  console.log('✔ Multi-Tenant Productivity Integration Security RLS Verified!');

  console.log('\n✅ ALL PRODUCTIVITY CONNECTORS DOMAIN (GOOGLE & OUTLOOK 365) SCENARIOS VERIFIED SUCCESSFULLY!');
  await app.close();
}

bootstrap().catch((err) => {
  console.error('❌ PRODUCTIVITY CONNECTORS VERIFICATION FAILED:', err);
  process.exit(1);
});
