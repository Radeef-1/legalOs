import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { TenantContext } from '../../../shared/tenant/tenant.context';

export class CreateClientActionDto {
  clientId!: string;
  caseId?: string;
  actionType!: 'UPLOAD_DOCUMENT' | 'SIGN_DOCUMENT' | 'PAY_INVOICE' | 'CONFIRM_HEARING' | 'PROVIDE_INFO';
  title!: string;
  description?: string;
  dueDate?: string | Date;
  relatedEntityId?: string;
}

@Injectable()
export class PortalActionsService {
  private readonly logger = new Logger(PortalActionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Gets all pending actions for a client (Action Center).
   */
  async getPendingActions(organizationId: string, clientId: string) {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const db = this.prisma.db as any;

      return db.clientAction.findMany({
        where: {
          organizationId,
          clientId,
          status: 'PENDING',
        },
        include: {
          case: { select: { caseNumberInternal: true, courtName: true } },
        },
        orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
      });
    });
  }

  /**
   * Gets all actions for a client (including completed and expired).
   */
  async getAllActions(organizationId: string, clientId: string) {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const db = this.prisma.db as any;

      return db.clientAction.findMany({
        where: { organizationId, clientId },
        include: {
          case: { select: { caseNumberInternal: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  }

  /**
   * Creates a new action for a client (called by the law firm).
   */
  async createAction(organizationId: string, dto: CreateClientActionDto) {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const db = this.prisma.db as any;

      const action = await db.clientAction.create({
        data: {
          organizationId,
          clientId: dto.clientId,
          caseId: dto.caseId || null,
          actionType: dto.actionType,
          title: dto.title,
          description: dto.description || null,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
          relatedEntityId: dto.relatedEntityId || null,
          status: 'PENDING',
        },
      });

      this.logger.log(
        `[Portal Actions] Action created for Client [${dto.clientId}]: "${dto.title}" (${dto.actionType})`,
      );

      return action;
    });
  }

  /**
   * Marks an action as completed by the client.
   */
  async completeAction(organizationId: string, clientId: string, actionId: string) {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const db = this.prisma.db as any;

      const action = await db.clientAction.findFirst({
        where: { id: actionId, organizationId, clientId, status: 'PENDING' },
      });

      if (!action) {
        throw new NotFoundException(`الإجراء [${actionId}] غير موجود أو مكتمل بالفعل.`);
      }

      const updated = await db.clientAction.update({
        where: { id: actionId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      this.logger.log(
        `[Portal Actions] Action [${action.title}] completed by Client [${clientId}]`,
      );

      return updated;
    });
  }

  /**
   * Gets summary statistics for client actions.
   */
  async getActionsSummary(organizationId: string, clientId: string) {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const db = this.prisma.db as any;

      const [pending, completed, expired] = await Promise.all([
        db.clientAction.count({ where: { organizationId, clientId, status: 'PENDING' } }),
        db.clientAction.count({ where: { organizationId, clientId, status: 'COMPLETED' } }),
        db.clientAction.count({ where: { organizationId, clientId, status: 'EXPIRED' } }),
      ]);

      const total = pending + completed + expired;

      return {
        pending,
        completed,
        expired,
        total,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });
  }
}
