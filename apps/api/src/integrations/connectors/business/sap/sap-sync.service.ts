import { Injectable, Logger } from '@nestjs/common';

export interface SapBusinessPartnerPayload {
  name: string;
  crNumber: string;
}

export interface SapSyncResult {
  synced: boolean;
  sapPartnerNumber: string;
  syncedAt: Date;
}

@Injectable()
export class SapSyncService {
  private readonly logger = new Logger(SapSyncService.name);

  /**
   * Mock SAP ERP OData v4 Integration.
   */
  async syncBusinessPartnerToSap(
    baseUrl: string,
    apiKey: string,
    payload: SapBusinessPartnerPayload,
  ): Promise<SapSyncResult> {
    this.logger.log(
      `[SAP ERP Connector] Pushing Business Partner "${payload.name}" to SAP OData v4 at ${baseUrl}...`,
    );

    const sapPartnerNumber = `BP00${Math.floor(Math.random() * 900000) + 100000}`;

    return {
      synced: true,
      sapPartnerNumber,
      syncedAt: new Date(),
    };
  }
}
