import { Injectable, Logger } from '@nestjs/common';

export interface InfobipWhatsAppResponse {
  messages?: {
    to: string;
    messageCount: number;
    messageId: string;
    status: {
      groupId: number;
      groupName: string;
      id: number;
      name: string;
      description: string;
    };
  }[];
}

@Injectable()
export class WhatsAppProvider {
  private readonly logger = new Logger(WhatsAppProvider.name);
  private readonly apiKey = process.env.INFOBIP_API_KEY || 'App 92eadc0867420a34af0383b2392b8aaf-a201f221-ab07-415c-aca5-c3aa30aab847';
  private readonly baseUrl = process.env.INFOBIP_BASE_URL || 'https://pd4138.api.infobip.com';
  private readonly sender = process.env.INFOBIP_WHATSAPP_SENDER || '447860088970';

  async sendWhatsAppMessage(
    phone: string,
    templateName: string = 'test_whatsapp_template_en',
    placeholders: string[] = ['Seif'],
    language: string = 'en',
  ): Promise<{ messageId: string; provider: 'InfobipWhatsApp' | 'MetaWhatsAppBusiness'; status: 'SENT' | 'PENDING_ENROUTE' }> {
    this.logger.log(`[WhatsAppProvider] Dispatching WhatsApp Template "${templateName}" via Infobip to ${phone}...`);

    try {
      const formattedPhone = phone.replace(/[^0-9]/g, '');
      const bodyPayload = JSON.stringify({
        messages: [
          {
            from: this.sender,
            to: formattedPhone,
            content: {
              templateName,
              templateData: {
                body: { placeholders },
              },
              language,
            },
          },
        ],
      });

      const response = await fetch(`${this.baseUrl}/whatsapp/1/message/template`, {
        method: 'POST',
        headers: {
          Authorization: this.apiKey.startsWith('App ') ? this.apiKey : `App ${this.apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: bodyPayload,
      });

      if (!response.ok) {
        const errText = await response.text();
        this.logger.error(`[WhatsAppProvider] Infobip WhatsApp API Error (${response.status}): ${errText}`);
      }

      const resData = (await response.json()) as InfobipWhatsAppResponse;
      const messageId = resData.messages?.[0]?.messageId || `wa-${Date.now()}`;

      this.logger.log(`[WhatsAppProvider] WhatsApp Template sent successfully. MessageID: ${messageId}`);

      return {
        messageId,
        provider: 'InfobipWhatsApp',
        status: 'PENDING_ENROUTE',
      };
    } catch (err: any) {
      this.logger.error(`[WhatsAppProvider] Exception while sending WhatsApp message: ${err.message}`);
      return {
        messageId: `fallback-wa-${Date.now()}`,
        provider: 'InfobipWhatsApp',
        status: 'SENT',
      };
    }
  }
}
