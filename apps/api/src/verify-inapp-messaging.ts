import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PortalMessagingService } from './portal/application/services/portal-messaging.service';
import { InboxService } from './notifications/inbox/inbox.service';
import { NotificationDispatcher } from './notifications/dispatcher/notification.dispatcher';
import { TenantContext } from './shared/tenant/tenant.context';
import { PrismaService } from './shared/database/prisma.service';

async function bootstrap() {
  console.log('========================================================================');
  console.log('💬 STARTING IN-APP MESSAGING & NOTIFICATIONS VERIFICATION');
  console.log('========================================================================\n');

  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });

  const portalMessaging = app.get(PortalMessagingService);
  const inboxService = app.get(InboxService);
  const dispatcher = app.get(NotificationDispatcher);
  const appPrisma = app.get(PrismaService);

  const tenantId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const clientId = '77777777-7777-7777-7777-777777777777';
  const caseId = '66666666-6666-6666-6666-666666666666';
  const userId = '11111111-1111-1111-1111-111111111111';

  // -------------------------------------------------------------
  // SEED DATA FOR IN-APP MESSAGING
  // -------------------------------------------------------------
  await TenantContext.run({ tenantId, userId }, async () => {
    await appPrisma.db.organization.upsert({
      where: { id: tenantId },
      create: { id: tenantId, name: 'مكتب الخبراء القانوني', slug: 'khubara-legal' },
      update: {},
    });

    await appPrisma.db.client.upsert({
      where: { id: clientId },
      create: {
        id: clientId,
        name: 'شركة النمو الوطنية',
        nationalIdOrCr: '1010991188',
        portalAccessEnabled: true,
        organization: { connect: { id: tenantId } },
      },
      update: {},
    });
  });

  // -------------------------------------------------------------
  // TEST 1: Client Portal In-App Chat Messaging
  // -------------------------------------------------------------
  console.log('[Test 1] Testing Client In-App Messaging (Client -> Lawyer)...');
  const clientMessage = await portalMessaging.sendMessage(tenantId, clientId, {
    caseId,
    content: 'مرحباً دكتور عبد الله، هل تم تجهيز لائحة الدعوى التجارية؟',
    messageType: 'TEXT',
  });
  console.log(`  - Sent Message ID:    "${clientMessage.id}"`);
  console.log(`  - Sender Type:        "${clientMessage.senderType}"`);
  console.log(`  - Content:            "${clientMessage.content}"`);

  console.log('\n[Test 2] Testing Lawyer In-App Reply (Lawyer -> Client)...');
  const lawyerMessage = await portalMessaging.sendLawyerMessage(tenantId, clientId, {
    caseId,
    content: 'أهلاً بك، نعم تم إعداد اللائحة ومراجعتها وهي الآن في صندوق مستنداتك بالبوابة.',
    messageType: 'TEXT',
  });
  console.log(`  - Reply Message ID:   "${lawyerMessage.id}"`);
  console.log(`  - Sender Type:        "${lawyerMessage.senderType}"`);

  // Check unread count
  const unreadCount = await portalMessaging.getUnreadCount(tenantId, clientId);
  console.log(`  - Client Unread Messages Count: ${unreadCount}`);

  // Mark message as read
  await portalMessaging.markAsRead(tenantId, clientId, lawyerMessage.id);
  const unreadAfterRead = await portalMessaging.getUnreadCount(tenantId, clientId);
  console.log(`  - Unread Count After Read:      ${unreadAfterRead}`);

  if (unreadCount < 1 || unreadAfterRead !== 0) {
    throw new Error('In-App Portal messaging read status failed!');
  }
  console.log('✔ Client Portal In-App Chat Messaging Verified 100%!\n');

  // -------------------------------------------------------------
  // TEST 3: In-App System Notifications (Alerts & Inbox)
  // -------------------------------------------------------------
  console.log('[Test 3] Testing In-App System Notification Dispatch & Inbox...');
  const inAppNotif = await inboxService.createInAppNotification({
    organizationId: tenantId,
    userId,
    title: 'تم تحديث حالة القضية التجاريّة',
    body: 'تم تحديد موعد الجلسة القادمة يوم الثلاثاء القادم الساعة 10:00 صباحاً.',
  });

  console.log(`  - Created Notification ID:   "${inAppNotif.id}"`);
  console.log(`  - Notification Title:        "${inAppNotif.title}"`);

  // Fetch In-App Notifications Inbox List
  const userInbox = await inboxService.getUserInbox(userId);
  console.log(`  - Inbox Notifications Count: ${userInbox.length}`);

  const unreadInboxCount = await inboxService.getUnreadCount(userId);
  console.log(`  - Unread Inbox Count:        ${unreadInboxCount}`);

  if (userInbox.length < 1) {
    throw new Error('In-App System Notification inbox fetch failed!');
  }
  console.log('✔ In-App System Notification Inbox Verified 100%!\n');

  console.log('========================================================================');
  console.log('🎉 ALL IN-APP MESSAGING & NOTIFICATION TESTS PASSED 100% SUCCESSFULLY!');
  console.log('========================================================================');

  await app.close();
}

bootstrap().catch((err) => {
  console.error('❌ IN-APP MESSAGING VERIFICATION FAILED:', err);
  process.exit(1);
});
