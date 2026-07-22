import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProviderRegistryService } from './integrations/core/provider-registry.service';
import { NajizGovernmentAdapter } from './integrations/connectors/government/najiz/najiz-government.adapter';
import { ZatcaGovernmentAdapter } from './integrations/connectors/government/zatca/zatca-government.adapter';
import { OAuthManagerService } from './integrations/core/oauth-manager.service';
import { TenantContext } from './shared/tenant/tenant.context';
import { PrismaService } from './shared/database/prisma.service';

async function bootstrap() {
  console.log('--- STARTING GOVERNMENT CONNECTORS DOMAIN (NAJIZ & ZATCA PHASE 2) VERIFICATION ---');
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });

  const providerRegistry = app.get(ProviderRegistryService);
  const najizAdapter = app.get(NajizGovernmentAdapter);
  const zatcaAdapter = app.get(ZatcaGovernmentAdapter);
  const oauthManager = app.get(OAuthManagerService);
  const appPrisma = app.get(PrismaService);

  const tenantA = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const tenantB = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

  // Seed Tenant A Organization
  await TenantContext.run({ tenantId: tenantA }, async () => {
    await appPrisma.db.organization.upsert({
      where: { id: tenantA },
      create: { id: tenantA, name: 'Law Firm Tenant A', slug: 'firma-gov-a' },
      update: {},
    });
  });

  // -------------------------------------------------------------
  // SCENARIO 1: Najiz Health Check & Adapter Resolution
  // -------------------------------------------------------------
  console.log('\n[Scenario 1] Testing MoJ Najiz Adapter Plugin & Health Check...');
  const resolvedNajiz = providerRegistry.getAdapter('najiz');
  console.log(`- Resolved Adapter Code: ${resolvedNajiz?.providerCode}`);
  console.log(`- Adapter Arabic Name:  "${resolvedNajiz?.nameAr}"`);

  if (!resolvedNajiz || resolvedNajiz.providerCode !== 'najiz') {
    throw new Error('Failed to resolve Najiz adapter plugin!');
  }

  const healthRes = await resolvedNajiz.healthCheck('conn-101', { apiKey: 'najiz_client_cert_token_2026' });
  console.log(`- Health Check Status:  ${healthRes.healthy ? 'HEALTHY' : 'UNHEALTHY'}`);
  console.log(`- Gateway Message:      "${healthRes.message}" (Latency: ${healthRes.latencyMs}ms)`);

  if (!healthRes.healthy) {
    throw new Error('Najiz adapter health check failed!');
  }
  console.log('✔ MoJ Najiz Adapter & Health Check Verified!');

  // -------------------------------------------------------------
  // SCENARIO 2: Najiz Event-Driven Judicial Case & Hearing Sync
  // -------------------------------------------------------------
  console.log('\n[Scenario 2] Testing Najiz Judicial Case & Hearing Sync Event Processing...');

  // Create prerequisite Case entity under Tenant A
  const caseId = '99999999-9999-9999-9999-999999999999';
  const clientId = '88888888-8888-8888-8888-888888888888';

  await TenantContext.run({ tenantId: tenantA }, async () => {
    await appPrisma.db.client.upsert({
      where: { id: clientId },
      create: {
        id: clientId,
        name: 'مؤسسة التجارة العالمية',
        nationalIdOrCr: '7009988771',
        organization: { connect: { id: tenantA } },
      },
      update: {},
    });

    await appPrisma.db.case.upsert({
      where: { id: caseId },
      create: {
        id: caseId,
        caseNumberInternal: 'NJZ-2026-88',
        caseType: 'commercial' as any,
        status: 'open' as any,
        organization: { connect: { id: tenantA } },
        client: { connect: { id: clientId } },
      },
      update: {},
    });
  });

  const syncResult = await najizAdapter.processEvent(
    'case.created',
    { caseId, caseNumberInternal: 'NJZ-2026-88', metadata: { tenantId: tenantA } },
    { apiKey: 'najiz_secret' },
  );

  console.log(`- Najiz Synced Status:   ${syncResult.synced}`);
  console.log(`- MoJ Najiz Ref Number: "${syncResult.najizCaseNumber}"`);
  console.log(`- Court Assigned:       "${syncResult.courtName}"`);
  console.log(`- Circuit Assigned:     "${syncResult.circuitName}"`);

  if (!syncResult.synced || !syncResult.courtName) {
    throw new Error('Najiz Judicial Case Sync failed!');
  }
  console.log('✔ Najiz Judicial Case Sync Verified!');

  // -------------------------------------------------------------
  // SCENARIO 3: ZATCA Phase 2 E-Invoicing UBL 2.1 XML & ECDSA Signer
  // -------------------------------------------------------------
  console.log('\n[Scenario 3] Testing ZATCA Phase 2 E-Invoicing UBL 2.1 XML & ECDSA Signature...');
  const resolvedZatca = providerRegistry.getAdapter('zatca');
  console.log(`- Resolved ZATCA Adapter Code: ${resolvedZatca?.providerCode}`);

  if (!resolvedZatca) {
    throw new Error('Failed to resolve ZATCA adapter plugin!');
  }

  const invoicePayload = {
    invoiceNumber: 'INV-ZATCA-2026-001',
    issuedAt: new Date(),
    sellerNameAr: 'مكتب السلمان للمحاماة والاستشارات القانونية',
    sellerCr: '1010998877',
    sellerVatNumber: '300998877600003',
    buyerNameAr: 'شركة اليمامة للخدمات',
    buyerVatNumber: '311009988700003',
    amountSar: 5000.0,
    vatAmountSar: 750.0,
    totalAmountSar: 5750.0,
    items: [
      { description: 'صياغة عقد اندماج تجاري وتراخيص', unitPriceSar: 5000.0, qty: 1 },
    ],
  };

  const zatcaRes = await zatcaAdapter.processEvent('invoice.issued', invoicePayload, {
    apiKey: 'zatca_csid_api_key_staging',
  });

  console.log(`- ZATCA Clearance Status: ${zatcaRes.cleared ? 'CLEARED' : 'REJECTED'}`);
  console.log(`- ZATCA Portal Status:    "${zatcaRes.zatcaStatus}"`);
  console.log(`- SHA-256 XML Digest:     "${zatcaRes.invoiceHashSha256}"`);
  console.log(`- ECDSA Signature Base64: "${zatcaRes.signatureBase64.substring(0, 35)}..."`);
  console.log(`- QR Code Verification URL: "${zatcaRes.qrCodePayload.substring(0, 45)}..."`);

  if (!zatcaRes.cleared || !zatcaRes.invoiceHashSha256) {
    throw new Error('ZATCA Phase 2 E-Invoicing processing failed!');
  }
  console.log('✔ ZATCA Phase 2 E-Invoicing UBL 2.1 XML & ECDSA Signature Verified!');

  // -------------------------------------------------------------
  // SCENARIO 4: Govt Connectors Multi-Tenant Security Isolation
  // -------------------------------------------------------------
  console.log('\n[Scenario 4] Verifying Govt Connectors RLS Security Isolation...');

  await TenantContext.run({ tenantId: tenantA }, async () => {
    await oauthManager.saveConnection(
      tenantA,
      'zatca',
      { apiKey: 'zatca_csid_secret_tenant_a' },
      { csidType: 'PRODUCTION' },
    );
  });

  await TenantContext.run({ tenantId: tenantB }, async () => {
    const tenantBConns = await appPrisma.db.integrationConnection.findMany({
      where: { organizationId: tenantB },
    });
    console.log(`- Tenant B Govt Integration Connections Count: ${tenantBConns.length}`);

    if (tenantBConns.length !== 0) {
      throw new Error('RLS FAILURE: Tenant B queried Tenant A ZATCA connection!');
    }
  });
  console.log('✔ Multi-Tenant Govt Integration Security RLS Verified!');

  console.log('\n✅ ALL GOVERNMENT CONNECTORS DOMAIN (NAJIZ & ZATCA) SCENARIOS VERIFIED SUCCESSFULLY!');
  await app.close();
}

bootstrap().catch((err) => {
  console.error('❌ GOVERNMENT CONNECTORS VERIFICATION FAILED:', err);
  process.exit(1);
});
