import { Module } from '@nestjs/common';
import { PrismaModule } from '../shared/database/prisma.module';
import { PlansService } from './plans/plans.service';
import { EntitlementService } from './entitlements/entitlement.service';
import { PaymentGatewayAdapter } from './payment/payment-gateway.adapter';
import { SubscriptionService } from './subscription/subscription.service';
import { BillingController } from './subscription/subscription.controller';

@Module({
  imports: [PrismaModule],
  controllers: [BillingController],
  providers: [
    PlansService,
    EntitlementService,
    PaymentGatewayAdapter,
    SubscriptionService,
  ],
  exports: [
    PlansService,
    EntitlementService,
    PaymentGatewayAdapter,
    SubscriptionService,
  ],
})
export class BillingModule {}
