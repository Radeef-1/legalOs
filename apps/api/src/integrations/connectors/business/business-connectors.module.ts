import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../shared/database/prisma.module';
import { OdooSyncService } from './odoo/odoo-sync.service';
import { OdooBusinessAdapter } from './odoo/odoo-business.adapter';
import { SapSyncService } from './sap/sap-sync.service';
import { SapBusinessAdapter } from './sap/sap-business.adapter';
import { SallaBusinessAdapter } from './webhook-connectors/salla-business.adapter';
import { HubspotBusinessAdapter } from './webhook-connectors/hubspot-business.adapter';

@Module({
  imports: [PrismaModule],
  providers: [
    OdooSyncService,
    OdooBusinessAdapter,
    SapSyncService,
    SapBusinessAdapter,
    SallaBusinessAdapter,
    HubspotBusinessAdapter,
  ],
  exports: [
    OdooSyncService,
    OdooBusinessAdapter,
    SapSyncService,
    SapBusinessAdapter,
    SallaBusinessAdapter,
    HubspotBusinessAdapter,
  ],
})
export class BusinessConnectorsModule {}
