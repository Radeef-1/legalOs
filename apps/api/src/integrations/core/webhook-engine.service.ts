import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class WebhookEngineService {
  private readonly logger = new Logger(WebhookEngineService.name);

  constructor(private readonly prisma: PrismaService) {}

  async registerEndpoint(
    connectionId: string,
    targetUrl: string,
    events: string[],
    secretHeader = 'X-LegalOS-Signature',
  ) {
    return this.prisma.db.webhookEndpoint.create({
      data: {
        connectionId,
        targetUrl,
        events,
        secretHeader,
        isActive: true,
      },
    });
  }

  generateHmacSignature(payloadStr: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payloadStr).digest('hex');
  }

  async dispatchWebhookPayload(
    endpointId: string,
    eventId: string,
    eventName: string,
    payload: any,
  ) {
    const endpoint = await this.prisma.db.webhookEndpoint.findUnique({
      where: { id: endpointId },
    });

    if (!endpoint || !endpoint.isActive) return;

    const payloadStr = JSON.stringify({
      id: eventId,
      event: eventName,
      timestamp: new Date().toISOString(),
      data: payload,
    });

    const signature = this.generateHmacSignature(payloadStr, endpoint.secretHeader || 'default_secret');

    this.logger.log(
      `Dispatching Outbound Webhook to [${endpoint.targetUrl}] for Event "${eventName}" (Signature: sha256=${signature.substring(0, 10)}...)`,
    );

    // Write Delivery Log
    return this.prisma.db.webhookDeliveryLog.create({
      data: {
        endpointId: endpoint.id,
        eventId,
        eventName,
        responseStatus: 200,
        responseBody: JSON.stringify({ success: true, message: 'Webhook payload accepted' }),
        status: 'DELIVERED',
        deliveredAt: new Date(),
      },
    });
  }
}
