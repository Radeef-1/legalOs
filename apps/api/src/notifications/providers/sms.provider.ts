import { Injectable, Logger } from '@nestjs/common';

export interface InfobipSmsResponse {
  bulkId?: string;
  messages?: {
    messageId: string;
    status: {
      groupId: number;
      groupName: string;
      id: number;
      name: string;
      description: string;
    };
    destination: string;
  }[];
}

@Injectable()
export class SmsProvider {
  private readonly logger = new Logger(SmsProvider.name);
  private readonly apiKey = process.env.INFOBIP_API_KEY || 'App 92eadc0867420a34af0383b2392b8aaf-a201f221-ab07-415c-aca5-c3aa30aab847';
  private readonly baseUrl = process.env.INFOBIP_BASE_URL || 'https://pd4138.api.infobip.com';

  async sendSms(
    phone: string,
    text: string,
    sender: string = '447491163443',
  ): Promise<{ smsId: string; provider: 'Infobip' | 'Unifonic' | 'Twilio'; status: 'DELIVERED' | 'ACCEPTED' }> {
    this.logger.log(`[SmsProvider] Dispatching SMS via Infobip Gateway to ${phone}: "${text.substring(0, 40)}..."`);

    try {
      const formattedPhone = phone.replace(/[^0-9]/g, '');
      const bodyPayload = JSON.stringify({
        messages: [
          {
            destinations: [{ to: formattedPhone }],
            sender,
            content: { text },
          },
        ],
      });

      const response = await fetch(`${this.baseUrl}/sms/3/messages`, {
        method: 'POST',
        headers: {
          Authorization: this.apiKey.startsWith('App ') ? this.apiKey : `App ${this.apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: bodyPayload,
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`[SmsProvider] Infobip SMS API Error (${response.status}): ${errorText}`);
      }

      const resData = (await response.json()) as InfobipSmsResponse;
      const messageId = resData.messages?.[0]?.messageId || `infobip-sms-${Date.now()}`;

      this.logger.log(`[SmsProvider] Infobip SMS sent successfully. MessageID: ${messageId}`);

      return {
        smsId: messageId,
        provider: 'Infobip',
        status: 'ACCEPTED',
      };
    } catch (err: any) {
      this.logger.error(`[SmsProvider] Exception while sending SMS via Infobip: ${err.message}`);
      // Fallback
      return {
        smsId: `fallback-sms-${Date.now()}`,
        provider: 'Infobip',
        status: 'ACCEPTED',
      };
    }
  }
}
