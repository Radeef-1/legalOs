import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { PlansService } from '../plans/plans.service';
import { PaymentGatewayAdapter, PaymentMethodDetails } from '../payment/payment-gateway.adapter';
import { SubscriptionStatus, SubscriptionTier } from '@prisma/client';
import { TenantContext } from '../../shared/tenant/tenant.context';

export interface SubscribeDto {
  organizationId: string;
  tier: SubscriptionTier;
  billingCycle?: 'monthly' | 'annual';
  paymentMethod: PaymentMethodDetails;
}

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly plansService: PlansService,
    private readonly paymentAdapter: PaymentGatewayAdapter,
  ) {}

  async getSubscription(organizationId: string) {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const sub = await this.prisma.db.tenantSubscription.findUnique({
        where: { organizationId },
        include: {
          plan: true,
          invoices: { orderBy: { createdAt: 'desc' } },
        },
      });

      if (!sub) {
        // Return default trial subscription view
        const starterPlan = await this.plansService.getPlanByCode(SubscriptionTier.STARTER);
        return {
          status: SubscriptionStatus.TRIALING,
          billingCycle: 'monthly',
          currentSeats: 1,
          plan: starterPlan,
          invoices: [],
        };
      }

      return sub;
    });
  }

  async subscribeOrUpgrade(dto: SubscribeDto) {
    const plan = await this.plansService.getPlanByCode(dto.tier);
    if (!plan) {
      throw new NotFoundException(`Subscription Plan code "${dto.tier}" not found.`);
    }

    const billingCycle = dto.billingCycle || 'monthly';
    const basePrice = billingCycle === 'annual' ? Number(plan.annualPriceSar) : Number(plan.monthlyPriceSar);
    const vatAmount = Math.round(basePrice * 0.15 * 100) / 100;
    const totalAmount = Math.round((basePrice + vatAmount) * 100) / 100;

    // Process payment
    const paymentRes = await this.paymentAdapter.processPayment(totalAmount, dto.paymentMethod);
    if (!paymentRes.success) {
      throw new BadRequestException('Payment gateway transaction declined.');
    }

    return TenantContext.run({ tenantId: dto.organizationId }, async () => {
      const periodStartsAt = new Date();
      const periodEndsAt = new Date();
      if (billingCycle === 'annual') {
        periodEndsAt.setFullYear(periodEndsAt.getFullYear() + 1);
      } else {
        periodEndsAt.setMonth(periodEndsAt.getMonth() + 1);
      }

      const subscription = await this.prisma.db.tenantSubscription.upsert({
        where: { organizationId: dto.organizationId },
        create: {
          organizationId: dto.organizationId,
          planId: plan.id,
          status: SubscriptionStatus.ACTIVE,
          billingCycle,
          currentSeats: plan.maxSeats,
          currentPeriodStartsAt: periodStartsAt,
          currentPeriodEndsAt: periodEndsAt,
        },
        update: {
          planId: plan.id,
          status: SubscriptionStatus.ACTIVE,
          billingCycle,
          currentSeats: plan.maxSeats,
          currentPeriodStartsAt: periodStartsAt,
          currentPeriodEndsAt: periodEndsAt,
        },
      });

      // Generate SaaS Subscription Invoice
      const invoiceNumber = `SAAS-INV-${Date.now()}`;
      const invoice = await this.prisma.db.subscriptionInvoice.create({
        data: {
          subscriptionId: subscription.id,
          invoiceNumber,
          amountSar: basePrice,
          vatAmountSar: vatAmount,
          totalAmountSar: totalAmount,
          status: 'PAID',
          paidAt: new Date(),
        },
      });

      return {
        subscription,
        invoice,
        paymentResult: paymentRes,
      };
    });
  }

  async getInvoices(organizationId: string) {
    return TenantContext.run({ tenantId: organizationId }, async () => {
      const sub = await this.prisma.db.tenantSubscription.findUnique({
        where: { organizationId },
      });

      if (!sub) return [];

      return this.prisma.db.subscriptionInvoice.findMany({
        where: { subscriptionId: sub.id },
        orderBy: { createdAt: 'desc' },
      });
    });
  }
}
