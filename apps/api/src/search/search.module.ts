import { Module } from '@nestjs/common';
import { PrismaModule } from '../shared/database/prisma.module';
import { ArabicNormalizer } from './normalizer/arabic-normalizer';
import { CasesIndexerService } from './indexers/cases-indexer.service';
import { ClientsIndexerService } from './indexers/clients-indexer.service';
import { DocumentsIndexerService } from './indexers/documents-indexer.service';
import { HearingsIndexerService } from './indexers/hearings-indexer.service';
import { InvoicesIndexerService } from './indexers/invoices-indexer.service';
import { GlobalSearchService } from './service/global-search.service';
import { SearchController } from './controller/search.controller';

@Module({
  imports: [PrismaModule],
  controllers: [SearchController],
  providers: [
    ArabicNormalizer,
    CasesIndexerService,
    ClientsIndexerService,
    DocumentsIndexerService,
    HearingsIndexerService,
    InvoicesIndexerService,
    GlobalSearchService,
  ],
  exports: [
    ArabicNormalizer,
    GlobalSearchService,
    CasesIndexerService,
    ClientsIndexerService,
    DocumentsIndexerService,
    HearingsIndexerService,
    InvoicesIndexerService,
  ],
})
export class SearchModule {}
