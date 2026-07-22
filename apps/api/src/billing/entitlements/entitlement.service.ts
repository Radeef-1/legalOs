import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { TenantContext } from '../../shared/tenant/tenant.context';

@Injectable()
export class EntitlementService {
  constructor(private readonly prisma: PrismaService) {}

  async checkSeatCapacity(organizationId: string): Promise<{
    canAddSeat: boolean;
    currentMembersCount: number;
    maxSeats: number;
  }> {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const subscription = await this.prisma.db.tenantSubscription.findUnique({
        where: { organizationId },
        include: { plan: true },
      });

      // Default to 5 seats if no subscription found
      const maxSeats = subscription?.plan?.maxSeats || 5;

      const currentMembersCount = await this.prisma.db.organizationMember.count({
        where: { organizationId },
      });

      const canAddSeat = currentMembersCount < maxSeats;

      return {
        canAddSeat,
        currentMembersCount,
        maxSeats,
      };
    });
  }

  async validateSeatLimitOrThrow(organizationId: string): Promise<void> {
    const quota = await this.checkSeatCapacity(organizationId);
    if (!quota.canAddSeat) {
      throw new ForbiddenException(
        `Seat quota limit reached (${quota.currentMembersCount}/${quota.maxSeats}). Please upgrade your SaaS subscription plan to add more workspace members.`,
      );
    }
  }

  async checkFeatureAccess(organizationId: string, featureKey: string): Promise<boolean> {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const subscription = await this.prisma.db.tenantSubscription.findUnique({
        where: { organizationId },
        include: { plan: true },
      });

      if (!subscription || !subscription.plan) {
        // Default Starter plan features
        const defaultFeatures = ['BASIC_CASES', 'CRM_CLIENTS', 'DOCUMENTS'];
        return defaultFeatures.includes(featureKey);
      }

      const features = (subscription.plan.featuresJson as string[]) || [];
      return features.includes(featureKey);
    });
  }

  async validateFeatureOrThrow(organizationId: string, featureKey: string): Promise<void> {
    const hasAccess = await this.checkFeatureAccess(organizationId, featureKey);
    if (!hasAccess) {
      throw new ForbiddenException(
        `Feature "${featureKey}" is not included in your current subscription tier. Upgrade your plan to access this feature.`,
      );
    }
  }
}
