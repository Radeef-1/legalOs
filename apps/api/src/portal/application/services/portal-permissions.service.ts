import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { TenantContext } from '../../../shared/tenant/tenant.context';

export class UpdatePermissionsDto {
  canViewCases?: boolean;
  canViewDocuments?: boolean;
  canViewInvoices?: boolean;
  canUpload?: boolean;
  canSign?: boolean;
  canMessage?: boolean;
  canViewNotes?: boolean;
  canViewVerdict?: boolean;
  canRequestAppointment?: boolean;
}

export interface PortalPermissions {
  canViewCases: boolean;
  canViewDocuments: boolean;
  canViewInvoices: boolean;
  canUpload: boolean;
  canSign: boolean;
  canMessage: boolean;
  canViewNotes: boolean;
  canViewVerdict: boolean;
  canRequestAppointment: boolean;
}

@Injectable()
export class PortalPermissionsService {
  private readonly logger = new Logger(PortalPermissionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Gets portal permissions for a specific client.
   * Returns default (all true) if no custom permissions are set.
   */
  async getClientPermissions(organizationId: string, clientId: string): Promise<PortalPermissions> {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const db = this.prisma.db as any;

      const permissions = await db.portalPermission.findUnique({
        where: { clientId },
      });

      if (!permissions) {
        // Default permissions
        return {
          canViewCases: true,
          canViewDocuments: true,
          canViewInvoices: true,
          canUpload: true,
          canSign: false,
          canMessage: true,
          canViewNotes: false,
          canViewVerdict: true,
          canRequestAppointment: true,
        };
      }

      return {
        canViewCases: permissions.canViewCases,
        canViewDocuments: permissions.canViewDocuments,
        canViewInvoices: permissions.canViewInvoices,
        canUpload: permissions.canUpload,
        canSign: permissions.canSign,
        canMessage: permissions.canMessage,
        canViewNotes: permissions.canViewNotes,
        canViewVerdict: permissions.canViewVerdict,
        canRequestAppointment: permissions.canRequestAppointment,
      };
    });
  }

  /**
   * Updates portal permissions for a specific client (called by the law firm).
   */
  async updateClientPermissions(
    organizationId: string,
    clientId: string,
    dto: UpdatePermissionsDto,
  ): Promise<PortalPermissions> {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const db = this.prisma.db as any;

      const permissions = await db.portalPermission.upsert({
        where: { clientId },
        create: {
          organizationId,
          clientId,
          canViewCases: dto.canViewCases ?? true,
          canViewDocuments: dto.canViewDocuments ?? true,
          canViewInvoices: dto.canViewInvoices ?? true,
          canUpload: dto.canUpload ?? true,
          canSign: dto.canSign ?? false,
          canMessage: dto.canMessage ?? true,
          canViewNotes: dto.canViewNotes ?? false,
          canViewVerdict: dto.canViewVerdict ?? true,
          canRequestAppointment: dto.canRequestAppointment ?? true,
        },
        update: {
          ...(dto.canViewCases !== undefined ? { canViewCases: dto.canViewCases } : {}),
          ...(dto.canViewDocuments !== undefined ? { canViewDocuments: dto.canViewDocuments } : {}),
          ...(dto.canViewInvoices !== undefined ? { canViewInvoices: dto.canViewInvoices } : {}),
          ...(dto.canUpload !== undefined ? { canUpload: dto.canUpload } : {}),
          ...(dto.canSign !== undefined ? { canSign: dto.canSign } : {}),
          ...(dto.canMessage !== undefined ? { canMessage: dto.canMessage } : {}),
          ...(dto.canViewNotes !== undefined ? { canViewNotes: dto.canViewNotes } : {}),
          ...(dto.canViewVerdict !== undefined ? { canViewVerdict: dto.canViewVerdict } : {}),
          ...(dto.canRequestAppointment !== undefined ? { canRequestAppointment: dto.canRequestAppointment } : {}),
        },
      });

      this.logger.log(`[Portal Permissions] Updated permissions for Client [${clientId}]`);

      return permissions;
    });
  }
}
