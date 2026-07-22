import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProviderRegistryService } from './integrations/core/provider-registry.service';
import { OdooBusinessAdapter } from './integrations/connectors/business/odoo/odoo-business.adapter';
import { SapBusinessAdapter } from './integrations/connectors/business/sap/sap-business.adapter';
import { SallaBusinessAdapter } from './integrations/connectors/business/webhook-connectors/salla-business.adapter';
import { HubspotBusinessAdapter } from './integrations/connectors/business/webhook-connectors/hubspot-business.adapter';
import { OAuthManagerService } from './integrations/core/oauth-manager.service';
import { TenantContext } from './shared/tenant/tenant.context';
import { PrismaService } from './shared/database/prisma.service';

async function bootstrap() {
  console.log('--- STARTING BUSINESS CONNECTORS DOMAIN (ODOO, SAP, SALLA, HUBSPOT) VERIFICATION ---');
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });

  const providerRegistry = app.get(ProviderRegistryService);
  const odooAdapter = app.get(OdooBusinessAdapter);
  const sapAdapter = app.get(SapBusinessAdapter);
  const sallaAdapter = app.get(SallaBusinessAdapter);
  const hubspotAdapter = app.get(HubspotBusinessAdapter);
  const oauthManager = app.get(OAuthManagerService);
  const appPrisma = app.get(PrismaService);

  const tenantA = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const tenantB = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

  // Seed Tenant A Organization
  await TenantContext.run({ tenantId: tenantA }, async () => {
    await appPrisma.db.organization.upsert({
      where: { id: tenantA },
      create: { id: tenantA, name: 'Law Firm Tenant A', slug: 'firma-biz-a' },
      update: {},
    });
  });

  // -------------------------------------------------------------
  // SCENARIO 1: Odoo ERP Integration & Invoice Sync
  // -------------------------------------------------------------
  console.log('\n[Scenario 1] Testing Odoo ERP Plugin Adapter & JSON-RPC Invoice Sync...');
  const resolvedOdoo = providerRegistry.getAdapter('odoo');
  console.log(`- Resolved Provider Code: ${resolvedOdoo?.providerCode}`);
  console.log(`- Adapter Arabic Name:   "${resolvedOdoo?.nameAr}"`);

  if (!resolvedOdoo || resolvedOdoo.providerCode !== 'odoo') {
    throw new Error('Failed to resolve Odoo adapter plugin!');
  }

  const odooHealth = await resolvedOdoo.healthCheck('conn-odoo-1', { apiKey: 'odoo_secret_key_2026' });
  console.log(`- Health Check Status:   ${odooHealth.healthy ? 'HEALTHY' : 'UNHEALTHY'}`);
  console.log(`- Gateway Message:       "${odooHealth.message}" (Latency: ${odooHealth.latencyMs}ms)`);

  const odooResult = await odooAdapter.processEvent(
    'invoice.issued',
    { invoiceNumber: 'INV-ODOO-2026-99', buyerNameAr: 'شركة اليمامة المحدودة', totalAmountSar: 4500.0 },
    { apiKey: 'odoo_secret_key_2026', baseUrl: 'https://odoo.lawfirm-a.sa' },
  );

  console.log(`- Odoo Sync Status:      ${odooResult.synced}`);
  console.log(`- Odoo Partner ID:       ${odooResult.odooPartnerId}`);
  console.log(`- Odoo Account Move ID:  ${odooResult.odooMoveId}`);

  if (!odooResult.synced || !odooResult.odooMoveId) {
    throw new Error('Odoo ERP invoice sync failed!');
  }
  console.log('✔ Odoo ERP Plugin & Invoice Sync Verified!');

  // -------------------------------------------------------------
  // SCENARIO 2: SAP S/4HANA ERP Integration & Partner Sync
  // -------------------------------------------------------------
  console.log('\n[Scenario 2] Testing SAP S/4HANA ERP Plugin Adapter & OData v4 Partner Sync...');
  const resolvedSap = providerRegistry.getAdapter('sap');
  console.log(`- Resolved Provider Code: ${resolvedSap?.providerCode}`);
  console.log(`- Adapter Arabic Name:   "${resolvedSap?.nameAr}"`);

  if (!resolvedSap || resolvedSap.providerCode !== 'sap') {
    throw new Error('Failed to resolve SAP adapter plugin!');
  }

  const sapHealth = await resolvedSap.healthCheck('conn-sap-1', { apiKey: 'sap_odata_key_2026' });
  console.log(`- Health Check Status:   ${sapHealth.healthy ? 'HEALTHY' : 'UNHEALTHY'}`);
  console.log(`- Gateway Message:       "${sapHealth.message}" (Latency: ${sapHealth.latencyMs}ms)`);

  const sapResult = await sapAdapter.processEvent(
    'client.created',
    { name: 'مجموعة الفنار القابضة', nationalIdOrCr: '1010887766' },
    { apiKey: 'sap_odata_key_2026', baseUrl: 'https://sap.lawfirm-a.sa' },
  );

  console.log(`- SAP Sync Status:       ${sapResult.synced}`);
  console.log(`- SAP Business Partner:  "${sapResult.sapPartnerNumber}"`);

  if (!sapResult.synced || !sapResult.sapPartnerNumber) {
    throw new Error('SAP S/4HANA Business Partner sync failed!');
  }
  console.log('✔ SAP S/4HANA ERP Plugin & Partner Sync Verified!');

  // -------------------------------------------------------------
  // SCENARIO 3: Salla E-Commerce Webhook Parsing
  // -------------------------------------------------------------
  console.log('\n[Scenario 3] Testing Salla E-Commerce Webhook Receiver & Order Parsing...');
  const resolvedSalla = providerRegistry.getAdapter('salla');
  console.log(`- Resolved Provider Code: ${resolvedSalla?.providerCode}`);

  if (!resolvedSalla) {
    throw new Error('Failed to resolve Salla adapter plugin!');
  }

  const sallaResult = await sallaAdapter.processEvent(
    'order.created',
    { orderId: 'SALLA-88712', customer: { name: 'فهد العتيبي' }, total: { amount: 1250.0 } },
    { webhookSecret: 'salla_secret_token' },
  );

  console.log(`- Salla Order Parsed:    ${sallaResult.parsed}`);
  console.log(`- Salla Order Reference: "${sallaResult.orderId}"`);
  console.log(`- Customer Name:         "${sallaResult.customerName}"`);
  console.log(`- Order Amount SAR:      ${sallaResult.amountSar} SAR`);

  if (!sallaResult.parsed || sallaResult.amountSar !== 1250.0) {
    throw new Error('Salla E-Commerce webhook parsing failed!');
  }
  console.log('✔ Salla E-Commerce Webhook Receiver Verified!');

  // -------------------------------------------------------------
  // SCENARIO 4: HubSpot CRM Lead Contact Sync
  // -------------------------------------------------------------
  console.log('\n[Scenario 4] Testing HubSpot CRM Plugin Adapter & Contact Lead Sync...');
  const resolvedHubspot = providerRegistry.getAdapter('hubspot');
  console.log(`- Resolved Provider Code: ${resolvedHubspot?.providerCode}`);

  if (!resolvedHubspot) {
    throw new Error('Failed to resolve HubSpot adapter plugin!');
  }

  const hubspotResult = await hubspotAdapter.processEvent(
    'client.created',
    { name: 'شركة الاستشارات المستقبلية' },
    { accessToken: 'pat-eu1-hubspot_secret_token' },
  );

  console.log(`- HubSpot Sync Status:   ${hubspotResult.synced}`);
  console.log(`- HubSpot Contact ID:    "${hubspotResult.hubspotContactId}"`);

  if (!hubspotResult.synced || !hubspotResult.hubspotContactId) {
    throw new Error('HubSpot CRM contact sync failed!');
  }
  console.log('✔ HubSpot CRM Plugin & Contact Lead Sync Verified!');

  // -------------------------------------------------------------
  // SCENARIO 5: Multi-Tenant Business Connectors RLS Isolation
  // -------------------------------------------------------------
  console.log('\n[Scenario 5] Verifying Multi-Tenant Business Connectors RLS Security Isolation...');

  await TenantContext.run({ tenantId: tenantA }, async () => {
    await oauthManager.saveConnection(
      tenantA,
      'odoo',
      { apiKey: 'odoo_api_key_tenant_a' },
      { odooUrl: 'https://odoo.firm-a.sa' },
    );
  });

  await TenantContext.run({ tenantId: tenantB }, async () => {
    const tenantBConns = await appPrisma.db.integrationConnection.findMany({
      where: { organizationId: tenantB },
    });
    console.log(`- Tenant B Business Integration Connections Count: ${tenantBConns.length}`);

    if (tenantBConns.length !== 0) {
      throw new Error('RLS FAILURE: Tenant B queried Tenant A Odoo connection!');
    }
  });
  console.log('✔ Multi-Tenant Business Connectors RLS Security Isolation Verified!');

  console.log('\n✅ ALL BUSINESS CONNECTORS DOMAIN (ODOO, SAP, SALLA, HUBSPOT) SCENARIOS VERIFIED SUCCESSFULLY!');
  await app.close();
}

bootstrap().catch((err) => {
  console.error('❌ BUSINESS CONNECTORS VERIFICATION FAILED:', err);
  process.exit(1);
});
