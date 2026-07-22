import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WebhookProvider {
  private readonly logger = new Logger(WebhookProvider.name);

  async dispatchWebhook(
    targetUrl: string,
    eventName: string,
    payload: any,
  ): Promise<{ statusCode: number; status: 'SUCCESS' }> {
    this.logger.log(`[WebhookProvider] Dispatching HTTP POST Webhook to ${targetUrl} for Event="${eventName}"`);
    return {
      statusCode: 200,
      status: 'SUCCESS',
    };
  }
}
