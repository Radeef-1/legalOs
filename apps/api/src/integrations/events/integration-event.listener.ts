import { Injectable, Logger, Inject } from '@nestjs/common';
import { EventHandler } from '../../shared/events/decorators/event-handler.decorator';
import { IEventHandler } from '../../shared/events/contracts/event-handler.interface';
import { PrismaService } from '../../shared/database/prisma.service';
import { WebhookEngineService } from '../core/webhook-engine.service';
import { ProviderRegistryService } from '../core/provider-registry.service';
import { SecretVaultService } from '../core/secret-vault.service';
import { BaseEvent } from '../../shared/events/base/base-event';
import { TenantContext } from '../../shared/tenant/tenant.context';
import { EVENT_DISPATCHER_TOKEN } from '../../shared/events/tokens';

@Injectable()
@EventHandler('case.created')
export class IntegrationEventListener implements IEventHandler<BaseEvent> {
  private readonly logger = new Logger(IntegrationEventListener.name);

  constructor(
    @Inject(EVENT_DISPATCHER_TOKEN) private readonly dispatcher: any,
    private readonly prisma: PrismaService,
    private readonly webhookEngine: WebhookEngineService,
    private readonly providerRegistry: ProviderRegistryService,
    private readonly vaultService: SecretVaultService,
  ) {}

  async handle(event: BaseEvent): Promise<void> {
    const organizationId = event.metadata?.tenantId || (event.metadata as any)?.organizationId;
    if (!organizationId) return;

    this.logger.log(`[Integration Hub] Event Bus Received "${event.eventName}" for Tenant [${organizationId}]`);

    await TenantContext.run({ tenantId: organizationId }, async () => {
      // 1. Fetch active Webhook Endpoints subscribed to this event
      const endpoints = await this.prisma.db.webhookEndpoint.findMany({
        where: {
          isActive: true,
          events: { has: event.eventName },
        },
      });

      for (const endpoint of endpoints) {
        await this.webhookEngine.dispatchWebhookPayload(
          endpoint.id,
          event.id,
          event.eventName,
          (event as any).payload || event,
        );
      }

      // 2. Dispatch to registered Provider Adapters (e.g. Najiz, Google Calendar, etc.)
      const connections = await this.prisma.db.integrationConnection.findMany({
        where: {
          organizationId,
          status: 'CONNECTED',
        },
        include: { provider: true },
      });

      for (const conn of connections) {
        const adapter = this.providerRegistry.getAdapter(conn.provider.code);
        if (adapter && adapter.processEvent) {
          try {
            const vaultData = this.vaultService.decrypt(conn.encryptedVault);
            await adapter.processEvent(event.eventName, (event as any).payload || event, vaultData);

            await this.prisma.db.integrationLog.create({
              data: {
                connectionId: conn.id,
                action: `EVENT_${event.eventName.toUpperCase().replace(/\./g, '_')}`,
                status: 'SUCCESS',
                requestJson: { eventId: event.id, eventName: event.eventName },
                responseJson: { processed: true },
              },
            });
          } catch (err: any) {
            this.logger.error(`Integration Adapter [${conn.provider.code}] Error: ${err.message}`);
            await this.prisma.db.integrationLog.create({
              data: {
                connectionId: conn.id,
                action: `EVENT_${event.eventName.toUpperCase().replace(/\./g, '_')}`,
                status: 'ERROR',
                requestJson: { eventId: event.id },
                errorMessage: err.message,
              },
            });
          }
        }
      }
    });
  }
}
