export interface HealthCheckResult {
  healthy: boolean;
  message: string;
  latencyMs: number;
}

export abstract class BaseIntegrationAdapter {
  abstract readonly providerCode: string;
  abstract readonly nameAr: string;
  abstract readonly nameEn: string;
  abstract readonly authType: 'OAUTH2' | 'API_KEY' | 'CERTIFICATE';

  abstract healthCheck(connectionId: string, vaultData: any): Promise<HealthCheckResult>;
  abstract processEvent?(eventName: string, payload: any, vaultData: any): Promise<any>;
}
