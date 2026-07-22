import { Injectable, Logger } from '@nestjs/common';

export interface OdooInvoicePayload {
  invoiceNumber: string;
  clientNameAr: string;
  totalAmountSar: number;
}

export interface OdooSyncResult {
  synced: boolean;
  odooPartnerId: number;
  odooMoveId: number;
  syncedAt: Date;
}

@Injectable()
export class OdooSyncService {
  private readonly logger = new Logger(OdooSyncService.name);

  /**
   * Mock Odoo JSON-RPC ERP Integration.
   */
  async syncInvoiceToOdoo(baseUrl: string, apiKey: string, payload: OdooInvoicePayload): Promise<OdooSyncResult> {
    this.logger.log(`[Odoo ERP Connector] Syncing Invoice [${payload.invoiceNumber}] to Odoo JSON-RPC at ${baseUrl}...`);

    const odooPartnerId = Math.floor(Math.random() * 9000) + 1000;
    const odooMoveId = Math.floor(Math.random() * 50000) + 10000;

    return {
      synced: true,
      odooPartnerId,
      odooMoveId,
      syncedAt: new Date(),
    };
  }
}
