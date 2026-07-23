import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';

@Injectable()
export class InvitationAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Aggregates invitation metrics & conversion rates for an organization
   */
  async getAnalytics(orgId: string) {
    const total = await this.prisma.db.enterpriseInvitation.count({
      where: { organizationId: orgId },
    });

    const pending = await this.prisma.db.enterpriseInvitation.count({
      where: { organizationId: orgId, status: 'PENDING' },
    });

    const accepted = await this.prisma.db.enterpriseInvitation.count({
      where: { organizationId: orgId, status: 'ACCEPTED' },
    });

    const expired = await this.prisma.db.enterpriseInvitation.count({
      where: { organizationId: orgId, status: 'EXPIRED' },
    });

    const rejected = await this.prisma.db.enterpriseInvitation.count({
      where: { organizationId: orgId, status: 'REJECTED' },
    });

    const conversionRate = total > 0 ? ((accepted / total) * 100).toFixed(1) : '100.0';

    return {
      total,
      pending,
      accepted,
      expired,
      rejected,
      conversionRate: `${conversionRate}%`,
    };
  }
}
