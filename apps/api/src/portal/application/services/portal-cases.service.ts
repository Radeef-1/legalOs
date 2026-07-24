import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { TenantContext } from '../../../shared/tenant/tenant.context';

export class SubmitClientRequestDto {
  caseId?: string;
  subject!: string;
  message!: string;
}

@Injectable()
export class PortalCasesService {
  private readonly logger = new Logger(PortalCasesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fetches active cases for a specific portal client with strict payload sanitization.
   */
  async getClientCases(organizationId: string, clientId: string) {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const cases = await (this.prisma.db as any).case.findMany({
        where: { organizationId, clientId, deletedAt: null },
        include: {
          hearings: {
            select: {
              id: true,
              title: true,
              hearingDate: true,
              status: true,
              courtName: true,
              summary: true,
            },
            orderBy: { hearingDate: 'asc' },
          },
          documents: {
            select: {
              id: true,
              fileType: true,
              createdAt: true,
            },
          },
        },
        orderBy: { openedAt: 'desc' },
      });

      return cases;
    });
  }

  /**
   * Fetches detailed case timeline by Case ID for portal client with sanitized fields.
   */
  async getClientCaseById(organizationId: string, clientId: string, caseId: string) {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const caseItem = await (this.prisma.db as any).case.findFirst({
        where: { id: caseId, organizationId, clientId, deletedAt: null },
        include: {
          hearings: {
            select: {
              id: true,
              title: true,
              hearingDate: true,
              status: true,
              courtName: true,
              summary: true,
            },
            orderBy: { hearingDate: 'asc' },
          },
          documents: {
            select: {
              id: true,
              fileType: true,
              createdAt: true,
            },
          },
        },
      });

      if (!caseItem) {
        throw new NotFoundException(`القضية رقم [${caseId}] غير موجودة أو غير مسجلة لهذا الموكل.`);
      }

      return caseItem;
    });
  }

  /**
   * Submits a formal client inquiry or document request.
   */
  async submitClientRequest(organizationId: string, clientId: string, dto: SubmitClientRequestDto) {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const clientRequest = await (this.prisma.db as any).clientRequest.create({
        data: {
          organizationId,
          clientId,
          caseId: dto.caseId,
          subject: dto.subject,
          message: dto.message,
          status: 'PENDING',
        },
      });

      this.logger.log(`[Portal Cases] Client Request submitted: [${clientRequest.subject}] (${clientRequest.id})`);

      return clientRequest;
    });
  }
}
