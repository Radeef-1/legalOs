import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../shared/database/prisma.module';
import { NajizSyncService } from './najiz/najiz-sync.service';
import { NajizGovernmentAdapter } from './najiz/najiz-government.adapter';
import { ZatcaXmlBuilderService } from './zatca/zatca-xml-builder.service';
import { ZatcaSignerService } from './zatca/zatca-signer.service';
import { ZatcaGovernmentAdapter } from './zatca/zatca-government.adapter';

@Module({
  imports: [PrismaModule],
  providers: [
    NajizSyncService,
    NajizGovernmentAdapter,
    ZatcaXmlBuilderService,
    ZatcaSignerService,
    ZatcaGovernmentAdapter,
  ],
  exports: [
    NajizSyncService,
    NajizGovernmentAdapter,
    ZatcaXmlBuilderService,
    ZatcaSignerService,
    ZatcaGovernmentAdapter,
  ],
})
export class GovernmentConnectorsModule {}
