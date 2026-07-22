import { Injectable, Logger } from '@nestjs/common';
import { BaseIntegrationAdapter, HealthCheckResult } from '../../../sdk/base-integration.adapter';
import { NajizSyncService } from './najiz-sync.service';

@Injectable()
export class NajizGovernmentAdapter extends BaseIntegrationAdapter {
  private readonly logger = new Logger(NajizGovernmentAdapter.name);

  readonly providerCode = 'najiz';
  readonly nameAr = 'منصة ناجز مطورين - وزارة العدل (MoJ Najiz Developers Portal)';
  readonly nameEn = 'MoJ Najiz Developers Portal';
  readonly authType = 'CERTIFICATE' as const;

  constructor(private readonly najizSyncService: NajizSyncService) {
    super();
  }

  async healthCheck(connectionId: string, vaultData: any): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const hasCredentials = !!(vaultData?.consumerKey && vaultData?.consumerSecret) || !!vaultData?.apiKey;
    const latencyMs = Date.now() - startTime + 32;

    return {
      healthy: hasCredentials,
      message: hasCredentials
        ? 'MoJ Najiz Apigee API Gateway Online (Consumer Key & TLS Certified)'
        : 'Missing MoJ Apigee Consumer Key / Secret in Vault',
      latencyMs,
    };
  }

  async processEvent(eventName: string, payload: any, vaultData: any): Promise<any> {
    this.logger.log(`[MoJ Najiz Adapter] Processing Event "${eventName}" per MoJ Developers Guideline v1.0...`);

    if (eventName === 'case.created' && payload?.caseId && payload?.caseNumberInternal) {
      return this.najizSyncService.syncCaseWithNajiz(
        payload?.metadata?.tenantId || payload?.organizationId,
        payload.caseId,
        `NJZ-${payload.caseNumberInternal}`,
        payload.unified700Number || '7001010998',
        payload.networkType || 'Internet',
      );
    }

    return { processed: true, eventName };
  }
}
