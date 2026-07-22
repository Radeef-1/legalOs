import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PrismaService } from '../shared/database/prisma.service';
import { SmsProvider } from '../notifications/providers/sms.provider';
import { WhatsAppProvider } from '../notifications/providers/whatsapp.provider';

export interface OnboardTenantOptions {
  firmName: string;
  slug: string;
  commercialRegistration: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  planTier: 'solo' | 'boutique' | 'enterprise';
}

export async function onboardTenant(options: OnboardTenantOptions) {
  console.log('========================================================================');
  console.log(`🚀 STARTING AUTOMATED ONBOARDING FOR: ${options.firmName}`);
  console.log('========================================================================\n');

  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });
  const prisma = app.get(PrismaService);
  const smsProvider = app.get(SmsProvider);
  const whatsAppProvider = app.get(WhatsAppProvider);

  try {
    // 1. Create / Upsert Organization (Tenant)
    const org = await (prisma as any).organization.upsert({
      where: { slug: options.slug },
      create: {
        name: options.firmName,
        slug: options.slug,
        commercialRegistration: options.commercialRegistration,
        planTier: options.planTier,
        status: 'active',
      },
      update: {
        name: options.firmName,
        commercialRegistration: options.commercialRegistration,
        planTier: options.planTier,
      },
    });

    console.log(`  ✔ Organization Created: [${org.id}] (${org.name})`);

    // 2. Create / Upsert Default Partner Role
    const adminRole = await (prisma as any).role.upsert({
      where: {
        organizationId_name: {
          organizationId: org.id,
          name: 'Partner',
        },
      },
      create: {
        organizationId: org.id,
        name: 'Partner',
      },
      update: {},
    });

    // 3. Create / Upsert Admin User
    const adminUser = await (prisma as any).user.upsert({
      where: { email: options.adminEmail },
      create: {
        fullName: options.adminName,
        email: options.adminEmail,
        status: 'active',
        memberships: {
          create: {
            organization: {
              connect: { id: org.id },
            },
            role: {
              connect: { id: adminRole.id },
            },
          },
        },
      },
      update: {
        fullName: options.adminName,
      },
    });

    console.log(`  ✔ Admin User Created/Updated:  [${adminUser.id}] (${adminUser.fullName})`);

    // 3. Create / Upsert Default Portal Branding
    const portalUrl = `https://${options.slug}.legalos.sa`;
    await (prisma as any).portalBranding.upsert({
      where: { organizationId: org.id },
      create: {
        organizationId: org.id,
        primaryColor: '#1a365d',
        secondaryColor: '#2b6cb0',
        welcomeMessage: `مرحباً بك في بوابة ${options.firmName} للمحاماة`,
      },
      update: {
        welcomeMessage: `مرحباً بك في بوابة ${options.firmName} للمحاماة`,
      },
    });

    console.log(`  ✔ Portal Branding & Subdomain Set: ${portalUrl}`);

    // 4. Send Welcome Notification via Infobip WhatsApp / SMS
    const welcomeMsg = `أهلاً بك أستاذ ${options.adminName}! تم تفعيل منصة LegalOS لمكتبكم (${options.firmName}) بنجاح. رابط البوابة: ${portalUrl}`;
    
    console.log(`\n  📡 Dispatching Welcome Notification via Infobip SMS/WhatsApp...`);
    const smsRes = await smsProvider.sendSms(options.adminPhone, welcomeMsg);
    console.log(`  ✔ SMS Dispatched (ID: ${smsRes.smsId}, Status: ${smsRes.status})`);

    const waRes = await whatsAppProvider.sendWhatsAppMessage(
      options.adminPhone,
      'test_whatsapp_template_en',
      [options.adminName, options.firmName],
    );
    console.log(`  ✔ WhatsApp Dispatched (ID: ${waRes.messageId}, Status: ${waRes.status})`);

    console.log('\n========================================================================');
    console.log(`🎉 ONBOARDING COMPLETED SUCCESSFULLY FOR: ${options.firmName}`);
    console.log('========================================================================');

    await app.close();

    return {
      organizationId: org.id,
      adminUserId: adminUser.id,
      portalUrl,
      smsStatus: smsRes.status,
      whatsAppStatus: waRes.status,
    };
  } catch (err: any) {
    console.error('❌ ONBOARDING FAILED:', err.message);
    await app.close();
    throw err;
  }
}

// Runnable CLI Onboarding Script execution sample
if (require.main === module) {
  onboardTenant({
    firmName: 'مكتب الرياض الدولي للمحاماة',
    slug: 'riyadh-law',
    commercialRegistration: '1010998877',
    adminName: 'المحامي فهد القحطاني',
    adminEmail: 'fahad@riyadh-law.sa',
    adminPhone: '966549040268',
    planTier: 'boutique',
  }).catch(() => process.exit(1));
}
