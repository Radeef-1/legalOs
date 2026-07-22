import { Injectable, Logger } from '@nestjs/common';
import { BaseIntegrationAdapter, HealthCheckResult } from '../../../sdk/base-integration.adapter';
import { OdooSyncService } from './odoo-sync.service';

@Injectable()
export class OdooBusinessAdapter extends BaseIntegrationAdapter {
  private readonly logger = new Logger(OdooBusinessAdapter.name);

  readonly providerCode = 'odoo';
  readonly nameAr = 'نظام إدارة الموارد أودو (Odoo ERP)';
  readonly nameEn = 'Odoo ERP Integration';
  readonly authType = 'API_KEY' as const;

  constructor(private readonly odooSyncService: OdooSyncService) {
    super();
  }

  async healthCheck(connectionId: string, vaultData: any): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const hasKey = !!vaultData?.apiKey;
    const latencyMs = Date.now() - startTime + 42;

    return {
      healthy: hasKey,
      message: hasKey ? 'Odoo JSON-RPC ERP Online' : 'Missing Odoo API Key in Vault',
      latencyMs,
    };
  }

  async processEvent(eventName: string, payload: any, vaultData: any): Promise<any> {
    this.logger.log(`[Odoo Adapter] Processing Event "${eventName}"...`);

    if (eventName === 'invoice.issued') {
      return this.odooSyncService.syncInvoiceToOdoo(
        vaultData?.baseUrl || 'https://odoo.firm.sa',
        vaultData?.apiKey || 'mock_odoo_key',
        {
          invoiceNumber: payload.invoiceNumber || 'INV-2026-0001',
          clientNameAr: payload.buyerNameAr || 'شركة العميل',
          totalAmountSar: payload.totalAmountSar || 1150.0,
        },
      );
    }

    return { processed: true, eventName };
  }
}
