import { Module, OnModuleInit } from '@nestjs/common';
import { PrismaModule } from '../shared/database/prisma.module';
import { EventsModule } from '../shared/events/events.module';
import { SecretVaultService } from './core/secret-vault.service';
import { ProviderRegistryService } from './core/provider-registry.service';
import { OAuthManagerService } from './core/oauth-manager.service';
import { WebhookEngineService } from './core/webhook-engine.service';
import { IntegrationEventListener } from './events/integration-event.listener';
import { IntegrationHubController } from './controllers/integration-hub.controller';
import { AuthenticaService } from './authentica/authentica.service';
import { AuthenticaController } from './authentica/authentica.controller';

// Sub-modules
import { GovernmentConnectorsModule } from './connectors/government/government-connectors.module';
import { ProductivityConnectorsModule } from './connectors/productivity/productivity-connectors.module';
import { BusinessConnectorsModule } from './connectors/business/business-connectors.module';

// Adapters
import { NajizGovernmentAdapter } from './connectors/government/najiz/najiz-government.adapter';
import { ZatcaGovernmentAdapter } from './connectors/government/zatca/zatca-government.adapter';
import { GoogleCalendarAdapter } from './connectors/productivity/google/google-calendar.adapter';
import { OutlookCalendarAdapter } from './connectors/productivity/outlook/outlook-calendar.adapter';
import { OdooBusinessAdapter } from './connectors/business/odoo/odoo-business.adapter';
import { SapBusinessAdapter } from './connectors/business/sap/sap-business.adapter';
import { SallaBusinessAdapter } from './connectors/business/webhook-connectors/salla-business.adapter';
import { HubspotBusinessAdapter } from './connectors/business/webhook-connectors/hubspot-business.adapter';

@Module({
  imports: [
    PrismaModule,
    EventsModule,
    GovernmentConnectorsModule,
    ProductivityConnectorsModule,
    BusinessConnectorsModule,
  ],
  controllers: [IntegrationHubController, AuthenticaController],
  providers: [
    SecretVaultService,
    ProviderRegistryService,
    OAuthManagerService,
    WebhookEngineService,
    IntegrationEventListener,
    AuthenticaService,
  ],
  exports: [
    SecretVaultService,
    ProviderRegistryService,
    OAuthManagerService,
    WebhookEngineService,
    IntegrationEventListener,
    AuthenticaService,
  ],
})
export class IntegrationsModule implements OnModuleInit {
  constructor(
    private readonly providerRegistry: ProviderRegistryService,
    private readonly najizAdapter: NajizGovernmentAdapter,
    private readonly zatcaAdapter: ZatcaGovernmentAdapter,
    private readonly googleAdapter: GoogleCalendarAdapter,
    private readonly outlookAdapter: OutlookCalendarAdapter,
    private readonly odooAdapter: OdooBusinessAdapter,
    private readonly sapAdapter: SapBusinessAdapter,
    private readonly sallaAdapter: SallaBusinessAdapter,
    private readonly hubspotAdapter: HubspotBusinessAdapter,
  ) {}

  onModuleInit() {
    this.providerRegistry.registerAdapter(this.najizAdapter);
    this.providerRegistry.registerAdapter(this.zatcaAdapter);
    this.providerRegistry.registerAdapter(this.googleAdapter);
    this.providerRegistry.registerAdapter(this.outlookAdapter);
    this.providerRegistry.registerAdapter(this.odooAdapter);
    this.providerRegistry.registerAdapter(this.sapAdapter);
    this.providerRegistry.registerAdapter(this.sallaAdapter);
    this.providerRegistry.registerAdapter(this.hubspotAdapter);
  }
}
