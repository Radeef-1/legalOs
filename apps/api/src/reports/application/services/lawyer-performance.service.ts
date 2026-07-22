import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { TenantContext } from '../../../shared/tenant/tenant.context';

export interface LawyerPerformanceMetric {
  lawyerId: string;
  lawyerName: string;
  totalLoggedHours: number;
  totalBillableAmountSar: number;
  activeAssignedCasesCount: number;
}

@Injectable()
export class LawyerPerformanceService {
  private readonly logger = new Logger(LawyerPerformanceService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculates fee-earner/lawyer utilization and performance metrics.
   */
  async getLawyerPerformance(organizationId: string): Promise<LawyerPerformanceMetric[]> {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      // Find all distinct time entries with organization members in this tenant
      const timeEntries = await (this.prisma.db as any).timeEntry.findMany({
        where: { organizationId },
        include: {
          member: {
            include: { user: true },
          },
        },
      });

      const userMap = new Map<string, { userId: string; lawyerName: string; hours: number; billableAmount: number }>();

      for (const entry of timeEntries) {
        const user = entry.member?.user;
        const uid = user ? user.id : entry.memberId;
        const userName = user
          ? user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
          : 'محامي النظام';

        const hours = Number(entry.hours || 0);
        const rate = Number(entry.hourlyRate || 0);

        if (!userMap.has(uid)) {
          userMap.set(uid, { userId: uid, lawyerName: userName, hours: 0, billableAmount: 0 });
        }

        const current = userMap.get(uid)!;
        current.hours += hours;
        current.billableAmount += hours * rate;
      }

      const performanceList: LawyerPerformanceMetric[] = [];

      for (const [lawyerId, data] of userMap.entries()) {
        const activeCasesCount = await (this.prisma.db as any).case.count({
          where: { organizationId, assignedLawyerId: lawyerId, deletedAt: null },
        });

        performanceList.push({
          lawyerId,
          lawyerName: data.lawyerName,
          totalLoggedHours: data.hours,
          totalBillableAmountSar: data.billableAmount,
          activeAssignedCasesCount: activeCasesCount,
        });
      }

      this.logger.log(`[Lawyer BI] Calculated performance for ${performanceList.length} fee-earners.`);
      return performanceList;
    });
  }
}
