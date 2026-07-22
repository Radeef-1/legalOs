import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PreferencesService } from './notifications/preferences/preferences.service';
import { InboxService } from './notifications/inbox/inbox.service';
import { NotificationDispatcher } from './notifications/dispatcher/notification.dispatcher';
import { PrismaService } from './shared/database/prisma.service';
import { NotificationChannel, NotificationType } from '@prisma/client';
import { TenantContext } from './shared/tenant/tenant.context';

async function bootstrap() {
  console.log('--- STARTING NOTIFICATION CENTER & MULTI-PROVIDER ENGINE VERIFICATION ---');
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });

  const prisma = app.get(PrismaService);
  const preferencesService = app.get(PreferencesService);
  const inboxService = app.get(InboxService);
  const notificationDispatcher = app.get(NotificationDispatcher);

  // Setup seed tenant and user
  const tenantA = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const tenantB = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

  let testUser = await prisma.user.findFirst({ where: { email: 'lawyer.a@firma.sa' } });
  if (!testUser) {
    testUser = await prisma.user.create({
      data: {
        fullName: 'الاستشاري أحمد الشمري',
        email: 'lawyer.a@firma.sa',
        status: 'active',
      },
    });
  }

  await TenantContext.run({ tenantId: tenantA }, async () => {
    // -------------------------------------------------------------
    // SCENARIO 1: Configure User Notification Preferences
    // -------------------------------------------------------------
    console.log('\n[Scenario 1] Configuring Multi-Channel Preferences for Lawyer...');
    const pref = await preferencesService.updatePreference(
      tenantA,
      testUser.id,
      NotificationType.HEARING_REMINDER,
      [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.SMS, NotificationChannel.WHATSAPP],
    );
    console.log(`✔ Preferences configured for type ${pref.notificationType}: [${pref.enabledChannels.join(', ')}]`);

    // -------------------------------------------------------------
    // SCENARIO 2: Multi-Channel Dispatching
    // -------------------------------------------------------------
    console.log('\n[Scenario 2] Dispatching Multi-Channel Hearing Reminder Notification...');
    const dispatchResult = await notificationDispatcher.dispatch({
      organizationId: tenantA,
      userId: testUser.id,
      title: 'تذكير بموعد جلسة بالمحكمة التجارية',
      body: 'لديك جلسة مرافعة غداً الساعة 10:00 صباحاً في القضية رقم 4092/1447',
      notificationType: NotificationType.HEARING_REMINDER,
      email: testUser.email,
      phone: '+966501234567',
      metadata: {
        caseNumber: '4092/1447',
        courtName: 'المحكمة التجارية بالرياض',
        hearingDate: '2026-07-21 10:00 AM',
      },
    });
    console.log(`✔ Notification dispatched successfully to channels: [${dispatchResult.dispatchedChannels.join(', ')}]`);

    // -------------------------------------------------------------
    // SCENARIO 3: In-App Inbox & Unread Badge Count
    // -------------------------------------------------------------
    console.log('\n[Scenario 3] Managing In-App Notification Inbox & Read Receipts...');
    let unreadCount = await inboxService.getUnreadCount(testUser.id);
    console.log(`- Unread Inbox Count: ${unreadCount}`);
    if (unreadCount < 1) throw new Error('Expected at least 1 unread notification!');

    const inbox = await inboxService.getUserInbox(testUser.id);
    console.log(`- Found ${inbox.length} notification(s) in inbox. Latest Title: "${inbox[0].title}"`);

    await inboxService.markAsRead(inbox[0].id);
    console.log(`✔ Marked Notification [ID: ${inbox[0].id}] as READ.`);

    unreadCount = await inboxService.getUnreadCount(testUser.id);
    console.log(`- Updated Unread Inbox Count: ${unreadCount}`);
    if (unreadCount !== 0) throw new Error('Expected 0 unread notifications after marking as read!');
  });

  // -------------------------------------------------------------
  // SCENARIO 4: Multi-Tenant RLS Security Isolation
  // -------------------------------------------------------------
  console.log('\n[Scenario 4] Verifying Tenant RLS Security Isolation...');
  await TenantContext.run({ tenantId: tenantB }, async () => {
    const tenantBInbox = await inboxService.getUserInbox(testUser.id);
    console.log(`- Tenant B query for Tenant A notifications returned: ${tenantBInbox.length} items`);
    if (tenantBInbox.length !== 0) {
      throw new Error('RLS FAILURE: Tenant B was able to access Tenant A notifications!');
    }
    console.log('✔ PostgreSQL RLS Security Isolation Verified!');
  });

  console.log('\n✅ ALL NOTIFICATION CENTER & MULTI-PROVIDER ENGINE SCENARIOS VERIFIED SUCCESSFULLY!');
  await app.close();
}

bootstrap().catch((err) => {
  console.error('❌ NOTIFICATION VERIFICATION FAILED:', err);
  process.exit(1);
});
