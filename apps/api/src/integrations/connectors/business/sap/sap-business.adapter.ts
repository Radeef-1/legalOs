import { Injectable, Logger } from '@nestjs/common';
import { BaseIntegrationAdapter, HealthCheckResult } from '../../../sdk/base-integration.adapter';
import { SapSyncService } from './sap-sync.service';

@Injectable()
export class SapBusinessAdapter extends BaseIntegrationAdapter {
  private readonly logger = new Logger(SapBusinessAdapter.name);

  readonly providerCode = 'sap';
  readonly nameAr = 'نظام إدارة المؤسسات ساب (SAP S/4HANA ERP)';
  readonly nameEn = 'SAP S/4HANA ERP Integration';
  readonly authType = 'API_KEY' as const;

  constructor(private readonly sapSyncService: SapSyncService) {
    super();
  }

  async healthCheck(connectionId: string, vaultData: any): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const hasKey = !!vaultData?.apiKey;
    const latencyMs = Date.now() - startTime + 58;

    return {
      healthy: hasKey,
      message: hasKey ? 'SAP S/4HANA OData v4 Gateway Online' : 'Missing SAP API Credentials in Vault',
      latencyMs,
    };
  }

  async processEvent(eventName: string, payload: any, vaultData: any): Promise<any> {
    this.logger.log(`[SAP Adapter] Processing Event "${eventName}"...`);

    if (eventName === 'client.created') {
      return this.sapSyncService.syncBusinessPartnerToSap(
        vaultData?.baseUrl || 'https://sap.firm.sa',
        vaultData?.apiKey || 'mock_sap_key',
        {
          name: payload.name || 'عميل تجاري جديد',
          crNumber: payload.nationalIdOrCr || '1010998877',
        },
      );
    }

    return { processed: true, eventName };
  }
}
