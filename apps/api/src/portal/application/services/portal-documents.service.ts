import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { TenantContext } from '../../../shared/tenant/tenant.context';

@Injectable()
export class PortalDocumentsService {
  private readonly logger = new Logger(PortalDocumentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Allows client to upload document to Document Vault for a case.
   */
  async uploadClientDocument(
    organizationId: string,
    clientId: string,
    caseId: string,
    title: string,
    fileUrl: string,
  ) {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const document = await (this.prisma.db as any).document.create({
        data: {
          organizationId,
          caseId,
          storagePath: fileUrl,
          fileType: 'pdf',
          ocrStatus: 'pending',
        },
      });

      this.logger.log(`[Portal Documents] Client Document uploaded: "${title}" (${document.id})`);

      return document;
    });
  }

  /**
   * Fetches public documents accessible by client.
   */
  async getClientDocuments(organizationId: string, clientId: string) {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      return (this.prisma.db as any).document.findMany({
        where: {
          organizationId,
          case: { clientId },
        },
        orderBy: { id: 'desc' },
      });
    });
  }
}
