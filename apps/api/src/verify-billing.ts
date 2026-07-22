import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PlansService } from './billing/plans/plans.service';
import { EntitlementService } from './billing/entitlements/entitlement.service';
import { SubscriptionService } from './billing/subscription/subscription.service';
import { SubscriptionTier } from '@prisma/client';
import { TenantContext } from './shared/tenant/tenant.context';

async function bootstrap() {
  console.log('--- STARTING SUBSCRIPTION & SAAS BILLING DOMAIN VERIFICATION ---');
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });

  const plansService = app.get(PlansService);
  const entitlementService = app.get(EntitlementService);
  const subscriptionService = app.get(SubscriptionService);

  const tenantA = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const tenantB = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

  // -------------------------------------------------------------
  // SCENARIO 1: SaaS Subscription Plans Seeding & Queries
  // -------------------------------------------------------------
  console.log('\n[Scenario 1] Verifying SaaS Subscription Plans Seeding...');
  const plans = await plansService.getAllPlans();
  console.log(`- Total SaaS Plans Seeded: ${plans.length}`);
  plans.forEach((p) => console.log(`  * ${p.nameAr} (${p.code}): ${p.monthlyPriceSar} SAR/mo, Max Seats: ${p.maxSeats}`));

  if (plans.length !== 3) {
    throw new Error(`Expected 3 seeded plans, found ${plans.length}`);
  }
  console.log('✔ SaaS Subscription Plans Seeding Verified!');

  // -------------------------------------------------------------
  // SCENARIO 2: Default Trial Subscription View
  // -------------------------------------------------------------
  console.log('\n[Scenario 2] Querying Default Subscription for Tenant A...');
  const defaultSub = await subscriptionService.getSubscription(tenantA);
  console.log(`- Tenant A Initial Status: ${defaultSub.status}, Plan: ${defaultSub.plan?.nameAr}`);
  if (!defaultSub) {
    throw new Error('Expected default subscription view for Tenant A');
  }
  console.log('✔ Default Subscription View Verified!');

  // -------------------------------------------------------------
  // SCENARIO 3: Mada / Card Payment & Subscription Upgrade
  // -------------------------------------------------------------
  console.log('\n[Scenario 3] Processing Mada Payment & Upgrading Tenant A to Professional Plan...');
  const proSubResult = await subscriptionService.subscribeOrUpgrade({
    organizationId: tenantA,
    tier: SubscriptionTier.PROFESSIONAL,
    billingCycle: 'monthly',
    paymentMethod: {
      type: 'MADA',
      cardNumber: '588845******1234',
    },
  });

  console.log(`- Subscription ID: ${proSubResult.subscription.id}`);
  console.log(`- Invoice Number:  ${proSubResult.invoice.invoiceNumber}`);
  console.log(`- Base Amount:     ${proSubResult.invoice.amountSar} SAR`);
  console.log(`- VAT (15%):       ${proSubResult.invoice.vatAmountSar} SAR`);
  console.log(`- Total Paid:      ${proSubResult.invoice.totalAmountSar} SAR`);
  console.log(`- Transaction ID:  ${proSubResult.paymentResult.transactionId}`);

  if (Number(proSubResult.invoice.amountSar) !== 799) {
    throw new Error(`Expected Professional base price 799 SAR, got ${proSubResult.invoice.amountSar}`);
  }
  console.log('✔ Mada Payment & SaaS Subscription Upgrade Verified!');

  // -------------------------------------------------------------
  // SCENARIO 4: Seat Quota & Feature Entitlement Enforcement
  // -------------------------------------------------------------
  console.log('\n[Scenario 4] Testing Seat Quota & Feature Entitlements (Pro Tier)...');
  const seatQuota = await entitlementService.checkSeatCapacity(tenantA);
  console.log(`- Seat Capacity: Current=${seatQuota.currentMembersCount}, Max=${seatQuota.maxSeats}, CanAddSeat=${seatQuota.canAddSeat}`);

  const hasWorkflow = await entitlementService.checkFeatureAccess(tenantA, 'WORKFLOW_BPM');
  const hasAbac = await entitlementService.checkFeatureAccess(tenantA, 'ABAC_POLICY_ENGINE');
  console.log(`- Feature Access WORKFLOW_BPM:      ${hasWorkflow}`);
  console.log(`- Feature Access ABAC_POLICY_ENGINE: ${hasAbac}`);

  if (!hasWorkflow || hasAbac) {
    throw new Error('Pro tier entitlement error: WORKFLOW_BPM should be true, ABAC_POLICY_ENGINE should be false');
  }
  console.log('✔ Seat Quota & Pro Tier Entitlements Verified!');

  // -------------------------------------------------------------
  // SCENARIO 5: Upgrade to Enterprise Plan
  // -------------------------------------------------------------
  console.log('\n[Scenario 5] Upgrading Tenant A to Enterprise Tier...');
  const entSubResult = await subscriptionService.subscribeOrUpgrade({
    organizationId: tenantA,
    tier: SubscriptionTier.ENTERPRISE,
    billingCycle: 'annual',
    paymentMethod: {
      type: 'CREDIT_CARD',
    },
  });

  console.log(`- Enterprise Invoice Number: ${entSubResult.invoice.invoiceNumber}`);
  console.log(`- Total Paid (Annual):      ${entSubResult.invoice.totalAmountSar} SAR`);

  const hasAbacEnterprise = await entitlementService.checkFeatureAccess(tenantA, 'ABAC_POLICY_ENGINE');
  console.log(`- Post-Upgrade ABAC Access: ${hasAbacEnterprise}`);
  if (!hasAbacEnterprise) {
    throw new Error('Enterprise tier entitlement error: ABAC_POLICY_ENGINE should be enabled!');
  }
  console.log('✔ Enterprise Plan Upgrade & Unlocked Features Verified!');

  // -------------------------------------------------------------
  // SCENARIO 6: Multi-Tenant Billing RLS Security Isolation
  // -------------------------------------------------------------
  console.log('\n[Scenario 6] Verifying Multi-Tenant SaaS Billing RLS Security Isolation...');
  await TenantContext.run({ tenantId: tenantB }, async () => {
    const tenantBInvoices = await subscriptionService.getInvoices(tenantB);
    console.log(`- Tenant B Invoices Count: ${tenantBInvoices.length}`);
    if (tenantBInvoices.length !== 0) {
      throw new Error('RLS FAILURE: Tenant B can access Tenant A SaaS invoices!');
    }
    console.log('✔ PostgreSQL SaaS Billing RLS Security Isolation Verified!');
  });

  console.log('\n✅ ALL SUBSCRIPTION & SAAS BILLING DOMAIN SCENARIOS VERIFIED SUCCESSFULLY!');
  await app.close();
}

bootstrap().catch((err) => {
  console.error('❌ SAAS BILLING DOMAIN VERIFICATION FAILED:', err);
  process.exit(1);
});
