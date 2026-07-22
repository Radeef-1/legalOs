import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { TenantContext } from '../../shared/tenant/tenant.context';
import { CalendarSyncProvider } from '@prisma/client';

export interface RegisterSyncCredentialDto {
  memberId: string;
  provider: CalendarSyncProvider;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string | Date;
  calendarId?: string;
}

@Injectable()
export class CalendarSyncService {
  constructor(private readonly prisma: PrismaService) {}

  async exportICalFeed(memberId: string): Promise<string> {
    const tenantId = TenantContext.getTenantId();

    const hearings = await this.prisma.db.hearing.findMany({
      where: { organizationId: tenantId, assignedLawyerId: memberId },
      include: { case: { select: { caseNumberInternal: true } } },
    });

    const events = await this.prisma.db.calendarEvent.findMany({
      where: {
        organizationId: tenantId,
        OR: [{ organizerId: memberId }, { attendeeIds: { has: memberId } }],
      },
    });

    const formatICalDate = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//LegalOS Enterprise Platform//Legal Calendar v2.7//AR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:تقويم LegalOS المهني',
    ];

    for (const h of hearings) {
      const startDate = formatICalDate(h.hearingDate);
      const endDate = formatICalDate(h.endDate ?? new Date(h.hearingDate.getTime() + 60 * 60 * 1000));

      lines.push(
        'BEGIN:VEVENT',
        `UID:hearing-${h.id}@legalos.sa`,
        `DTSTAMP:${formatICalDate(new Date())}`,
        `DTSTART:${startDate}`,
        `DTEND:${endDate}`,
        `SUMMARY:[جلسة قضائية] ${h.title} (قضية: ${h.case?.caseNumberInternal ?? 'N/A'})`,
        `DESCRIPTION:${(h.notes ?? '').replace(/\n/g, '\\n')}`,
        `LOCATION:${h.courtName ?? 'المحكمة'} ${h.courtRoom ? 'قاعة ' + h.courtRoom : ''}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
      );
    }

    for (const e of events) {
      const startDate = formatICalDate(e.startTime);
      const endDate = formatICalDate(e.endTime);

      lines.push(
        'BEGIN:VEVENT',
        `UID:event-${e.id}@legalos.sa`,
        `DTSTAMP:${formatICalDate(new Date())}`,
        `DTSTART:${startDate}`,
        `DTEND:${endDate}`,
        `SUMMARY:${e.title}`,
        `DESCRIPTION:${(e.description ?? '').replace(/\n/g, '\\n')}`,
        `LOCATION:${e.location ?? 'N/A'}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
      );
    }

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }

  async registerCredential(dto: RegisterSyncCredentialDto) {
    const tenantId = TenantContext.getTenantId();

    return this.prisma.db.calendarSyncCredential.upsert({
      where: {
        organizationId_memberId_provider: {
          organizationId: tenantId,
          memberId: dto.memberId,
          provider: dto.provider,
        },
      },
      create: {
        organizationId: tenantId,
        memberId: dto.memberId,
        provider: dto.provider,
        accessTokenEncrypted: dto.accessToken, // In prod, encrypt with KMS
        refreshTokenEncrypted: dto.refreshToken ?? null,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        calendarId: dto.calendarId ?? 'primary',
        syncEnabled: true,
        lastSyncedAt: new Date(),
      },
      update: {
        accessTokenEncrypted: dto.accessToken,
        refreshTokenEncrypted: dto.refreshToken ?? undefined,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        calendarId: dto.calendarId ?? undefined,
        syncEnabled: true,
        lastSyncedAt: new Date(),
      },
    });
  }

  async getSyncStatus(memberId: string) {
    const tenantId = TenantContext.getTenantId();
    return this.prisma.db.calendarSyncCredential.findMany({
      where: { organizationId: tenantId, memberId },
      select: {
        id: true,
        provider: true,
        syncEnabled: true,
        calendarId: true,
        lastSyncedAt: true,
      },
    });
  }

  async triggerSync(memberId: string, provider: CalendarSyncProvider) {
    const tenantId = TenantContext.getTenantId();
    const cred = await this.prisma.db.calendarSyncCredential.findUnique({
      where: {
        organizationId_memberId_provider: {
          organizationId: tenantId,
          memberId,
          provider,
        },
      },
    });

    if (!cred || !cred.syncEnabled) {
      throw new NotFoundException(`No active ${provider} Calendar sync credentials found for member`);
    }

    // Mock adapter sync execution
    const updated = await this.prisma.db.calendarSyncCredential.update({
      where: { id: cred.id },
      data: { lastSyncedAt: new Date() },
    });

    return {
      provider,
      status: 'SUCCESS',
      syncedAt: updated.lastSyncedAt,
      message: `Successfully synchronized schedule with ${provider} Calendar API adapter`,
    };
  }
}
