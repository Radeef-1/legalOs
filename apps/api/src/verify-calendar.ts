import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './shared/database/prisma.service';
import { TenantContext } from './shared/tenant/tenant.context';
import { HearingsService } from './calendar/hearings/hearings.service';
import { CalendarEventsService } from './calendar/events/calendar-events.service';
import { CalendarSyncService } from './calendar/sync/calendar-sync.service';
import { HearingStatus, CalendarEventType, CalendarSyncProvider } from '@prisma/client';

async function main() {
  console.log('--- Bootstrapping NestJS Context for Calendar Verification ---');
  const app = await NestFactory.createApplicationContext(AppModule);

  const prisma = app.get(PrismaService);
  const hearingsService = app.get(HearingsService);
  const eventsService = app.get(CalendarEventsService);
  const syncService = app.get(CalendarSyncService);

  const tenantAId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const tenantBId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  const partnerAId = '33333333-3333-3333-3333-333333333333';

  await TenantContext.run({ tenantId: tenantAId, userId: partnerAId, role: 'Partner' }, async () => {
    try {
      console.log('\n[1] Setup Test Client & Case');
      const client = await prisma.db.client.create({
        data: {
          organizationId: tenantAId,
          name: 'شركة التقدم للتكنولوجيا',
          nationalIdOrCr: '1010112233',
        },
      });

      const caseItem = await prisma.db.case.create({
        data: {
          organizationId: tenantAId,
          clientId: client.id,
          caseNumberInternal: `CAL-CASE-${Date.now()}`,
          caseType: 'commercial',
          courtName: 'المحكمة التجارية بالرياض',
          status: 'open',
        },
      });

      const member = await prisma.db.organizationMember.findUnique({
        where: { organizationId_userId: { organizationId: tenantAId, userId: partnerAId } },
      });

      if (!member) throw new Error('OrganizationMember not found for partner');

      // ----------------------------------------------------
      // Scenario 1: Court Hearing Scheduling
      // ----------------------------------------------------
      console.log('\n[2] Scenario 1: Scheduling Court Session Hearing');
      const today10am = new Date();
      today10am.setHours(10, 0, 0, 0);
      const today11am = new Date();
      today11am.setHours(11, 0, 0, 0);

      const hearing = await hearingsService.create({
        caseId: caseItem.id,
        title: 'جلسة المرافعة الأولى في الدعوى التجارية',
        hearingDate: today10am,
        endDate: today11am,
        courtName: 'المحكمة التجارية بالرياض',
        courtRoom: 'القاعة 4',
        judgeName: 'د. عبد الله الشمري',
        assignedLawyerId: member.id,
        notes: 'حضور وتقديم المذكرة الجوابية',
      });

      console.log(`- Scheduled Hearing [ID: ${hearing.id}]: "${hearing.title}" from ${hearing.hearingDate.toISOString()} to ${hearing.endDate?.toISOString()}`);
      if (hearing.status !== HearingStatus.SCHEDULED) {
        throw new Error('Hearing creation status mismatch');
      }

      // ----------------------------------------------------
      // Scenario 2: Conflict Detection Engine Warning
      // ----------------------------------------------------
      console.log('\n[3] Scenario 2: Testing Schedule Conflict Detection Engine');
      const conflictStart = new Date();
      conflictStart.setHours(10, 30, 0, 0); // Overlaps 10:00-11:00 AM!
      const conflictEnd = new Date();
      conflictEnd.setHours(11, 30, 0, 0);

      const conflictCheck = await eventsService.checkConflicts(member.id, conflictStart, conflictEnd);
      console.log(`- Conflict Check for 10:30-11:30 AM: HasConflict=${conflictCheck.hasConflict}, ConflictsFound=${conflictCheck.conflictsCount}`);

      if (!conflictCheck.hasConflict || conflictCheck.conflictsCount === 0) {
        throw new Error('Conflict Detection Engine failed to detect overlapping court hearing');
      }
      console.log('✔ Conflict Detection Engine successfully flagged overlapping court session!');

      // Attempting to create meeting returns conflict warning object
      const conflictingEventRes = await eventsService.create({
        title: 'اجتماع تسوية ودية مع الخصم',
        eventType: CalendarEventType.CLIENT_MEETING,
        startTime: conflictStart,
        endTime: conflictEnd,
        organizerId: member.id,
      });

      if (!conflictingEventRes.conflictWarning?.hasConflict) {
        throw new Error('CalendarEvent creation did not include conflictWarning metadata');
      }
      console.log('✔ Event created with attached conflict warning payload!');

      // ----------------------------------------------------
      // Scenario 3: Non-Conflicting Meeting Booking
      // ----------------------------------------------------
      console.log('\n[4] Scenario 3: Booking Non-Conflicting Meeting');
      const pm2 = new Date();
      pm2.setHours(14, 0, 0, 0);
      const pm3 = new Date();
      pm3.setHours(15, 0, 0, 0);

      const cleanEventRes = await eventsService.create({
        title: 'جلسة استشارة قانونية جديدة',
        description: 'مراجعة عقود الشراكة الاستثمارية',
        eventType: CalendarEventType.CLIENT_MEETING,
        startTime: pm2,
        endTime: pm3,
        location: 'مكتب الرياض الرئيسي - غرفة الاجتماعات B',
        caseId: caseItem.id,
        clientId: client.id,
        organizerId: member.id,
      });

      console.log(`- Created Event [ID: ${cleanEventRes.event.id}]: "${cleanEventRes.event.title}" from 02:00 PM to 03:00 PM`);
      if (cleanEventRes.conflictWarning !== null) {
        throw new Error('Non-conflicting event incorrectly triggered conflict warning');
      }
      console.log('✔ Non-conflicting event created cleanly without warnings!');

      // ----------------------------------------------------
      // Scenario 4: iCal Feed Generation
      // ----------------------------------------------------
      console.log('\n[5] Scenario 4: Generating iCalendar Standard (.ics) Feed');
      const icalContent = await syncService.exportICalFeed(member.id);
      console.log(`- iCal Feed Output Sample (First 300 chars):\n${icalContent.substring(0, 300)}...`);

      if (!icalContent.startsWith('BEGIN:VCALENDAR') || !icalContent.includes('END:VCALENDAR') || !icalContent.includes('BEGIN:VEVENT')) {
        throw new Error('Invalid iCalendar feed generation format');
      }
      console.log('✔ iCal (.ics) Feed format verified successfully!');

      // ----------------------------------------------------
      // Scenario 5: Google & Outlook OAuth Sync Adapters
      // ----------------------------------------------------
      console.log('\n[6] Scenario 5: Google & Outlook Calendar Sync Integration');
      const googleCred = await syncService.registerCredential({
        memberId: member.id,
        provider: CalendarSyncProvider.GOOGLE,
        accessToken: 'mock-google-oauth-access-token',
        refreshToken: 'mock-google-refresh-token',
        calendarId: 'lawyer.primary@gmail.com',
      });

      console.log(`- Registered Google OAuth Sync Credential [ID: ${googleCred.id}]`);

      const syncRes = await syncService.triggerSync(member.id, CalendarSyncProvider.GOOGLE);
      console.log(`- Triggered Google Calendar Sync: Status=${syncRes.status}, Message="${syncRes.message}"`);

      if (syncRes.status !== 'SUCCESS') {
        throw new Error('Google Calendar OAuth sync trigger failed');
      }
      console.log('✔ Google Calendar OAuth Sync Adapter verified successfully!');

      // ----------------------------------------------------
      // Scenario 6: Multi-Tenant RLS Security Isolation
      // ----------------------------------------------------
      console.log('\n[7] Scenario 6: Multi-Tenant RLS Security Isolation Test');
      await TenantContext.run({ tenantId: tenantBId, userId: 'other-user', role: 'Partner' }, async () => {
        const tenantBHearings = await hearingsService.findAll();
        const tenantBEvents = await eventsService.findAll();

        console.log(`- Tenant B Hearings Count: ${tenantBHearings.length} (Expected: 0 from Tenant A)`);
        console.log(`- Tenant B Calendar Events Count: ${tenantBEvents.length} (Expected: 0 from Tenant A)`);

        const isIsolated = !tenantBHearings.some((h) => h.id === hearing.id) && !tenantBEvents.some((e) => e.id === cleanEventRes.event.id);
        if (!isIsolated) {
          throw new Error('SECURITY VIOLATION: Tenant B accessed Tenant A calendar events!');
        }
        console.log('✔ Tenant Calendar RLS Isolation Verified!');
      });

      console.log('\n✅ All Calendar Domain scenarios verified successfully!');
    } catch (err) {
      console.error('❌ Calendar Verification failed:', err);
      process.exit(1);
    } finally {
      await app.close();
    }
  });
}

main();
