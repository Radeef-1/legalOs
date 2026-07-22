import { Module } from '@nestjs/common';
import { PrismaModule } from '../shared/database/prisma.module';
import { EventsModule } from '../shared/events/events.module';

import { EmailProvider } from './providers/email.provider';
import { SmsProvider } from './providers/sms.provider';
import { PushProvider } from './providers/push.provider';
import { WhatsAppProvider } from './providers/whatsapp.provider';
import { WebhookProvider } from './providers/webhook.provider';

import { PreferencesService } from './preferences/preferences.service';
import { PreferencesController } from './preferences/preferences.controller';

import { InboxService } from './inbox/inbox.service';
import { InboxController } from './inbox/inbox.controller';

import { NotificationDispatcher } from './dispatcher/notification.dispatcher';
import { NotificationEventListener } from './dispatcher/notification-event.listener';

@Module({
  imports: [PrismaModule, EventsModule],
  controllers: [PreferencesController, InboxController],
  providers: [
    EmailProvider,
    SmsProvider,
    PushProvider,
    WhatsAppProvider,
    WebhookProvider,
    PreferencesService,
    InboxService,
    NotificationDispatcher,
    NotificationEventListener,
  ],
  exports: [
    PreferencesService,
    InboxService,
    NotificationDispatcher,
    EmailProvider,
    SmsProvider,
    PushProvider,
    WhatsAppProvider,
    WebhookProvider,
  ],
})
export class NotificationsModule {}
