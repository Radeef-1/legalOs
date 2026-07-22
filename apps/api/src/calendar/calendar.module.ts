import { Module } from '@nestjs/common';
import { PrismaModule } from '../shared/database/prisma.module';
import { HearingsService } from './hearings/hearings.service';
import { HearingsController } from './hearings/hearings.controller';
import { CalendarEventsService } from './events/calendar-events.service';
import { CalendarEventsController } from './events/calendar-events.controller';
import { CalendarSyncService } from './sync/calendar-sync.service';
import { CalendarSyncController } from './sync/calendar-sync.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    HearingsController,
    CalendarEventsController,
    CalendarSyncController,
  ],
  providers: [
    HearingsService,
    CalendarEventsService,
    CalendarSyncService,
  ],
  exports: [
    HearingsService,
    CalendarEventsService,
    CalendarSyncService,
  ],
})
export class CalendarModule {}
