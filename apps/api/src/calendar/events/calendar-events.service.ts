import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { TenantContext } from '../../shared/tenant/tenant.context';
import { CalendarEventType, HearingStatus } from '@prisma/client';

export interface CreateCalendarEventDto {
  title: string;
  description?: string;
  eventType?: CalendarEventType;
  startTime: string | Date;
  endTime: string | Date;
  isAllDay?: boolean;
  location?: string;
  caseId?: string;
  clientId?: string;
  organizerId: string;
  attendeeIds?: string[];
}

@Injectable()
export class CalendarEventsService {
  constructor(private readonly prisma: PrismaService) {}

  async checkConflicts(organizerId: string, startTime: Date, endTime: Date, ignoreEventId?: string) {
    const tenantId = TenantContext.getTenantId();
    const conflicts: Array<{ id: string; title: string; startTime: Date; endTime: Date; type: string }> = [];

    // 1. Check overlapping Court Hearings assigned to the lawyer
    const overlappingHearings = await this.prisma.db.hearing.findMany({
      where: {
        organizationId: tenantId,
        assignedLawyerId: organizerId,
        status: { in: [HearingStatus.SCHEDULED] },
        hearingDate: { lt: endTime },
        OR: [
          { endDate: { gt: startTime } },
          { endDate: null }, // If no end date, assume 1 hr
        ],
      },
    });

    for (const h of overlappingHearings) {
      const hEnd = h.endDate ?? new Date(h.hearingDate.getTime() + 60 * 60 * 1000);
      if (h.hearingDate < endTime && hEnd > startTime) {
        conflicts.push({
          id: h.id,
          title: `[جلسة قضائية] ${h.title}`,
          startTime: h.hearingDate,
          endTime: hEnd,
          type: 'COURT_HEARING',
        });
      }
    }

    // 2. Check overlapping CalendarEvents organized by or attending
    const overlappingEvents = await this.prisma.db.calendarEvent.findMany({
      where: {
        organizationId: tenantId,
        ...(ignoreEventId ? { id: { not: ignoreEventId } } : {}),
        OR: [
          { organizerId },
          { attendeeIds: { has: organizerId } },
        ],
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });

    for (const evt of overlappingEvents) {
      conflicts.push({
        id: evt.id,
        title: evt.title,
        startTime: evt.startTime,
        endTime: evt.endTime,
        type: evt.eventType,
      });
    }

    return {
      hasConflict: conflicts.length > 0,
      conflictsCount: conflicts.length,
      conflicts,
    };
  }

  async create(dto: CreateCalendarEventDto) {
    const tenantId = TenantContext.getTenantId();
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    // Run Conflict Detection Engine
    const conflictCheck = await this.checkConflicts(dto.organizerId, startTime, endTime);

    const event = await this.prisma.db.calendarEvent.create({
      data: {
        organizationId: tenantId,
        title: dto.title,
        description: dto.description ?? null,
        eventType: dto.eventType ?? CalendarEventType.CLIENT_MEETING,
        startTime,
        endTime,
        isAllDay: dto.isAllDay ?? false,
        location: dto.location ?? null,
        caseId: dto.caseId ?? null,
        clientId: dto.clientId ?? null,
        organizerId: dto.organizerId,
        attendeeIds: dto.attendeeIds ?? [],
      },
      include: {
        organizer: { include: { user: { select: { fullName: true } } } },
        case: { select: { caseNumberInternal: true } },
        client: { select: { name: true } },
      },
    });

    return {
      event,
      conflictWarning: conflictCheck.hasConflict ? conflictCheck : null,
    };
  }

  async findAll(organizerId?: string, caseId?: string, fromDate?: string | Date, toDate?: string | Date) {
    const tenantId = TenantContext.getTenantId();
    return this.prisma.db.calendarEvent.findMany({
      where: {
        organizationId: tenantId,
        ...(organizerId ? { OR: [{ organizerId }, { attendeeIds: { has: organizerId } }] } : {}),
        ...(caseId ? { caseId } : {}),
        ...(fromDate ? { startTime: { gte: new Date(fromDate) } } : {}),
        ...(toDate ? { endTime: { lte: new Date(toDate) } } : {}),
      },
      include: {
        organizer: { include: { user: { select: { fullName: true } } } },
        case: { select: { caseNumberInternal: true } },
        client: { select: { name: true } },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async findOne(id: string) {
    const tenantId = TenantContext.getTenantId();
    const event = await this.prisma.db.calendarEvent.findFirst({
      where: { id, organizationId: tenantId },
      include: {
        organizer: { include: { user: { select: { fullName: true } } } },
        case: { select: { caseNumberInternal: true } },
        client: { select: { name: true } },
      },
    });

    if (!event) {
      throw new NotFoundException(`CalendarEvent with ID ${id} not found`);
    }

    return event;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.db.calendarEvent.delete({ where: { id } });
  }
}
