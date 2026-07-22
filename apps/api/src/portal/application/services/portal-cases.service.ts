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
   * Fetches active cases for a specific portal client.
   */
  async getClientCases(organizationId: string, clientId: string) {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      return (this.prisma.db as any).case.findMany({
        where: { organizationId, clientId, deletedAt: null },
        include: {
          hearings: {
            orderBy: { hearingDate: 'asc' },
          },
          documents: {
            select: { id: true, storagePath: true, fileType: true, ocrStatus: true },
          },
        },
        orderBy: { openedAt: 'desc' },
      });
    });
  }

  /**
   * Fetches detailed case timeline by Case ID for portal client.
   */
  async getClientCaseById(organizationId: string, clientId: string, caseId: string) {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const caseItem = await (this.prisma.db as any).case.findFirst({
        where: { id: caseId, organizationId, clientId, deletedAt: null },
        include: {
          hearings: { orderBy: { hearingDate: 'asc' } },
          documents: true,
        },
      });

      if (!caseItem) {
        throw new NotFoundException(`Case [${caseId}] not found for this client.`);
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
