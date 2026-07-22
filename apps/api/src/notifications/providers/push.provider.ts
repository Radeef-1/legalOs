import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PushProvider {
  private readonly logger = new Logger(PushProvider.name);

  async sendPush(deviceToken: string, title: string, body: string, data?: any): Promise<{ pushId: string; status: 'SENT' }> {
    this.logger.log(`[PushProvider] Sending FCM Push Notification to ${deviceToken}: Title="${title}", Body="${body}"`);
    const pushId = `push-${Date.now()}`;
    return {
      pushId,
      status: 'SENT',
    };
  }
}
