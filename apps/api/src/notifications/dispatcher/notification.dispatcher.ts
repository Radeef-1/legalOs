import { Injectable, Logger } from '@nestjs/common';
import { NotificationChannel, NotificationType } from '@prisma/client';
import { PreferencesService } from '../preferences/preferences.service';
import { InboxService } from '../inbox/inbox.service';
import { EmailProvider } from '../providers/email.provider';
import { SmsProvider } from '../providers/sms.provider';
import { PushProvider } from '../providers/push.provider';
import { WhatsAppProvider } from '../providers/whatsapp.provider';
import { WebhookProvider } from '../providers/webhook.provider';

export interface DispatchNotificationOptions {
  organizationId: string;
  userId: string;
  title: string;
  body: string;
  notificationType: NotificationType;
  email?: string;
  phone?: string;
  deviceToken?: string;
  webhookUrl?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class NotificationDispatcher {
  private readonly logger = new Logger(NotificationDispatcher.name);

  constructor(
    private readonly preferencesService: PreferencesService,
    private readonly inboxService: InboxService,
    private readonly emailProvider: EmailProvider,
    private readonly smsProvider: SmsProvider,
    private readonly pushProvider: PushProvider,
    private readonly whatsAppProvider: WhatsAppProvider,
    private readonly webhookProvider: WebhookProvider,
  ) {}

  async dispatch(options: DispatchNotificationOptions): Promise<{ dispatchedChannels: NotificationChannel[] }> {
    const enabledChannels = await this.preferencesService.getEnabledChannels(
      options.organizationId,
      options.userId,
      options.notificationType,
    );

    this.logger.log(
      `[NotificationDispatcher] Dispatching ${options.notificationType} to user ${options.userId} via channels: ${enabledChannels.join(', ')}`,
    );

    const dispatchedChannels: NotificationChannel[] = [];

    for (const channel of enabledChannels) {
      try {
        switch (channel) {
          case NotificationChannel.IN_APP:
            await this.inboxService.createInAppNotification({
              organizationId: options.organizationId,
              userId: options.userId,
              title: options.title,
              body: options.body,
              channel: NotificationChannel.IN_APP,
              type: options.notificationType,
              metadataJson: options.metadata,
            });
            dispatchedChannels.push(NotificationChannel.IN_APP);
            break;

          case NotificationChannel.EMAIL:
            if (options.email) {
              await this.emailProvider.sendEmail({
                to: options.email,
                subject: options.title,
                templateName: this.getTemplateNameForType(options.notificationType),
                data: { message: options.body, ...(options.metadata || {}) },
              });
              dispatchedChannels.push(NotificationChannel.EMAIL);
            }
            break;

          case NotificationChannel.SMS:
            if (options.phone) {
              await this.smsProvider.sendSms(options.phone, `${options.title}: ${options.body}`);
              dispatchedChannels.push(NotificationChannel.SMS);
            }
            break;

          case NotificationChannel.PUSH:
            if (options.deviceToken) {
              await this.pushProvider.sendPush(options.deviceToken, options.title, options.body, options.metadata);
              dispatchedChannels.push(NotificationChannel.PUSH);
            }
            break;

          case NotificationChannel.WHATSAPP:
            if (options.phone) {
              await this.whatsAppProvider.sendWhatsAppMessage(
                options.phone,
                'test_whatsapp_template_en',
                [options.title, options.body],
              );
              dispatchedChannels.push(NotificationChannel.WHATSAPP);
            }
            break;

          case NotificationChannel.WEBHOOK:
            if (options.webhookUrl) {
              await this.webhookProvider.dispatchWebhook(options.webhookUrl, options.notificationType, options.metadata);
              dispatchedChannels.push(NotificationChannel.WEBHOOK);
            }
            break;
        }
      } catch (err: any) {
        this.logger.error(`Failed dispatching channel ${channel} for user ${options.userId}: ${err.message}`);
      }
    }

    return { dispatchedChannels };
  }

  private getTemplateNameForType(type: NotificationType): any {
    switch (type) {
      case NotificationType.HEARING_REMINDER:
        return 'HEARING_REMINDER';
      case NotificationType.INVOICE_ISSUED:
        return 'INVOICE_ISSUED';
      case NotificationType.WORKFLOW_APPROVAL_REQUIRED:
        return 'WORKFLOW_APPROVAL';
      default:
        return 'GENERAL_ALERT';
    }
  }
}
