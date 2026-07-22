import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { PlansService } from '../plans/plans.service';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { PermissionsGuard } from '../../shared/guards/permissions.guard';
import { Permissions } from '../../shared/decorators/permissions.decorator';
import { SubscriptionTier } from '@prisma/client';

@Controller('billing')
@UseGuards(AuthGuard, PermissionsGuard)
export class BillingController {
  constructor(
    private readonly plansService: PlansService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @Get('plans')
  @Permissions('billing.plans.view')
  async getPlans() {
    const plans = await this.plansService.getAllPlans();
    return { success: true, plans };
  }

  @Get('subscription')
  @Permissions('billing.subscription.view')
  async getSubscription(@Req() req: any) {
    const organizationId = req.user?.organizationId || req.tenantId;
    const subscription = await this.subscriptionService.getSubscription(organizationId);
    return { success: true, subscription };
  }

  @Post('subscribe')
  @Permissions('billing.subscription.update')
  async subscribe(
    @Req() req: any,
    @Body('tier') tier: SubscriptionTier,
    @Body('billingCycle') billingCycle: 'monthly' | 'annual',
    @Body('paymentMethod') paymentMethod: any,
  ) {
    const organizationId = req.user?.organizationId || req.tenantId;
    const result = await this.subscriptionService.subscribeOrUpgrade({
      organizationId,
      tier,
      billingCycle,
      paymentMethod,
    });
    return { success: true, result };
  }

  @Get('invoices')
  @Permissions('billing.invoices.view')
  async getInvoices(@Req() req: any) {
    const organizationId = req.user?.organizationId || req.tenantId;
    const invoices = await this.subscriptionService.getInvoices(organizationId);
    return { success: true, invoices };
  }
}
