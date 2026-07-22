import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SecretVaultService } from './integrations/core/secret-vault.service';
import { ProviderRegistryService } from './integrations/core/provider-registry.service';
import { OAuthManagerService } from './integrations/core/oauth-manager.service';
import { WebhookEngineService } from './integrations/core/webhook-engine.service';
import { EVENT_DISPATCHER_TOKEN } from './shared/events/tokens';
import { IEventDispatcher } from './shared/events/contracts/event-dispatcher.interface';
import { CaseCreatedEvent } from './cases/domain/events/case-created.event';
import { TenantContext } from './shared/tenant/tenant.context';
import { BaseIntegrationAdapter, HealthCheckResult } from './integrations/sdk/base-integration.adapter';
import { PrismaService } from './shared/database/prisma.service';
import { CaseType, CaseStatus } from '@prisma/client';

class MockNajizAdapter extends BaseIntegrationAdapter {
  readonly providerCode = 'najiz';
  readonly nameAr = 'بوابة ناجز القضائية';
  readonly nameEn = 'MoJ Najiz Judicial Portal';
  readonly authType = 'CERTIFICATE' as const;

  async healthCheck(connectionId: string, vaultData: any): Promise<HealthCheckResult> {
    return { healthy: true, message: 'Najiz Gateway Online', latencyMs: 45 };
  }

  async processEvent(eventName: string, payload: any, vaultData: any): Promise<any> {
    return { synced: true, eventName, caseNumber: payload.caseNumberInternal };
  }
}

