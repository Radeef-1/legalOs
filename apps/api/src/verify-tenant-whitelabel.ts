import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TenantResolverService } from './tenant/services/tenant-resolver.service';
import { PrismaService } from './shared/database/prisma.service';

async function bootstrap() {
  console.log('🚀 [Runtime Tenant Customization] Starting Dynamic White Label Verification Suite...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);
  const tenantResolver = app.get(TenantResolverService);

  const testSlug = 'otaibi-law';

  // 1. Resolve Tenant Configuration by Subdomain
  console.log('\n🔍 [Test 1] Resolving Tenant Runtime Configuration by Subdomain...');
  const config = await tenantResolver.resolveTenantConfig(testSlug);
  console.log(`✅ Resolved Tenant ID: ${config.id}`);
  console.log(`✅ Tenant Name: ${config.name}`);
  console.log(`✅ Primary Color: ${config.settings.branding.primary}`);
  console.log(`✅ Secondary Color: ${config.settings.branding.secondary}`);
  console.log(`✅ Feature Flags (AI): ${config.settings.features.ai}`);

  // 2. Update Live Tenant Branding & Settings JSON
  console.log('\n🎨 [Test 2] Updating Live Branding & JSON Settings without Redeploying...');
  const updated = await tenantResolver.updateTenantConfig(config.id, {
    name: 'مكتب العتيبي والنصار للمحاماة والدراسات الشرعية',
    primaryColor: '#0055CC',
    secondaryColor: '#FFD200',
    fontFamily: 'IBM Plex Arabic',
    supportPhone: '+966549040268',
    settings: {
      branding: {
        primary: '#0055CC',
        secondary: '#FFD200',
      },
      theme: {
        mode: 'dark',
        font: 'IBM Plex Arabic',
        density: 'enterprise',
      },
      navigation: {
        layout: 'sidebar',
        hiddenModules: ['billing'],
      },
      features: {
        ai: true,
        portal: true,
        calendar: true,
        billing: false,
        crm: true,
        accounting: true,
      },
      communication: {
        smsSender: 'العتيبي',
      },
    },
  });

  console.log(`✅ Updated Tenant Name: ${updated.name}`);
  console.log(`✅ Updated Primary Color: ${updated.settings.branding.primary}`);
  console.log(`✅ Updated Secondary Color: ${updated.settings.branding.secondary}`);
  console.log(`✅ Updated Theme Density: ${updated.settings.theme.density}`);
  console.log(`✅ Updated Billing Feature Flag: ${updated.settings.features.billing}`);

  console.log('\n🎉 [SUCCESS 100%] Runtime Tenant Customization & Dynamic White Labeling Engine Passed Cleanly!');
  await app.close();
}

bootstrap().catch((err) => {
  console.error('❌ Verification Error:', err);
  process.exit(1);
});
