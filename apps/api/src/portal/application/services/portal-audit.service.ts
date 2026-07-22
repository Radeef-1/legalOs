import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { TenantContext } from '../../../shared/tenant/tenant.context';

@Injectable()
export class PortalAuditService {
  private readonly logger = new Logger(PortalAuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Logs a portal activity.
   */
  async logActivity(
    organizationId: string,
    clientId: string,
    action: 'LOGIN' | 'VIEW_CASE' | 'DOWNLOAD_DOC' | 'UPLOAD_DOC' | 'SIGN_DOC' | 'SEND_MESSAGE' | 'PAY_INVOICE' | 'REQUEST_APPOINTMENT' | 'COMPLETE_ACTION',
    entityType?: string,
    entityId?: string,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const db = this.prisma.db as any;

      const log = await db.portalAuditLog.create({
        data: {
          organizationId,
          clientId,
          action,
          entityType: entityType || null,
          entityId: entityId || null,
          ipAddress: metadata?.ipAddress || null,
          userAgent: metadata?.userAgent || null,
        },
      });

      this.logger.debug(
        `[Portal Audit] Client [${clientId}] — ${action} ${entityType ? `on ${entityType}` : ''} ${entityId ? `[${entityId}]` : ''}`,
      );

      return log;
    });
  }

  /**
   * Gets activity log for a specific client with pagination.
   */
  async getActivityLog(
    organizationId: string,
    clientId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const db = this.prisma.db as any;
      const skip = (page - 1) * limit;

      const [total, items] = await Promise.all([
        db.portalAuditLog.count({
          where: { organizationId, clientId },
        }),
        db.portalAuditLog.findMany({
          where: { organizationId, clientId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
      ]);

      return {
        items,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    });
  }

  /**
   * Gets activity log for all clients (for law firm analytics).
   */
  async getOrganizationActivityLog(
    organizationId: string,
    page: number = 1,
    limit: number = 50,
  ) {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const db = this.prisma.db as any;
      const skip = (page - 1) * limit;

      const [total, items] = await Promise.all([
        db.portalAuditLog.count({
          where: { organizationId },
        }),
        db.portalAuditLog.findMany({
          where: { organizationId },
          include: {
            client: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
      ]);

      return {
        items,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    });
  }

  /**
   * Gets portal analytics for the law firm.
   */
  async getPortalAnalytics(organizationId: string) {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const db = this.prisma.db as any;

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [
        totalClients,
        activePortalClients,
        totalLogins,
        totalMessages,
        totalDocumentsUploaded,
        pendingRequests,
        pendingActions,
      ] = await Promise.all([
        db.client.count({ where: { organizationId } }),
        db.client.count({ where: { organizationId, portalAccessEnabled: true } }),
        db.portalAuditLog.count({
          where: { organizationId, action: 'LOGIN', createdAt: { gte: thirtyDaysAgo } },
        }),
        db.portalMessage.count({
          where: { organizationId, createdAt: { gte: thirtyDaysAgo } },
        }),
        db.portalAuditLog.count({
          where: { organizationId, action: 'UPLOAD_DOC', createdAt: { gte: thirtyDaysAgo } },
        }),
        db.clientRequest.count({
          where: { organizationId, status: 'PENDING' },
        }),
        db.clientAction.count({
          where: { organizationId, status: 'PENDING' },
        }),
      ]);

      return {
        totalClients,
        activePortalClients,
        portalAdoptionRate: totalClients > 0 ? Math.round((activePortalClients / totalClients) * 100) : 0,
        last30Days: {
          totalLogins,
          totalMessages,
          totalDocumentsUploaded,
        },
        pendingRequests,
        pendingActions,
      };
    });
  }
}
