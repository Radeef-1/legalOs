import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { TenantContext } from '../../../shared/tenant/tenant.context';

export class RequestAppointmentDto {
  caseId?: string;
  appointmentType!: 'IN_PERSON' | 'ZOOM' | 'GOOGLE_MEET' | 'TEAMS' | 'PHONE';
  title!: string;
  scheduledAt!: string | Date;
  endAt?: string | Date;
  notes?: string;
}

@Injectable()
export class PortalAppointmentsService {
  private readonly logger = new Logger(PortalAppointmentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Client requests a new appointment.
   */
  async requestAppointment(organizationId: string, clientId: string, dto: RequestAppointmentDto) {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const db = this.prisma.db as any;

      const appointment = await db.portalAppointment.create({
        data: {
          organizationId,
          clientId,
          caseId: dto.caseId || null,
          appointmentType: dto.appointmentType,
          title: dto.title,
          scheduledAt: new Date(dto.scheduledAt),
          endAt: dto.endAt ? new Date(dto.endAt) : null,
          notes: dto.notes || null,
          status: 'REQUESTED',
        },
      });

      this.logger.log(
        `[Portal Appointments] Client [${clientId}] requested appointment: "${dto.title}" (${dto.appointmentType})`,
      );

      return appointment;
    });
  }

  /**
   * Gets all appointments for a client.
   */
  async getAppointments(organizationId: string, clientId: string) {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const db = this.prisma.db as any;

      return db.portalAppointment.findMany({
        where: { organizationId, clientId },
        include: {
          case: { select: { caseNumberInternal: true } },
        },
        orderBy: { scheduledAt: 'desc' },
      });
    });
  }

  /**
   * Gets upcoming appointments for a client.
   */
  async getUpcomingAppointments(organizationId: string, clientId: string) {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const db = this.prisma.db as any;

      return db.portalAppointment.findMany({
        where: {
          organizationId,
          clientId,
          status: { in: ['REQUESTED', 'CONFIRMED'] },
          scheduledAt: { gte: new Date() },
        },
        include: {
          case: { select: { caseNumberInternal: true } },
        },
        orderBy: { scheduledAt: 'asc' },
      });
    });
  }

  /**
   * Client cancels an appointment.
   */
  async cancelAppointment(organizationId: string, clientId: string, appointmentId: string) {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const db = this.prisma.db as any;

      const appointment = await db.portalAppointment.findFirst({
        where: {
          id: appointmentId,
          organizationId,
          clientId,
          status: { in: ['REQUESTED', 'CONFIRMED'] },
        },
      });

      if (!appointment) {
        throw new NotFoundException(`الموعد [${appointmentId}] غير موجود أو لا يمكن إلغاؤه.`);
      }

      return db.portalAppointment.update({
        where: { id: appointmentId },
        data: { status: 'CANCELLED' },
      });
    });
  }

  /**
   * Law firm confirms an appointment.
   */
  async confirmAppointment(organizationId: string, appointmentId: string, meetingUrl?: string) {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const db = this.prisma.db as any;

      const appointment = await db.portalAppointment.findFirst({
        where: { id: appointmentId, organizationId, status: 'REQUESTED' },
      });

      if (!appointment) {
        throw new NotFoundException(`الموعد [${appointmentId}] غير موجود أو تمت معالجته.`);
      }

      return db.portalAppointment.update({
        where: { id: appointmentId },
        data: {
          status: 'CONFIRMED',
          meetingUrl: meetingUrl || null,
        },
      });
    });
  }
}