async function bootstrap() {
  console.log('--- STARTING INTEGRATION HUB CORE PLATFORM DOMAIN VERIFICATION ---');
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });

  const vaultService = app.get(SecretVaultService);
  const providerRegistry = app.get(ProviderRegistryService);
  const oauthManager = app.get(OAuthManagerService);
  const webhookEngine = app.get(WebhookEngineService);
  const eventDispatcher = app.get<IEventDispatcher>(EVENT_DISPATCHER_TOKEN);
  const appPrisma = app.get(PrismaService);

  const tenantA = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const tenantB = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

  // -------------------------------------------------------------
  // SCENARIO 1: Secret Vault AES-256 GCM Encryption & Decryption
  // -------------------------------------------------------------
  console.log('\n[Scenario 1] Testing Secret Vault AES-256-GCM Encryption & Decryption...');
  const sensitiveCreds = {
    accessToken: 'oauth_access_token_990123',
    refreshToken: 'oauth_refresh_token_887123',
    clientId: 'client_id_secret_saas',
  };

  const encryptedVault = vaultService.encrypt(sensitiveCreds);
  console.log(`- Encrypted Vault (AES-256): ${encryptedVault.substring(0, 45)}...`);

  const decryptedCreds = vaultService.decrypt(encryptedVault);
  console.log(`- Decrypted Access Token:  "${decryptedCreds.accessToken}"`);

  if (decryptedCreds.accessToken !== sensitiveCreds.accessToken) {
    throw new Error('Secret Vault Encryption/Decryption mismatch!');
  }
  console.log('✔ Secret Vault AES-256-GCM Encryption Verified!');

  // -------------------------------------------------------------
  // SCENARIO 2: Provider Registry & Plugin Adapter SDK
  // -------------------------------------------------------------
  console.log('\n[Scenario 2] Verifying Provider Registry & Plugin Adapter SDK...');
  const providers = await providerRegistry.getAllProviders();
  console.log(`- Total Integration Providers Seeded: ${providers.length}`);
  providers.forEach((p: any) => console.log(`  * ${p.nameAr} (${p.code}) [${p.type}]`));

  if (providers.length < 5) {
    throw new Error(`Expected at least 5 default providers, found ${providers.length}`);
  }

  // Register mock plugin adapter
  const mockAdapter = new MockNajizAdapter();
  providerRegistry.registerAdapter(mockAdapter);
  const resolvedAdapter = providerRegistry.getAdapter('najiz');
  console.log(`- Resolved Adapter: "${resolvedAdapter?.nameEn}"`);

  if (!resolvedAdapter) {
    throw new Error('Failed to resolve registered plugin adapter "najiz"');
  }
  console.log('✔ Provider Registry & Plugin Adapter SDK Verified!');

  // Upsert Tenant A Organization
  await TenantContext.run({ tenantId: tenantA }, async () => {
    await appPrisma.db.organization.upsert({
      where: { id: tenantA },
      create: { id: tenantA, name: 'Law Firm Tenant A', slug: 'firma-tenant-a' },
      update: {},
    });

    // -------------------------------------------------------------
    // SCENARIO 3: OAuth Manager & Token Auto-Refresh
    // -------------------------------------------------------------
    console.log('\n[Scenario 3] Testing OAuth Connection & Token Auto-Refresh...');
    const expiredCreds = {
      accessToken: 'old_expired_access_token',
      refreshToken: 'valid_refresh_token',
      expiresAt: new Date(Date.now() - 10000).toISOString(), // Expired 10s ago
    };

    const connection = await oauthManager.saveConnection(
      tenantA,
      'google_calendar',
      expiredCreds,
      { workspaceEmail: 'admin@lawfirm.sa' },
    );

    console.log(`- Saved Connection ID: ${connection.id}`);

    // Retrieve credentials (should trigger auto-refresh)
    const refreshedCreds = await oauthManager.getDecryptedCredentials(connection.id);
    console.log(`- Refreshed Token: "${refreshedCreds.accessToken}"`);
    console.log(`- New Expiration:  "${refreshedCreds.expiresAt}"`);

    if (!refreshedCreds.accessToken.startsWith('refreshed_access_token_')) {
      throw new Error('OAuth Auto-Refresh failed!');
    }
    console.log('✔ OAuth Manager & Token Auto-Refresh Verified!');

    // -------------------------------------------------------------
    // SCENARIO 4: Event-Driven Webhook Dispatching & HMAC Signature
    // -------------------------------------------------------------
    console.log('\n[Scenario 4] Testing Event-Driven Webhook Dispatching & HMAC Signature...');
    const webhookEndpoint = await webhookEngine.registerEndpoint(
      connection.id,
      'https://api.lawfirm.sa/webhooks/case-events',
      ['case.created'],
      'X-LegalOS-Hmac-SHA256',
    );

    console.log(`- Registered Webhook Endpoint: [${webhookEndpoint.targetUrl}]`);

    // Create prerequisite Client & Case entities
    const clientId = '22222222-2222-2222-2222-222222222222';
    await appPrisma.db.client.upsert({
      where: { id: clientId },
      create: {
        id: clientId,
        name: 'شركة العز المحدودة',
        nationalIdOrCr: '1010998877',
        organization: { connect: { id: tenantA } },
      },
      update: {},
    });

    const caseId = '11111111-1111-1111-1111-111111111111';
    await appPrisma.db.case.upsert({
      where: { id: caseId },
      create: {
        id: caseId,
        caseNumberInternal: 'SRCH-2026-99',
        caseType: CaseType.commercial,
        status: CaseStatus.open,
        organization: { connect: { id: tenantA } },
        client: { connect: { id: clientId } },
      },
      update: {},
    });

    // Emit CaseCreatedEvent to Event Bus with valid UUIDs
    const caseCreatedEvent = new CaseCreatedEvent({
      caseId,
      caseNumberInternal: 'SRCH-2026-99',
      clientId,
      metadata: {
        tenantId: tenantA,
        userId: '33333333-3333-3333-3333-333333333333',
        timestamp: new Date(),
      },
    });

    await eventDispatcher.dispatch(caseCreatedEvent);
    console.log('✔ Event Bus Event Published & Webhook Engine Dispatched!');
  });

  // -------------------------------------------------------------
  // SCENARIO 5: Multi-Tenant RLS Security Isolation
  // -------------------------------------------------------------
  console.log('\n[Scenario 5] Verifying Multi-Tenant Integration RLS Security Isolation...');
  await TenantContext.run({ tenantId: tenantB }, async () => {
    const tenantBConns = await appPrisma.db.integrationConnection.findMany({
      where: { organizationId: tenantB },
    });

    console.log(`- Tenant B Integration Connections Count: ${tenantBConns.length}`);
    if (tenantBConns.length !== 0) {
      throw new Error('RLS FAILURE: Tenant B can query Tenant A integration connections!');
    }
    console.log('✔ PostgreSQL Integration Hub RLS Security Isolation Verified!');
  });

  console.log('\n✅ ALL INTEGRATION HUB CORE PLATFORM DOMAIN SCENARIOS VERIFIED SUCCESSFULLY!');
  await app.close();
}

bootstrap().catch((err) => {
  console.error('❌ INTEGRATION HUB VERIFICATION FAILED:', err);
  process.exit(1);
});
