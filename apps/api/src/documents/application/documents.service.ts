import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { StorageService } from '../../shared/storage/storage.service';
import { TenantContext } from '../../shared/tenant/tenant.context';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async upload(file: any, caseId?: string) {
    const tenantId = TenantContext.getTenantId()!;
    const userId = TenantContext.getUserId()!;

    if (caseId) {
      const caseItem = await this.prisma.db.case.findFirst({
        where: { id: caseId, organizationId: tenantId, deletedAt: null },
      });
      if (!caseItem) {
        throw new NotFoundException({
          code: 'CASE_NOT_FOUND',
          message: 'القضية المحددة غير موجودة',
        });
      }
    }

    const { storagePath, fileType } = await this.storage.uploadFile(file, tenantId, caseId);

    const document = await this.prisma.db.document.create({
      data: {
        organizationId: tenantId,
        caseId: caseId || null,
        uploadedBy: userId,
        storagePath,
        fileType,
        ocrStatus: 'not_applicable',
      },
    });

    return document;
  }

  async download(id: string) {
    const tenantId = TenantContext.getTenantId()!;

    const document = await this.prisma.db.document.findFirst({
      where: { id, organizationId: tenantId },
    });

    if (!document) {
      throw new NotFoundException({
        code: 'DOCUMENT_NOT_FOUND',
        message: 'المستند غير موجود أو لا تملك الصلاحية للوصول إليه',
      });
    }

    const buffer = await this.storage.getFileBuffer(document.storagePath);
    return {
      buffer,
      fileType: document.fileType,
      storagePath: document.storagePath,
    };
  }

  async findAllForCase(caseId: string) {
    const tenantId = TenantContext.getTenantId()!;
    return this.prisma.db.document.findMany({
      where: { caseId, organizationId: tenantId },
    });
  }
}
