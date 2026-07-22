import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { TenantContext } from '../../shared/tenant/tenant.context';

export interface UserWorkspaceContext {
  userId: string;
  userName: string;
  userRole: string;
  organizationId: string;
  organizationName: string;
  activeCasesCount: number;
  openTasksCount: number;
  upcomingHearingsCount: number;
  recentActiveCaseNumber?: string;
}

@Injectable()
export class ContextEngineService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Constructs user and system context for prompt enrichment.
   */
  async buildUserContext(organizationId: string, userId: string): Promise<UserWorkspaceContext> {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const db = this.prisma.db as any;

      const [user, org, activeCasesCount, openTasksCount, upcomingHearingsCount, recentCase] = await Promise.all([
        db.user.findFirst({ where: { id: userId }, select: { fullName: true } }),
        db.organization.findFirst({ where: { id: organizationId }, select: { name: true } }),
        db.case.count({ where: { organizationId, deletedAt: null, status: 'open' } }),
        db.task.count({ where: { organizationId, status: { not: 'done' } } }),
        db.hearing.count({
          where: { organizationId, hearingDate: { gte: new Date() }, status: 'SCHEDULED' },
        }),
        db.case.findFirst({
          where: { organizationId, deletedAt: null },
          orderBy: { openedAt: 'desc' },
          select: { caseNumberInternal: true },
        }),
      ]);

      const role = TenantContext.getRole() || 'Partner';

      return {
        userId,
        userName: user?.fullName || 'المستخدم',
        userRole: role,
        organizationId,
        organizationName: org?.name || 'مكتب المحاماة',
        activeCasesCount,
        openTasksCount,
        upcomingHearingsCount,
        recentActiveCaseNumber: recentCase?.caseNumberInternal,
      };
    });
  }
}
