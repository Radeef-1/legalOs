import { Module } from '@nestjs/common';
import { CasesService } from './application/cases.service';
import { HearingsService } from './application/hearings.service';
import { CasesController } from './presentation/cases.controller';
import { HearingsController } from './presentation/hearings.controller';
import { NajizMockController } from './infrastructure/najiz/najiz-mock.controller';
import { PdfService } from '../shared/pdf/pdf.service';
import { TimelineEventHandler } from './application/handlers/timeline-event.handler';

@Module({
  controllers: [CasesController, HearingsController, NajizMockController],
  providers: [CasesService, HearingsService, PdfService, TimelineEventHandler],
  exports: [CasesService, HearingsService],
})
export class CasesModule {}
