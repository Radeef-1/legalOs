import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../shared/database/prisma.module';
import { GoogleCalendarSyncService } from './google/google-calendar-sync.service';
import { GoogleCalendarAdapter } from './google/google-calendar.adapter';
import { OutlookCalendarSyncService } from './outlook/outlook-calendar-sync.service';
import { OutlookCalendarAdapter } from './outlook/outlook-calendar.adapter';

@Module({
  imports: [PrismaModule],
  providers: [
    GoogleCalendarSyncService,
    GoogleCalendarAdapter,
    OutlookCalendarSyncService,
    OutlookCalendarAdapter,
  ],
  exports: [
    GoogleCalendarSyncService,
    GoogleCalendarAdapter,
    OutlookCalendarSyncService,
    OutlookCalendarAdapter,
  ],
})
export class ProductivityConnectorsModule {}
